import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@/lib/site/replay/recorder', () => ({ trackOfficialReplay: vi.fn() }))

import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
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

it('sends nothing before consent even when analytics is enabled', async () => {
  stubRelayFetch(true)
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

it('stops sending after consent is withdrawn and rotates the anonymous id', async () => {
  stubRelayFetch(true)
  writeStoredConsent(true, true, true)
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() => expect(relayPayloads.length).toBeGreaterThan(0))
  const firstAnonymousId = relayPayloads[0]?.events[0]?.anonymousId

  const before = relayPayloads.length
  act(() => writeStoredConsent(true, true, false))
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120))
  })
  expect(relayPayloads).toHaveLength(before)

  act(() => writeStoredConsent(true, true, true))
  await waitFor(() => expect(relayPayloads.length).toBeGreaterThan(before))
  const afterAnonymousId = relayPayloads[before]?.events[0]?.anonymousId
  expect(afterAnonymousId).not.toBe(firstAnonymousId)
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
