import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { buildOfficialAttributionProperties, type OfficialFirstTouch } from '@/lib/site/analytics'
import {
  clearOfficialFirstTouch,
  resolveOfficialFirstTouch,
} from '@/lib/site/attribution'

const baseUrl = 'https://noumi.ai'

/**
 * 构造首触快照。
 * @param overrides 覆盖字段
 * @returns 快照
 */
function firstTouch(overrides: Partial<OfficialFirstTouch> = {}): OfficialFirstTouch {
  return {
    captured_at: '2026-11-19T00:00:00.000Z',
    landing_page: '/pricing',
    utm_campaign: 'launch',
    utm_medium: 'email',
    utm_source: 'newsletter',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  clearOfficialFirstTouch()
})

afterEach(() => {
  vi.useRealTimers()
})

it('keeps the first channel signal for the rest of the visit', () => {
  const first = resolveOfficialFirstTouch({
    baseUrl,
    consent: true,
    now: Date.parse('2026-11-19T00:00:00.000Z'),
    pathname: '/pricing',
    referrer: 'https://www.linkedin.com/feed',
    search: '?utm_source=linkedin&utm_medium=social&utm_campaign=q4',
  })

  expect(first).toMatchObject({
    landing_page: '/pricing',
    referrer_origin: 'https://www.linkedin.com',
    utm_campaign: 'q4',
    utm_medium: 'social',
    utm_source: 'linkedin',
  })

  // 站内翻页（无 UTM，referrer 指向官网自己）不得覆盖首触。
  const later = resolveOfficialFirstTouch({
    baseUrl,
    consent: true,
    now: Date.parse('2026-11-19T00:05:00.000Z'),
    pathname: '/features/foo',
    referrer: 'https://noumi.ai/pricing',
    search: '',
  })
  expect(later).toEqual(first)
})

it('does not persist attribution before consent but keeps it in memory', () => {
  const captured = resolveOfficialFirstTouch({
    baseUrl,
    consent: false,
    now: Date.parse('2026-11-19T00:00:00.000Z'),
    pathname: '/',
    referrer: null,
    search: '?utm_source=cold-email&utm_campaign=apollo',
  })

  expect(captured?.utm_source).toBe('cold-email')
  expect(localStorage.getItem('noumi:analytics:first_touch')).toBeNull()

  const persisted = resolveOfficialFirstTouch({
    baseUrl,
    consent: true,
    now: Date.parse('2026-11-19T00:01:00.000Z'),
    pathname: '/',
    referrer: null,
    search: '',
  })
  expect(persisted?.utm_source).toBe('cold-email')
  expect(localStorage.getItem('noumi:analytics:first_touch')).not.toBeNull()
})

it('returns null when a visit carries no channel signal', () => {
  expect(
    resolveOfficialFirstTouch({
      baseUrl,
      consent: true,
      now: Date.parse('2026-11-19T00:00:00.000Z'),
      pathname: '/',
      referrer: 'https://noumi.ai/pricing',
      search: '?email=user@example.com',
    }),
  ).toBeNull()
})

it('expires stored attribution after the window', () => {
  localStorage.setItem(
    'noumi:analytics:first_touch',
    JSON.stringify(firstTouch({ captured_at: '2025-01-01T00:00:00.000Z' })),
  )

  expect(
    resolveOfficialFirstTouch({
      baseUrl,
      consent: true,
      now: Date.parse('2026-11-19T00:00:00.000Z'),
      pathname: '/',
      referrer: null,
      search: '',
    }),
  ).toBeNull()
})

it('emits first-touch properties plus the current UTMs on every event', () => {
  expect(
    buildOfficialAttributionProperties(firstTouch({ utm_content: 'hero' }), {
      baseUrl,
      referrer: 'https://www.google.com/search',
      search: '?utm_source=retarget&utm_medium=cpc',
    }),
  ).toEqual({
    first_touch_campaign: 'launch',
    first_touch_content: 'hero',
    first_touch_landing_page: '/pricing',
    first_touch_medium: 'email',
    first_touch_source: 'newsletter',
    referrer_origin: 'https://www.google.com',
    utm_medium: 'cpc',
    utm_source: 'retarget',
  })
})

it('omits attribution properties entirely when nothing was captured', () => {
  expect(buildOfficialAttributionProperties(null)).toEqual({})
})
