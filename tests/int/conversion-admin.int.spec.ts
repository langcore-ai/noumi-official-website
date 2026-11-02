// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ auth: vi.fn(), findByID: vi.fn() }))
vi.mock('@/lib/site/payload-client', () => ({ getSitePayloadClient: async () => mocks }))
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: async () => ({ env: {} }) }))
import { conversionAdminRequest } from '@/lib/site/conversion-admin-api'
const request = () =>
  new Request(
    'https://noumi.test/api/site/conversions?from=2026-10-01&to=2026-10-07&search=someone%40example.test&url=https://attacker.test',
    { headers: { cookie: 'private-cms-cookie', authorization: 'Bearer browser-controlled' } },
  )
beforeEach(() => {
  vi.resetAllMocks()
  mocks.auth.mockResolvedValue({ user: { id: 1 } })
  mocks.findByID.mockResolvedValue({ id: 1, roles: ['admin'] })
  vi.stubEnv('VISITOR_CONVERSION_PRODUCT_ORIGIN', 'https://www.noumi.test')
  vi.stubEnv('VISITOR_CONVERSION_SERVICE_TOKEN', 'service-only-key')
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
it('rejects anonymous and revoked administrators before contacting product', async () => {
  mocks.auth.mockResolvedValueOnce({ user: null })
  expect((await conversionAdminRequest(request())).status).toBe(401)
  mocks.findByID.mockResolvedValueOnce({ id: 1, roles: ['viewer'] })
  expect((await conversionAdminRequest(request())).status).toBe(403)
  expect(fetch).not.toHaveBeenCalled()
})
it('uses only the fixed readonly endpoint and server token, never client credentials or arbitrary destinations', async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json({ version: 1, summary: { visitors: 0 } }))
  const response = await conversionAdminRequest(request())
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  const [url, init] = vi.mocked(fetch).mock.calls[0]!
  const upstream = new URL(String(url))
  expect(upstream.origin).toBe('https://www.noumi.test')
  expect(upstream.pathname).toBe('/_internal/visitor-conversions')
  expect(upstream.searchParams.has('url')).toBe(false)
  const headers = new Headers(init?.headers)
  expect(headers.get('authorization')).toBe('Bearer service-only-key')
  expect(headers.has('cookie')).toBe(false)
  expect(init?.redirect).toBe('error')
})
it('distinguishes configuration, limits and unavailable sources rather than returning zero metrics', async () => {
  vi.stubEnv('VISITOR_CONVERSION_SERVICE_TOKEN', '')
  expect((await conversionAdminRequest(request())).status).toBe(503)
  vi.stubEnv('VISITOR_CONVERSION_SERVICE_TOKEN', 'service-only-key')
  vi.mocked(fetch).mockResolvedValueOnce(
    Response.json({ error: 'conversion_limit_exceeded' }, { status: 422 }),
  )
  expect(await (await conversionAdminRequest(request())).json()).toEqual({
    error: 'conversion_limit_exceeded',
  })
  vi.mocked(fetch).mockResolvedValueOnce(new Response('private upstream failure', { status: 500 }))
  const r = await conversionAdminRequest(request())
  expect(r.status).toBe(502)
  expect(await r.json()).toEqual({ error: 'conversion_unavailable' })
})
it('rejects insecure remote origins and incompatible response versions', async () => {
  vi.stubEnv('VISITOR_CONVERSION_PRODUCT_ORIGIN', 'http://remote.test')
  expect((await conversionAdminRequest(request())).status).toBe(503)
  expect(fetch).not.toHaveBeenCalled()
  vi.stubEnv('VISITOR_CONVERSION_PRODUCT_ORIGIN', 'https://www.noumi.test')
  vi.mocked(fetch).mockResolvedValue(Response.json({ version: 2 }))
  expect((await conversionAdminRequest(request())).status).toBe(502)
})
