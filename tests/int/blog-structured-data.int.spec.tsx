import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { StructuredData } from '@/components/site/StructuredData'
import { validateBlogStructuredData } from '@/fields/blogStructuredData'
import BlogPostPage from '@/app/(frontend)/blog/[slug]/page'
import { getOfficialBlogPost } from '@/lib/site/official-cms'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))

vi.mock('@/lib/site/managed-settings', () => ({
  getManagedJsonLd: async (_path: string, fallback: object) => fallback,
  createManagedMetadata: vi.fn(),
}))

vi.mock('@/lib/site/official-cms', () => ({ getOfficialBlogPost: vi.fn() }))

const data = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'An article',
}

describe('blog JSON-LD', () => {
  it('escapes script termination while preserving JSON data', () => {
    const malicious = { ...data, headline: '</script><script>alert(1)</script>' }
    const html = renderToStaticMarkup(createElement(StructuredData, { data: malicious }))
    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect(doc.querySelectorAll('script')).toHaveLength(1)
    expect(JSON.parse(doc.querySelector('script')!.textContent!)).toEqual(malicious)
    expect(html).toContain('\\u003c/script>')
  })

  it('accepts objects, graphs and arrays, and rejects scalar data', async () => {
    for (const value of [
      null,
      data,
      [data],
      { '@context': 'https://schema.org', '@graph': [data] },
    ]) {
      expect(validateBlogStructuredData(value)).toBe(true)
    }
    for (const value of [
      '<script>bad</script>',
      JSON.stringify(data),
      1,
      false,
      [],
      [null],
    ] as unknown[]) {
      expect(validateBlogStructuredData(value)).not.toBe(true)
    }
  })

  it.each(['markdown', 'template', 'html'] as const)(
    'outputs JSON-LD in %s server HTML',
    async (renderMode) => {
      vi.mocked(getOfficialBlogPost).mockResolvedValue({
        slug: 'test',
        title: 'Test',
        renderMode,
        structuredData: data,
        excerpt: 'Card summary',
        markdownContent: 'Actual body',
        htmlContent: '<p>HTML body</p>',
        tags: [],
        sections: [],
        faqItems: [],
        relatedPosts: [],
        coverImage: null,
        ogImage: null,
      })
      const html = renderToStaticMarkup(
        await BlogPostPage({ params: Promise.resolve({ slug: 'test' }) }),
      )
      const doc = new DOMParser().parseFromString(html, 'text/html')
      expect(
        JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!),
      ).toEqual(data)
      if (renderMode === 'markdown') {
        expect(doc.querySelector('.blog-article-lead')?.textContent).toBe('Card summary')
        expect(doc.querySelector('.blog-article-body')?.textContent).toContain('Actual body')
        expect(doc.querySelector('.blog-article-body')?.textContent).not.toContain('Card summary')
      }
    },
  )

  it('does not output a script or summary when both are empty', async () => {
    vi.mocked(getOfficialBlogPost).mockResolvedValue({
      slug: 'test',
      title: 'Test',
      renderMode: 'markdown',
      markdownContent: 'Actual body',
      tags: [],
      sections: [],
      faqItems: [],
      relatedPosts: [],
      coverImage: null,
      ogImage: null,
    })
    const html = renderToStaticMarkup(
      await BlogPostPage({ params: Promise.resolve({ slug: 'test' }) }),
    )
    expect(html).not.toContain('application/ld+json')
    expect(html).not.toContain('blog-article-lead')
  })
})
