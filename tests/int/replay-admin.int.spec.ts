// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ auth: vi.fn(), findByID: vi.fn(), config: vi.fn() }))
vi.mock('@/lib/site/payload-client', () => ({ getSitePayloadClient: async () => mocks }))
vi.mock('@/lib/site/replay/config', () => ({ readReplayConfig: mocks.config }))
import { replayAdminRequest } from '@/lib/site/replay/admin-api'
import { listProductVisits, readProductVisit } from '@/lib/site/replay/cloud'
const id = '550e8400-e29b-41d4-a716-446655440000'
const other = '550e8400-e29b-41d4-a716-446655440001'
const metadata = {
  app: 'noumi-official',
  scope: 'test',
  visit_id: id,
  anonymous_id: id,
  last_page: '/pricing',
}
const request = (query = '') => new Request(`https://noumi.test/api/site/replay/visits${query}`)
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.mockResolvedValue({ user: { id: 1, roles: ['admin'] } })
  mocks.findByID.mockResolvedValue({ id: 1, roles: ['admin'] })
  mocks.config.mockResolvedValue({ secretKey: 'private-test-key', scope: 'test' })
  vi.stubGlobal('fetch', vi.fn())
})
it('rejects anonymous users and revoked admin roles before querying Cloud', async () => {
  mocks.auth.mockResolvedValueOnce({ user: null })
  expect((await replayAdminRequest(request(), ['visits'])).status).toBe(401)
  mocks.findByID.mockResolvedValueOnce({ id: 1, roles: ['viewer'] })
  expect((await replayAdminRequest(request(), ['visits'])).status).toBe(403)
  expect(fetch).not.toHaveBeenCalled()
})
it('rejects invalid pagination and filters', async () => {
  expect((await replayAdminRequest(request('?offset=-1'), ['visits'])).status).toBe(400)
  expect((await replayAdminRequest(request('?anonymousId=arbitrary'), ['visits'])).status).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})
it('blocks cross-environment recording IDs before reading events or issuing links', async () => {
  vi.mocked(fetch).mockImplementation(async () =>
    Response.json({ metadata: { ...metadata, scope: 'production' } }),
  )
  for (const action of ['events', 'player'])
    expect((await replayAdminRequest(request(), ['recordings', id, action])).status).toBe(404)
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(
    vi.mocked(fetch).mock.calls.every(([url]) => String(url).endsWith(`/recordings/${id}`)),
  ).toBe(true)
})
it('queries scoped metadata and groups recordings without claiming a total count', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    Response.json({
      recordings: [
        { recordingId: id, timestamp: 200, metadata },
        { recordingId: other, timestamp: 100, metadata },
      ],
    }),
  )
  const result = await listProductVisits('key', 'test', 0, '')
  expect(result.items).toHaveLength(1)
  expect(result.items[0].recordingCount).toBeNull()
  const url = new URL(String(vi.mocked(fetch).mock.calls[0][0]))
  expect(url.searchParams.get('metadata[app]')).toBe('noumi-official')
  expect(url.searchParams.get('metadata[scope]')).toBe('test')
})
it('loads metadata without downloading DOM; reports partial timeline failures', async () => {
  vi.mocked(fetch).mockImplementation(async (url) =>
    String(url).includes('/events')
      ? new Response('unavailable', { status: 502 })
      : Response.json({ recordings: [{ recordingId: id, timestamp: 200, metadata }] }),
  )
  const summary = await readProductVisit('key', id, 'test', undefined, false)
  expect(summary.recordings[0].status).toBe('not_loaded')
  expect(fetch).toHaveBeenCalledTimes(1)
  const detail = await readProductVisit('key', id, 'test')
  expect(detail.incomplete).toBe(true)
  expect(detail.recordings[0].status).toBe('unavailable')
})
