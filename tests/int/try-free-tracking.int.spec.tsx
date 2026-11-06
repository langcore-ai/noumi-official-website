import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StrictMode } from 'react'
import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { normalizeGtmContainerId } from '@/lib/site/analytics-management'
import type { PublicOfficialAnalyticsConfig } from '@/lib/site/analytics'
import { getTryFreeClickPayload } from '@/lib/site/try-free-tracking'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from '@/lib/site/consent'

vi.mock('next/navigation', () => ({ usePathname: () => window.location.pathname }))
vi.mock('posthog-js', () => ({ default: { init: vi.fn(), capture: vi.fn() } }))
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
    vi.fn().mockResolvedValue({
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
  document.getElementById('noumi-official-gtm')?.remove()
  document.getElementById('noumi-official-google-tag')?.remove()
  vi.unstubAllGlobals()
})
const mount = async (gtmContainerId?: string) => {
  let view: ReturnType<typeof render>
  await act(async () => {
    view = render(
      <StrictMode>
        <OfficialAnalyticsProvider gtmContainerId={gtmContainerId}>
          <button data-track-action="try_free" data-track-location="hero">
            Try Noumi Free<span aria-hidden="true">→</span>
          </button>
        </OfficialAnalyticsProvider>
      </StrictMode>,
    )
  })
  return view!
}
const directClicks = () =>
  google.dataLayer?.filter(
    (entry) => Array.isArray(entry) && entry[0] === 'event' && entry[1] === 'try_free_click',
  )
const gtmClicks = () =>
  google.dataLayer?.filter(
    (entry) => !Array.isArray(entry) && (entry as { event?: string }).event === 'try_free_click',
  )

describe('free trial tracking', () => {
  it('sends exactly one direct GA event without PostHog or GTM, using the current clean URL', async () => {
    consent(true)
    const view = await mount()
    window.history.pushState(null, '', '/features?email=private#secret')
    fireEvent.click(view.container.querySelector('span')!)
    expect(directClicks()).toHaveLength(1)
    expect(directClicks()?.[0]).toEqual([
      'event',
      'try_free_click',
      expect.objectContaining({
        page_location: 'https://noumi.test/features',
        button_location: 'hero',
      }),
    ])
    expect(gtmClicks()).toHaveLength(0)
  })
  it('queues one GTM event instead of a direct event and installs the container only once', async () => {
    consent(true)
    const view = await mount('GTM-TEST123')
    fireEvent.click(view.getByRole('button'))
    expect(gtmClicks()).toHaveLength(1)
    expect(directClicks()).toHaveLength(0)
    expect(document.querySelectorAll('#noumi-official-gtm')).toHaveLength(1)
  })
  it('honors consent changes immediately and cleans up the listener', async () => {
    const view = await mount('GTM-TEST123')
    fireEvent.click(view.getByRole('button'))
    expect(gtmClicks()).toHaveLength(0)
    act(() => consent(true))
    fireEvent.click(view.getByRole('button'))
    expect(gtmClicks()).toHaveLength(1)
    act(() => consent(false))
    fireEvent.click(view.getByRole('button'))
    expect(gtmClicks()).toHaveLength(1)
    view.unmount()
    const button = document.createElement('button')
    button.textContent = 'Try Noumi Free'
    document.body.appendChild(button)
    act(() => consent(true))
    fireEvent.click(button)
    expect(gtmClicks()).toHaveLength(1)
    button.remove()
  })
  it('covers CMS links with matching labels while excluding unrelated actions', () => {
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

describe('analytics configuration boundaries', () => {
  it('accepts only GTM web container IDs', () => {
    expect(normalizeGtmContainerId(' GTM-ABC123 ')).toBe('GTM-ABC123')
    for (const id of ['G-ABC123', '<script>', 'GTM-A&x=1', ''])
      expect(normalizeGtmContainerId(id)).toBeNull()
  })
})
