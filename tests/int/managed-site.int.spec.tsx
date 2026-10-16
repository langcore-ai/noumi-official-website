import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { publicPath, resolveManagedRedirect, safeHref } from '@/lib/site/managed-routing'
import {
  OfficialHomeHeader,
  OfficialHomeFooter,
} from '@/components/site/official/OfficialHomeChrome'
import type { MenuSetting } from '@/payload-types'

vi.mock('server-only', () => ({}))
const find = vi.hoisted(() => vi.fn())
const findGlobal = vi.hoisted(() => vi.fn())
vi.mock('@/lib/site/payload-client', () => ({
  getSitePayloadClient: async () => ({ find, findGlobal }),
}))
import {
  createManagedMetadata,
  getMenuSettings,
  getManagedJsonLd,
} from '@/lib/site/managed-settings'

describe('managed public routing', () => {
  it('normalizes paths and rejects system routes, external URLs and encoded traversal', () => {
    expect(publicPath('about/')).toBe('/about')
    for (const path of [
      '//evil.test',
      'https://evil.test',
      '/admin',
      '/api/users',
      '/%61dmin',
      '/%2fexample.com',
      '/x/../admin',
      '/a?x=1',
      '/a\\b',
    ])
      expect(() => publicPath(path)).toThrow()
    expect(safeHref('javascript:alert(1)')).toBe(false)
    expect(safeHref('//evil.test')).toBe(false)
  })
  it('collapses chains while preserving the first status and rejects cycles', async () => {
    const rules = new Map([
      ['/old', { target: '/middle', type: '302' }],
      ['/middle', { target: '/new', type: '301' }],
    ])
    const lookup = async (path: string) => rules.get(path) ?? null
    expect(await resolveManagedRedirect('/old', lookup)).toEqual({ target: '/new', type: '302' })
    rules.set('/new', { target: '/old', type: '301' })
    expect(await resolveManagedRedirect('/old', lookup)).toBeNull()
    expect(await resolveManagedRedirect('/missing', lookup)).toBeNull()
  })
})

describe('published metadata and menus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('keeps existing metadata when no override exists and queries published documents', async () => {
    find.mockResolvedValue({ docs: [] })
    const result = await createManagedMetadata({
      pathname: '/about',
      title: 'Original',
      description: 'Original description',
    })
    expect(result.title).toBe('Original')
    expect(find.mock.calls[0][0]).toMatchObject({
      overrideAccess: false,
      draft: false,
      where: { and: [{ path: { equals: '/about' } }, { _status: { equals: 'published' } }] },
    })
  })
  it('overrides SEO, OG, robots and canonical without changing page content', async () => {
    find.mockResolvedValue({
      docs: [
        {
          title: 'SEO title',
          ogTitle: 'Share title',
          noIndex: true,
          canonical: 'https://noumi.ai/preferred',
          keywords: 'one, two',
        },
      ],
    })
    const result = await createManagedMetadata({
      pathname: '/about',
      title: 'Original',
      description: 'Description',
    })
    expect(result).toMatchObject({
      title: 'SEO title',
      openGraph: { title: 'Share title' },
      alternates: { canonical: 'https://noumi.ai/preferred' },
      keywords: ['one', 'two'],
      robots: { index: false, follow: true },
    })
  })
  it('uses published JSON-LD overrides and external OG image URLs', async () => {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Configured page' }
    find.mockResolvedValue({ docs: [{ jsonLd, ogImageUrl: 'https://example.com/share.png' }] })
    expect(await getManagedJsonLd('/pricing', { name: 'Default' })).toEqual(jsonLd)
    const metadata = await createManagedMetadata({
      pathname: '/pricing',
      title: 'Pricing',
      description: 'Plans',
    })
    expect(metadata.openGraph).toMatchObject({ images: [{ url: 'https://example.com/share.png' }] })
    find.mockResolvedValue({ docs: [] })
    expect(await getManagedJsonLd('/about', { name: 'Default' })).toEqual({ name: 'Default' })
  })
  it('does not activate draft or disabled navigation', async () => {
    findGlobal.mockResolvedValue({ enabled: true, _status: 'draft' })
    expect(await getMenuSettings()).toBeNull()
    findGlobal.mockResolvedValue({ enabled: false, _status: 'published' })
    expect(await getMenuSettings()).toBeNull()
  })
  it('renders configured links in desktop/mobile menus, hides disabled links and supports an empty footer', () => {
    const menu: MenuSetting = {
      id: 1,
      enabled: true,
      header: [
        { label: 'Custom', href: '/custom' },
        { label: 'Hidden', href: '/hidden', hidden: true },
      ],
      footer: [],
      copyright: 'Custom copyright',
    }
    const { unmount } = render(
      <>
        <OfficialHomeHeader menu={menu} />
        <OfficialHomeFooter menu={menu} />
      </>,
    )
    expect(screen.getAllByRole('link', { name: 'Custom' })).toHaveLength(2)
    expect(screen.queryByRole('link', { name: 'Hidden' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Product' })).toBeNull()
    expect(screen.getByText('Custom copyright')).toBeTruthy()
    unmount()
  })
})
