import { afterEach, expect, it, vi } from 'vitest'
import {
  clearSharedVisitorId,
  readSharedVisitorId,
  resolveVisitorCookieSettings,
} from '@/lib/site/shared-visitor'
import { REPLAY_IDENTITY_KEY } from '@/lib/site/replay/shared'
import { writeStoredConsent } from '@/lib/site/consent'

afterEach(() => {
  vi.restoreAllMocks()
  clearSharedVisitorId()
  localStorage.clear()
})
it('keeps the visitor Cookie when the Necessary-only choice is saved', () => {
  document.cookie = 'session_example=kept; Path=/'
  const id = readSharedVisitorId()
  expect(document.cookie).toContain(id)
  // 埋点采集不以 cookie 同意为前提，因此关掉可选 cookie 不影响访客身份。
  writeStoredConsent(false, true, false)
  expect(document.cookie).toContain(`noumi_visitor_id_preview=${id}`)
  expect(document.cookie).toContain('session_example=kept')
})

it('prefers a valid shared Cookie over a different legacy replay identity', () => {
  const shared = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  localStorage.setItem(REPLAY_IDENTITY_KEY, JSON.stringify('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'))
  document.cookie = `noumi_visitor_id_preview=${shared}; Path=/; Secure`
  expect(readSharedVisitorId()).toBe(shared)
})
it.each(['invalid-json', JSON.stringify('invalid-id'), JSON.stringify(42), 'null'])(
  'creates a stable visitor when legacy storage contains %s',
  (value) => {
    localStorage.setItem(REPLAY_IDENTITY_KEY, value)
    const visitor = readSharedVisitorId()
    expect(visitor).toMatch(/^[0-9a-f-]{36}$/i)
    expect(readSharedVisitorId()).toBe(visitor)
  },
)
it('keeps an in-memory visitor when both storage mechanisms are blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(document, 'cookie', 'get').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(document, 'cookie', 'set').mockImplementation(() => {
    throw new Error('blocked')
  })
  const visitor = readSharedVisitorId()
  expect(visitor).toMatch(/^[0-9a-f-]{36}$/i)
  expect(readSharedVisitorId()).toBe(visitor)
})

it('shares one visitor cookie across noumi.ai and www.noumi.ai', () => {
  expect(resolveVisitorCookieSettings({ hostname: 'noumi.ai', protocol: 'https:' })).toEqual({
    name: 'noumi_visitor_id',
    attributes: expect.stringContaining('Domain=noumi.ai'),
  })
  expect(resolveVisitorCookieSettings({ hostname: 'www.noumi.ai', protocol: 'https:' })).toEqual({
    name: 'noumi_visitor_id',
    attributes: expect.stringContaining('Domain=noumi.ai'),
  })
})

it('keeps preview and staging visitors in their own cookie', () => {
  expect(
    resolveVisitorCookieSettings({ hostname: 'preview.staging.noumi.ai', protocol: 'https:' }),
  ).toEqual({ name: 'noumi_visitor_id_preview', attributes: expect.not.stringContaining('Domain=') })
  expect(
    resolveVisitorCookieSettings({ hostname: 'localhost', protocol: 'http:' }).attributes,
  ).not.toContain('Secure')
})
