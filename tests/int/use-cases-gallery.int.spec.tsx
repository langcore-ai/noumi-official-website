import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { OfficialUseCasesGallery } from '@/components/site/official/OfficialUseCasesGallery'
import content from '@/components/site/official/use-cases/content.json'

beforeEach(() => {
  window.history.replaceState(null, '', '/use-cases')
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('hover:hover'),
    addEventListener() {},
    removeEventListener() {},
  }))
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  HTMLElement.prototype.scrollTo = vi.fn()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  // jsdom has no native dialog top layer; the actual :modal state is checked in browser QA.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = true
      }),
    },
    close: {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.open = false
        this.dispatchEvent(new Event('close'))
      }),
    },
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('renders native case content and switches all 12 cases on hover without fetching markup', () => {
  const { container } = render(<OfficialUseCasesGallery />)
  expect(container.querySelector('iframe')).toBeNull()
  for (const item of content.cases) {
    const link = container.querySelector(`[data-case="${item.id}"].showcase-case-link`)!
    fireEvent.pointerMove(link, { pointerType: 'mouse' })
    expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe(
      String(item.id),
    )
    expect(link.getAttribute('aria-current')).toBe('page')
    expect(container.querySelectorAll('[data-choose]')).toHaveLength(item.data.outputs.length)
    expect(container.querySelector('.retrieval-intro')?.textContent).toBe(item.data.retrieval_intro)
    expect(container.querySelectorAll('.memory')).toHaveLength(item.data.memory ? 1 : 0)
  }
  expect(window.location.search).toBe('')
})

it('switches cases on click without changing the URL or adding browser history', () => {
  const push = vi.spyOn(window.history, 'pushState')
  const initialLength = window.history.length
  const { container } = render(<OfficialUseCasesGallery />)
  fireEvent.click(container.querySelector('.showcase-case-link[data-case="5"]')!)
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('5')
  expect(window.location.pathname + window.location.search).toBe('/use-cases')
  fireEvent.click(container.querySelector('.showcase-case-link[data-case="9"]')!)
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('9')
  expect(window.location.pathname + window.location.search).toBe('/use-cases')
  expect(push).not.toHaveBeenCalled()
  expect(window.history.length).toBe(initialLength)
  expect(container.querySelector('.hero-cta')?.getAttribute('href')).toBe(
    'https://www.noumi.ai/auth',
  )
})

it('opens legacy case URLs and removes only the case parameter without losing history state', () => {
  window.history.replaceState({ existing: true }, '', '/use-cases?case=12&source=demo#gallery')
  const { container } = render(<OfficialUseCasesGallery />)
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('12')
  expect(window.location.search + window.location.hash).toBe('?source=demo#gallery')
  expect(window.history.state).toEqual({ existing: true })
  act(() => {
    window.history.replaceState({ existing: true }, '', '/use-cases?case=5')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('5')
  expect(window.location.pathname + window.location.search).toBe('/use-cases')
})

it('returns to the case start before a deep-page switch can move the sticky navigation', () => {
  const { container } = render(<OfficialUseCasesGallery />)
  const stage = container.querySelector<HTMLElement>('.showcase-stage')!
  const bounds = vi.spyOn(stage, 'getBoundingClientRect')
  bounds.mockReturnValue({ top: 250 } as DOMRect)
  fireEvent.pointerMove(container.querySelector('.showcase-case-link[data-case="3"]')!)
  expect(window.scrollTo).not.toHaveBeenCalled()

  bounds.mockReturnValue({ top: -555 } as DOMRect)
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(850)
  fireEvent.pointerMove(container.querySelector('.showcase-case-link[data-case="1"]')!)
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 213, behavior: 'instant' })
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('1')

  vi.mocked(window.scrollTo).mockClear()
  fireEvent.pointerMove(container.querySelector('.showcase-case-link[data-case="1"]')!)
  expect(window.scrollTo).not.toHaveBeenCalled()
})

it('ignores pointer entry caused by layout moving another case under a stationary cursor', () => {
  const { container } = render(<OfficialUseCasesGallery />)
  const target = container.querySelector('.showcase-case-link[data-case="9"]')!
  const shifted = container.querySelector('.showcase-case-link[data-case="2"]')!
  fireEvent.pointerMove(target, { pointerType: 'mouse' })
  fireEvent.pointerEnter(shifted, { pointerType: 'mouse' })
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('9')
  fireEvent.pointerMove(shifted, { pointerType: 'mouse' })
  expect(container.querySelector('#se-case-view')?.getAttribute('data-case')).toBe('2')
})

it('opens a genuine modal and keeps the preview in its original place', () => {
  const { container } = render(<OfficialUseCasesGallery />)
  const dialog = container.querySelector<HTMLDialogElement>('dialog')!
  const show = vi.spyOn(dialog, 'showModal')
  const source = container.querySelector<HTMLButtonElement>('.page-image')!
  fireEvent.click(source)
  expect(show).toHaveBeenCalledOnce()
  expect(dialog.open).toBe(true)
  expect(container.querySelectorAll('.preview-carousel')).toHaveLength(1)
  fireEvent.click(container.querySelector('#se-close-preview')!)
  expect(dialog.open).toBe(false)
})
