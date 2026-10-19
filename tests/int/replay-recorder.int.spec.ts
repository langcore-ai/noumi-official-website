import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OfficialRecorder } from '@/lib/site/replay/recorder'
import { COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VERSION } from '@/lib/site/consent'
import { REPLAY_IDLE_MS, REPLAY_VISIT_KEY, replayRoute } from '@/lib/site/replay/shared'
import { maskProductReplayText, sanitizeProductReplay } from '@/lib/site/replay/privacy'

const client = {
  start: vi.fn(),
  stop: vi.fn(),
  getRecordingId: vi.fn(() => '550e8400-e29b-41d4-a716-446655440000'),
  addMeta: vi.fn(),
}
const config = { enabled: true, publicKey: 'public_key_rr_test', scope: 'test' }
let recorder: OfficialRecorder
function consent(value: boolean) {
  localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({ version: COOKIE_CONSENT_VERSION, analytics: value }),
  )
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-19T00:00:00Z'))
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  history.replaceState(null, '', '/')
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
  recorder = new OfficialRecorder(
    client as unknown as typeof import('@rrweb/browser-client'),
    config,
  )
})
afterEach(() => {
  recorder.dispose()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
describe('website replay lifecycle', () => {
  it('records only after consent and stops on withdrawal; re-consent creates a new visit', () => {
    recorder.sync()
    expect(client.start).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    consent(true)
    recorder.sync()
    const first = JSON.parse(sessionStorage.getItem(REPLAY_VISIT_KEY)!).id
    expect(client.start).toHaveBeenCalledTimes(1)
    consent(false)
    recorder.sync()
    recorder.event('official_cta_clicked', { cta_id: 'get-started' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(REPLAY_VISIT_KEY)).toBeNull()
    consent(true)
    recorder.sync()
    expect(JSON.parse(sessionStorage.getItem(REPLAY_VISIT_KEY)!).id).not.toBe(first)
  })
  it('keeps route changes in one visit, deduplicates visibility, and splits idle visits', () => {
    consent(true)
    recorder.sync()
    const first = JSON.parse(sessionStorage.getItem(REPLAY_VISIT_KEY)!).id
    recorder.observePage()
    expect(fetch).toHaveBeenCalledTimes(1)
    history.replaceState(null, '', '/pricing?token=secret')
    recorder.observePage()
    expect(JSON.parse(sessionStorage.getItem(REPLAY_VISIT_KEY)!).id).toBe(first)
    const body = JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string)
    expect(body[0].data.payload.route).toBe('/pricing')
    expect(JSON.stringify(body)).not.toContain('token=secret')
    vi.advanceTimersByTime(REPLAY_IDLE_MS + 1)
    recorder.observePage()
    expect(JSON.parse(sessionStorage.getItem(REPLAY_VISIT_KEY)!).id).not.toBe(first)
  })
  it('excludes admin routes and arbitrary event properties', () => {
    consent(true)
    recorder.sync()
    recorder.event('official_cta_clicked', {
      cta_id: 'start',
      password: 'secret',
      target_path: '/auth?token=secret',
    })
    const body = JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string)
    expect(body[0].data.payload.cta_id).toBe('start')
    expect(body[0].data.payload).not.toHaveProperty('password')
    expect(body[0].data.payload).not.toHaveProperty('target_path')
    history.replaceState(null, '', '/admin')
    recorder.observePage()
    recorder.event('official_cta_clicked', {})
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(client.stop).toHaveBeenLastCalledWith(true)
  })
  it('masks credentials and strips signed resource URLs from snapshots', () => {
    const input = document.createElement('input')
    input.type = 'password'
    expect(maskProductReplayText('secret', input)).toBe('******')
    expect(maskProductReplayText('Bearer abcdefghijklmnop')).toBe('Bearer [redacted]')
    const snapshot = {
      href: 'https://noumi.test/?token=secret',
      attributes: {
        src: 'https://files.test/a?signature=secret',
        style: 'background:url(https://files.test/private)',
      },
    }
    sanitizeProductReplay(snapshot, location.origin, '/')
    expect(JSON.stringify(snapshot)).not.toContain('secret')
    expect(snapshot.attributes.src).toBe('')
  })
})

it.each([
  '/faqs',
  '/contact',
  '/links',
  '/features/example',
  '/blog/example',
  '/use-cases/example',
])('includes the published website route %s', (path) => {
  expect(replayRoute(path)).toBe(path)
})
it.each([
  '/admin',
  '/admin/login',
  '/api/preview',
  '/protected',
  '/templates/blog',
  '/template-info/style-guide',
])('excludes internal route %s', (path) => {
  expect(replayRoute(path)).toBeNull()
})
