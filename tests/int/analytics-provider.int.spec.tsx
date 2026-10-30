import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  get_distinct_id: vi.fn(() => 'browser-anonymous'),
}))
vi.mock('posthog-js', () => ({ default: sdk }))
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@/lib/site/replay/recorder', () => ({ trackOfficialReplay: vi.fn() }))
import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { writeStoredConsent } from '@/lib/site/consent'
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.clearAllMocks()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
it('captures the first website page after async config and explicit consent without another navigation', async () => {
  let resolve!: (value: Response) => void
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((r) => {
          resolve = r
        }),
    ),
  )
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  expect(sdk.capture.mock.calls.some(([event]) => event === 'official_page_viewed')).toBe(false)
  await act(async () =>
    resolve(
      Response.json({
        enabled: true,
        projectKey: 'public-capture',
        apiHost: 'https://analytics.test',
      }),
    ),
  )
  expect(sdk.init).not.toHaveBeenCalled()
  act(() => writeStoredConsent(true, true, true))
  await waitFor(() =>
    expect(sdk.capture.mock.calls.some(([event]) => event === 'official_page_viewed')).toBe(true),
  )
  expect(sdk.capture.mock.calls.filter(([event]) => event === 'official_page_viewed')).toHaveLength(
    1,
  )
})
it('records the first page when consent already exists but config arrives later', async () => {
  writeStoredConsent(true, true, true)
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json({
        enabled: true,
        projectKey: 'public-capture',
        apiHost: 'https://analytics.test',
      }),
    ),
  )
  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )
  await waitFor(() =>
    expect(sdk.capture.mock.calls.some(([event]) => event === 'official_page_viewed')).toBe(true),
  )
})
