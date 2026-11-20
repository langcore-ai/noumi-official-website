import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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

it('opens desktop submenus on mouse hover while leaving touch menus click-driven', () => {
  const menu = {
    enabled: true,
    header: [
      {
        label: 'Features',
        href: '/features',
        children: [{ label: 'Security', href: '/security' }],
      },
    ],
  } as MenuSetting
  const { container, unmount } = render(<OfficialHomeHeader menu={menu} />)
  const desktop = container.querySelector<HTMLDetailsElement>('.site-nav details')!
  const mobile = container.querySelector<HTMLDetailsElement>('.mobile-nav details')!
  const pointer = (target: Element, type: string, pointerType: string) => {
    const event = new Event(type, { bubbles: true })
    Object.defineProperty(event, 'pointerType', { value: pointerType })
    fireEvent(target, event)
  }
  expect(desktop.querySelectorAll('.managed-nav-children a')).toHaveLength(1)
  expect(mobile.querySelectorAll('.managed-nav-children a')).toHaveLength(1)
  expect(desktop.querySelector('a[href="/features"]')).toBeNull()
  pointer(desktop, 'pointerover', 'mouse')
  expect(desktop.open).toBe(true)
  pointer(desktop, 'pointerout', 'mouse')
  expect(desktop.open).toBe(false)
  pointer(desktop, 'pointerover', 'touch')
  expect(desktop.open).toBe(false)
  pointer(mobile, 'pointerover', 'mouse')
  expect(mobile.open).toBe(false)
  pointer(desktop, 'pointerover', 'mouse')
  fireEvent.keyDown(desktop, { key: 'Escape' })
  expect(desktop.open).toBe(false)
  pointer(desktop, 'pointerover', 'mouse')
  fireEvent.click(desktop.querySelector('a[href="/security"]')!)
  expect(desktop.open).toBe(false)
  unmount()
})

it('keeps English selected when unavailable footer languages are clicked', () => {
  const { unmount } = render(<OfficialHomeFooter />)
  fireEvent.click(screen.getByRole('button', { name: 'Language: English' }))
  expect(screen.getAllByRole('option')).toHaveLength(20)
  const chinese = screen.getByRole('option', { name: '简体中文' })
  expect(chinese.getAttribute('aria-disabled')).toBe('true')
  fireEvent.click(chinese)
  expect(
    screen.getByRole('button', { name: 'Language: English' }).getAttribute('aria-expanded'),
  ).toBe('true')
  expect(screen.getByRole('option', { name: 'English' }).getAttribute('aria-selected')).toBe('true')
  fireEvent.keyDown(chinese, { key: 'Escape' })
  expect(screen.queryByRole('listbox')).toBeNull()
  unmount()
})
it('copies the Company email and reports success only after clipboard confirmation', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const { unmount, container } = render(<OfficialHomeFooter />)
  expect(container.querySelector('.footer-free-cta')).toBeNull()
  expect(screen.getByRole('link', { name: 'YouTube' }).getAttribute('href')).toContain('@Noumi-AI')
  // The address stays a real link so it works without JavaScript.
  expect(screen.getByRole('link', { name: 'Contact us' }).getAttribute('href')).toBe(
    'mailto:official@noumi.ai',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Copy official@noumi.ai' }))
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('Copied: official@noumi.ai'),
  )
  expect(writeText).toHaveBeenCalledWith('official@noumi.ai')
  unmount()
})
it('copies the email on internal HTTP using the clipboard fallback', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
  const execCommand = vi.fn().mockReturnValue(true)
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
  const { unmount } = render(<OfficialHomeFooter />)
  fireEvent.click(screen.getByRole('button', { name: 'Copy official@noumi.ai' }))
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toBe('Copied: official@noumi.ai'),
  )
  expect(execCommand).toHaveBeenCalledWith('copy')
  expect(document.querySelector('textarea')).toBeNull()
  unmount()
})

it('shows the copy confirmation outside the footer and dismisses it after four seconds', async () => {
  vi.useFakeTimers()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const { unmount, container } = render(<OfficialHomeFooter />)
  try {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy official@noumi.ai' }))
    })
    const toast = screen.getByRole('status')
    expect(document.body.contains(toast)).toBe(true)
    expect(container.contains(toast)).toBe(false)
    act(() => {
      vi.advanceTimersByTime(3999)
    })
    expect(screen.getByRole('status')).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByRole('status')).toBeNull()
  } finally {
    unmount()
    vi.useRealTimers()
  }
})
