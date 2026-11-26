import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const sdk = vi.hoisted(() => ({
  capture: vi.fn(),
  get_distinct_id: vi.fn(),
  init: vi.fn(),
}))

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('posthog-js', () => ({ default: sdk }))
vi.mock('@/lib/site/replay/recorder', () => ({ trackOfficialReplay: vi.fn() }))
vi.mock('@/lib/site/device-fingerprint', () => ({
  readDeviceFingerprint: vi.fn(async () => 'abcdef012345'),
}))

import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { clearOfficialFirstTouch } from '@/lib/site/attribution'
import type { PublicOfficialAnalyticsConfig } from '@/lib/site/analytics'

const VISITOR_ID = '0193f5e0-1111-4111-8111-aaaaaaaaaaaa'

const ENABLED_CONFIG: PublicOfficialAnalyticsConfig = {
  apiHost: '/ingest',
  enabled: true,
  projectKey: 'phc_test',
  uiHost: 'https://us.posthog.com',
}

const DISABLED_CONFIG: PublicOfficialAnalyticsConfig = {
  apiHost: null,
  enabled: false,
  projectKey: null,
  uiHost: null,
}

/**
 * 拦截配置接口。
 * @param config 返回的配置
 * @returns fetch 实现
 */
function stubConfig(config: PublicOfficialAnalyticsConfig) {
  const impl = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).endsWith('/api/site/analytics/config')) {
      return Response.json(config)
    }
    return new Response(null, { status: 404 })
  })
  vi.stubGlobal('fetch', impl)
  return impl
}

/**
 * 写入官网预览域名的访客 Cookie。
 */
function setVisitorCookie() {
  document.cookie = `noumi_visitor_id_preview=${VISITOR_ID}; Path=/`
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  clearOfficialFirstTouch()
  window.history.replaceState({}, '', '/')
  document.cookie = 'noumi_visitor_id_preview=; Path=/; Max-Age=0'
  document.cookie = 'noumi_visitor_id=; Path=/; Max-Age=0'
  setVisitorCookie()
  sdk.capture.mockReset()
  sdk.get_distinct_id.mockReset()
  sdk.get_distinct_id.mockReturnValue(VISITOR_ID)
  sdk.init.mockReset()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('initializes posthog against the same-origin ingest path', async () => {
  const fetchImpl = stubConfig(ENABLED_CONFIG)

  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )

  await waitFor(() => expect(sdk.init).toHaveBeenCalledTimes(1))
  const [projectKey, options] = sdk.init.mock.calls[0]
  expect(projectKey).toBe('phc_test')
  expect(options).toMatchObject({
    advanced_disable_decide: true,
    api_host: '/ingest',
    autocapture: false,
    capture_pageleave: true,
    capture_pageview: 'history_change',
    cross_subdomain_cookie: false,
    disable_session_recording: true,
    disable_surveys: true,
    persistence: 'localStorage',
    persistence_name: 'noumi_website',
    person_profiles: 'always',
    ui_host: 'https://us.posthog.com',
  })
  expect(options.bootstrap).toEqual({ distinctID: VISITOR_ID, isIdentifiedID: false })

  await waitFor(() => expect(sdk.capture).toHaveBeenCalledWith('landing_page_viewed', {}))
  expect(sdk.capture.mock.calls.map(([eventName]) => eventName)).not.toContain('$pageview')
  expect(fetchImpl).toHaveBeenCalledWith(
    '/api/site/analytics/config',
    expect.objectContaining({ cache: 'no-store' }),
  )
})

it('does not initialize when analytics is disabled', async () => {
  const fetchImpl = stubConfig(DISABLED_CONFIG)

  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )

  await waitFor(() => expect(fetchImpl).toHaveBeenCalled())
  await act(async () => {})
  expect(sdk.init).not.toHaveBeenCalled()
  expect(sdk.capture).not.toHaveBeenCalled()
})

it('enriches SDK events without dropping SDK-owned fields', async () => {
  window.history.replaceState({}, '', '/?utm_source=linkedin&utm_medium=social&utm_campaign=q4')
  stubConfig(ENABLED_CONFIG)

  render(
    <OfficialAnalyticsProvider>
      <div>Website</div>
    </OfficialAnalyticsProvider>,
  )

  await waitFor(() => expect(sdk.init).toHaveBeenCalledTimes(1))
  const options = sdk.init.mock.calls[0][1]
  await waitFor(() => expect(options.sanitize_properties({}).device_fp).toBe('abcdef012345'))

  const enriched = options.sanitize_properties({
    $browser: 'Chrome',
    $browser_language: 'en-US',
    $current_url:
      'https://noumi.test/pricing?utm_source=linkedin&utm_medium=social&utm_campaign=q4',
    $pathname: '/pricing',
    $prev_pageview_max_scroll_percentage: 42,
    $referrer: 'https://www.google.com/search?q=noumi',
    gclid: 'test123',
  })

  expect(enriched).toMatchObject({
    $browser: 'Chrome',
    $browser_language: 'en-US',
    $prev_pageview_max_scroll_percentage: 42,
    $referrer: 'https://www.google.com',
    app_source: 'noumi-official',
    device_fp: 'abcdef012345',
    first_touch_campaign: 'q4',
    first_touch_landing_page: '/',
    first_touch_medium: 'social',
    first_touch_source: 'linkedin',
    gclid: 'test123',
    page_group: 'pricing',
    page_path: '/pricing',
    utm_campaign: 'q4',
    utm_medium: 'social',
    utm_source: 'linkedin',
    visitor_id: VISITOR_ID,
  })
})

it('adds attribution params with the SDK distinct id', async () => {
  window.history.replaceState({}, '', '/?utm_source=newsletter&utm_campaign=apollo')
  stubConfig(ENABLED_CONFIG)

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

  await waitFor(() => expect(sdk.init).toHaveBeenCalledTimes(1))
  const link = document.getElementById('cta') as HTMLAnchorElement
  act(() => {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })

  const params = new URL(link.href).searchParams
  expect(params.get('posthog_anonymous_distinct_id')).toBe(VISITOR_ID)
  expect(params.get('visitor_id')).toBe(VISITOR_ID)
  expect(params.get('utm_source')).toBe('newsletter')
  expect(params.get('utm_campaign')).toBe('apollo')
  expect(params.get('first_touch_source')).toBe('newsletter')
  expect(params.get('official_cta_id')).toBe('home_hero_try_free')
  expect(params.get('source_surface')).toBe('official')
  expect(sdk.capture).toHaveBeenCalledWith(
    'official_cta_clicked',
    expect.objectContaining({ cta_id: 'home_hero_try_free', placement: 'hero' }),
  )
})
