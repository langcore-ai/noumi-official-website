import { describe, expect, it } from 'vitest'

import { convertLegacyBlogArticle } from '../../scripts/lib/legacy-blog-html'

/** 构造与生产旧文章同构的最小整页 HTML。 */
function legacyArticle(overrides: { body: string; faq?: string; lead?: string } = { body: '' }) {
  const lead = overrides.lead ?? 'A lead paragraph that introduces the article.'
  const faq =
    overrides.faq ??
    `<div class="faq-wrap">
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false">Is it free?<span class="faq-icon" aria-hidden="true">+</span></button>
        <div class="faq-a" role="region">
          <div class="faq-a-inner"><strong>Yes.</strong> The free tier is enough to start.</div>
        </div>
      </div>
    </div>`

  return `<!DOCTYPE html>
<html lang="en">
<head><title>Legacy</title><style>.post-body { color: red; }</style></head>
<body>
<main class="post-wrap">
  <div class="post-breadcrumb"><a href="/">Home</a></div>
  <p class="post-lead">${lead}</p>
  <h1 class="post-title">Legacy Article Title</h1>
  <div class="post-body reveal d2">
    <div class="post-callout"><strong>Note:</strong> keep this highlight.</div>
    ${overrides.body}
  </div>
  ${faq}
  <section class="post-more-section"><div class="post-more-top">More from the blog</div></section>
</main>
<script>console.log('legacy')</script>
</body>
</html>`
}

describe('convertLegacyBlogArticle', () => {
  it('keeps the lead, body and FAQ while dropping scaffold and scripts', () => {
    const result = convertLegacyBlogArticle(
      legacyArticle({
        body: '<h2>Section</h2><p>Body paragraph with <a href="/blog">a link</a>.</p>',
      }),
    )

    expect(result.markdown).toContain('A lead paragraph that introduces the article.')
    expect(result.markdown).toContain('## Section')
    expect(result.markdown).toContain('[a link](/blog)')
    expect(result.markdown).not.toContain('Legacy Article Title')
    expect(result.markdown).not.toContain('More from the blog')
    expect(result.audit.removed.scripts).toBe(1)
    expect(result.audit.removed.styles).toBe(1)
    expect(result.faqItems).toEqual([
      { question: 'Is it free?', answer: '**Yes.** The free tier is enough to start.' },
    ])
    expect(result.audit.warnings).not.toContain('未抽取到 FAQ 条目')
  })

  it('converts callouts into blockquotes and keeps tables', () => {
    const result = convertLegacyBlogArticle(
      legacyArticle({
        body: '<div class="post-table-wrap"><table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table></div>',
      }),
    )

    expect(result.markdown).toContain('> **Note:** keep this highlight.')
    expect(result.audit.callouts).toBe(1)
    expect(result.audit.tables).toBe(1)
    expect(result.markdown).toContain('| A |')
  })

  it('does not duplicate the lead when the body repeats it', () => {
    const lead = 'Repeated introduction paragraph.'
    const result = convertLegacyBlogArticle(
      legacyArticle({ lead, body: `<p>${lead}</p><p>Second paragraph.</p>` }),
    )

    expect(result.markdown.split('Repeated introduction paragraph.').length - 1).toBe(1)
    expect(result.markdown).toContain('Second paragraph.')
  })

  it('reports articles without FAQ or body instead of failing', () => {
    const result = convertLegacyBlogArticle(
      `<html><head><style>.x{}</style></head><body><div>Loose content without post-body.</div></body></html>`,
    )

    expect(result.faqItems).toEqual([])
    expect(result.audit.warnings).toContain('未抽取到 FAQ 条目')
    expect(result.audit.warnings.some((warning) => warning.includes('未找到 .post-body'))).toBe(
      true,
    )
  })
})
