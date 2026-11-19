import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@/lib/site/replay/recorder', () => ({ trackOfficialReplay: vi.fn() }))

import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { clearOfficialFirstTouch } from '@/lib/site/attribution'
import { writeStoredConsent } from '@/lib/site/consent'

type RelayBody = {
  events: Array<{
    anonymousId: string
    event: string
    eventId: string
    occurredAt: string
    properties: Record<string, unknown>
  }>
}

const relayPayloads: RelayBody[] = []

/**
 * 拦截官网同源接口：config 返回开关，events 记录批次。
 *
 * @param enabled 埋点开关
 * @returns fetch 实现
 */
function stubRelayFetch(enabled: boolean) {
  const impl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/api/site/analytics/config')) {
      return Response.json({ enabled })
    }
    if (url.endsWith('/api/site/analytics/events')) {
      relayPayloads.push(JSON.parse(String(init?.body)) as RelayBody)
      return new Response(null, { status: 204 })
    }
    return new Response(null, { status: 404 })
  })
  vi.stubGlobal('fetch', impl)
  return impl
}

beforeEach(() => {
  localStorage.clear()
  clearOfficialFirstTouch()
  window.history.replaceState({}, '', '/')
  sessionStorage.clear()
  relayPayloads.length = 0
  document.cookie = 'noumi_analytics_consent=; Path=/; Max-Age=0'
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('sends the first page view through the same-origin relay after consent', async () => {
  const fetchImpl = stubRelayFetch(true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() =>
    expect(fetchImpl.mock.calls.some(([url]) => String(url).includes('/config'))).toBe(true),
  )
  expect(relayPayloads).toHaveLength(0)

  act(() => writeStoredConsent(true, true, true))

  await waitFor(() =>
    expect(relayPayloads.flatMap((payload) => payload.events.map((e) => e.event))).toContain(
      '$pageview',
    ),
  )
  const events = relayPayloads.flatMap((payload) => payload.events)
  expect(events.filter((event) => event.event === '$pageview')).toHaveLength(1)
  expect(events.filter((event) => event.event === 'landing_page_viewed')).toHaveLength(1)

  const configCall = fetchImpl.mock.calls.find(([url]) => String(url).includes('/config'))
  const eventsCall = fetchImpl.mock.calls.find(([url]) => String(url).includes('/events'))
  expect(configCall?.[1]).toMatchObject({ cache: 'no-store' })
  expect(eventsCall?.[1]).toMatchObject({
    credentials: 'same-origin',
    keepalive: true,
    method: 'POST',
  })
  expect((eventsCall?.[1]?.headers as Record<string, string>)['x-noumi-analytics']).toBe('1')
})

it('sends events before any cookie choice is made', async () => {
  stubRelayFetch(true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() => expect(relayPayloads.length).toBeGreaterThan(0))
  const events = relayPayloads.flatMap((payload) => payload.events)
  expect(events.filter((event) => event.event === '$pageview')).toHaveLength(1)
  expect(events.filter((event) => event.event === 'landing_page_viewed')).toHaveLength(1)
})

it('keeps sending after the Necessary-only choice', async () => {
  stubRelayFetch(true)
  render(
    <OfficialAnalyticsProvider>
      <a
        data-analytics-cta-id="pricing_card"
        data-analytics-event="official_cta_clicked"
        href="#pricing"
        id="necessary-cta"
      >
        Pricing
      </a>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() => expect(relayPayloads.length).toBeGreaterThan(0))
  const firstAnonymousId = relayPayloads[0]?.events[0]?.anonymousId

  act(() => writeStoredConsent(false, true, false))
  act(() => {
    const link = document.getElementById('necessary-cta') as HTMLAnchorElement
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })

  await waitFor(() =>
    expect(
      relayPayloads
        .flatMap((payload) => payload.events)
        .some((event) => event.event === 'official_cta_clicked'),
    ).toBe(true),
  )

  const ctaEvent = relayPayloads
    .flatMap((payload) => payload.events)
    .find((event) => event.event === 'official_cta_clicked')
  // 关闭可选 cookie 不轮换身份，前后仍属同一访客。
  expect(ctaEvent?.anonymousId).toBe(firstAnonymousId)
})

it('sends nothing when the relay config is disabled', async () => {
  stubRelayFetch(false)
  writeStoredConsent(true, true, true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120))
  })
  expect(relayPayloads).toHaveLength(0)
})

it('never exposes the PostHog project key to the browser config', async () => {
  const fetchImpl = stubRelayFetch(true)
  writeStoredConsent(true, true, true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() =>
    expect(fetchImpl.mock.calls.some(([url]) => String(url).includes('/config'))).toBe(true),
  )
  expect(JSON.stringify(fetchImpl.mock.calls.map(([url]) => String(url)))).not.toContain('posthog')
})

it('attaches first-touch UTM context to every relayed event', async () => {
  window.history.replaceState(
    {},
    '',
    '/?utm_source=linkedin&utm_medium=social&utm_campaign=q4',
  )
  stubRelayFetch(true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() => expect(relayPayloads).toHaveLength(0))

  act(() => writeStoredConsent(true, true, true))
  await waitFor(() => expect(relayPayloads.length).toBeGreaterThan(0))

  const pageView = relayPayloads
    .flatMap((payload) => payload.events)
    .find((event) => event.event === '$pageview')
  expect(pageView?.properties).toMatchObject({
    first_touch_campaign: 'q4',
    first_touch_landing_page: '/',
    first_touch_medium: 'social',
    first_touch_source: 'linkedin',
    utm_campaign: 'q4',
    utm_medium: 'social',
    utm_source: 'linkedin',
  })
})

it('adds attribution params when a product CTA is clicked', async () => {
  window.history.replaceState({}, '', '/?utm_source=newsletter&utm_campaign=apollo')
  stubRelayFetch(true)
  act(() => writeStoredConsent(true, true, true))

  render(
    <OfficialAnalyticsProvider>
      <a
        data-analytics-cta-id="home_hero_try_free"
        data-analytics-event="official_cta_clicked"
        data-analytics-placement="hero"
        href="https://www.noumi.ai/auth"
        id="cta"
      >
        Try Noumi Free
      </a>
    </OfficialAnalyticsProvider>,
  )

  const link = document.getElementById('cta') as HTMLAnchorElement
  act(() => {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })

  const params = new URL(link.href).searchParams
  expect(params.get('utm_source')).toBe('newsletter')
  expect(params.get('utm_campaign')).toBe('apollo')
  expect(params.get('first_touch_source')).toBe('newsletter')
  expect(params.get('official_cta_id')).toBe('home_hero_try_free')
  expect(params.get('source_surface')).toBe('official')
})

it('keeps the landing UTM after in-app navigation and later consent', async () => {
  window.history.replaceState({}, '', '/?utm_source=cold-email&utm_campaign=apollo')
  stubRelayFetch(true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() => expect(relayPayloads).toHaveLength(0))

  // 用户先站内翻页，之后才在 cookie 面板同意。
  act(() => {
    window.history.pushState({}, '', '/pricing')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  act(() => writeStoredConsent(true, true, true))
  await waitFor(() => expect(relayPayloads.length).toBeGreaterThan(0))

  const pageView = relayPayloads
    .flatMap((payload) => payload.events)
    .find((event) => event.event === '$pageview')
  expect(pageView?.properties).toMatchObject({
    first_touch_campaign: 'apollo',
    first_touch_landing_page: '/',
    first_touch_source: 'cold-email',
  })
})
