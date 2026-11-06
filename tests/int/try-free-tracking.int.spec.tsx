import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StrictMode } from 'react'
import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { getTryFreeClickPayload } from '@/lib/site/try-free-tracking'
import type { PublicOfficialAnalyticsConfig } from '@/lib/site/analytics'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from '@/lib/site/consent'
vi.mock('next/navigation', () => ({ usePathname: () => window.location.pathname }))
vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture: vi.fn() } }))
vi.mock('@/lib/site/replay/recorder', () => ({ trackOfficialReplay: vi.fn() }))
const google = window as typeof window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  noumiOfficialGoogleTagBootstrapped?: boolean
}
const consent = (analytics: boolean) => {
  localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({ version: COOKIE_CONSENT_VERSION, analytics }),
  )
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
}
beforeEach(() => {
  localStorage.clear()
  google.dataLayer = []
  delete google.gtag
  delete google.noumiOfficialGoogleTagBootstrapped
  window.history.replaceState(null, '', '/')
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async (): Promise<PublicOfficialAnalyticsConfig> => ({
          enabled: false,
          projectKey: null,
          apiHost: null,
          uiHost: null,
        }),
      }),
  )
})
afterEach(() => {
  cleanup()
  document.getElementById('noumi-official-google-tag')?.remove()
  vi.unstubAllGlobals()
})
const mount = async (statisticsEnabled = true) => {
  let view: ReturnType<typeof render>
  await act(async () => {
    view = render(
      <StrictMode>
        <OfficialAnalyticsProvider statisticsEnabled={statisticsEnabled}>
          <button data-analytics-cta-id="home_hero_try_free" data-analytics-placement="hero">
            Try Noumi Free<span>→</span>
          </button>
        </OfficialAnalyticsProvider>
      </StrictMode>,
    )
  })
  return view!
}
const clicks = () =>
  google.dataLayer?.filter(
    (x) => !Array.isArray(x) && (x as { event?: string }).event === 'try_free_click',
  )
describe('GTM free trial tracking', () => {
  it('queues exactly one event with current clean page even with PostHog disabled', async () => {
    consent(true)
    const view = await mount()
    window.history.pushState(null, '', '/features?email=private#token')
    fireEvent.click(view.container.querySelector('span')!)
    expect(clicks()).toHaveLength(1)
    expect(clicks()?.[0]).toMatchObject({
      event: 'try_free_click',
      page_location: 'https://noumi.test/features',
      button_location: 'hero',
      cta_id: 'home_hero_try_free',
    })
    expect(
      google.dataLayer?.filter(
        (x) => Array.isArray(x) && x[0] === 'event' && x[1] === 'try_free_click',
      ),
    ).toHaveLength(0)
    expect(document.querySelector('script[src*="gtm.js"]')).toBeNull()
  })
  it('tracks consent grants and revocations without replaying previous clicks', async () => {
    const view = await mount()
    fireEvent.click(view.getByRole('button'))
    expect(clicks()).toHaveLength(0)
    act(() => consent(true))
    fireEvent.click(view.getByRole('button'))
    expect(clicks()).toHaveLength(1)
    act(() => consent(false))
    fireEvent.click(view.getByRole('button'))
    expect(clicks()).toHaveLength(1)
  })
  it('does not track clicks or load Google scripts in test environments', async () => {
    consent(true)
    const view = await mount(false)
    fireEvent.click(view.getByRole('button'))
    expect(google.dataLayer).toEqual([])
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull()
  })
  it('removes its listener on unmount', async () => {
    consent(true)
    const view = await mount()
    view.unmount()
    const button = document.createElement('button')
    button.textContent = 'Try Noumi Free'
    document.body.appendChild(button)
    fireEvent.click(button)
    expect(clicks()).toHaveLength(0)
    button.remove()
  })
  it('recognizes CMS links and excludes explicitly different actions', () => {
    const div = document.createElement('div')
    div.innerHTML = '<footer><a href="/auth">Try Noumi free <span>→</span></a></footer>'
    expect(getTryFreeClickPayload(div.querySelector('span'))).toMatchObject({
      button_location: 'footer',
    })
    div.querySelector('a')!.dataset.trackAction = 'book_demo'
    expect(getTryFreeClickPayload(div.querySelector('span'))).toBeNull()
    expect(getTryFreeClickPayload(document.createTextNode('Try Noumi Free'))).toBeNull()
  })
})
