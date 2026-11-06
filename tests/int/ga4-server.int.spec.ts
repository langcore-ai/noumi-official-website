// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import {
  disconnect,
  getReport,
  readConnection,
  saveAuthorization,
  seal,
  unseal,
  type Ga4Runtime,
} from '@/lib/ga4/server'
import { ANALYTICS_SCOPE } from '@/lib/ga4/core'
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: vi.fn() }))
const storage = new Map<string, string>()
const runtime = {
  clientId: 'client',
  clientSecret: 'client-secret',
  propertyId: '535315366',
  redirectUri: 'https://noumi.ai/api/site/ga4/callback',
  key: new Uint8Array(32).fill(7),
  prefix: 'private/ga4/test',
  bucket: {
    get: vi.fn(async (key: string) =>
      storage.has(key) ? { text: async () => storage.get(key) } : null,
    ),
    put: vi.fn(async (key: string, value: string) => {
      storage.set(key, value)
    }),
    delete: vi.fn(async (key: string) => {
      storage.delete(key)
    }),
  },
} as unknown as Ga4Runtime
const fetchMock = vi.fn()
const range = { startDate: '2026-11-01', endDate: '2026-11-06' }
const token = () =>
  Response.json({
    access_token: 'access-secret',
    refresh_token: 'refresh-secret',
    scope: ANALYTICS_SCOPE,
  })
const report = () =>
  Response.json({
    rows: [
      { dimensionValues: [{ value: 'header' }], metricValues: [{ value: '7' }, { value: '3' }] },
    ],
    metadata: { timeZone: 'Asia/Shanghai' },
  })
beforeEach(() => {
  storage.clear()
  vi.clearAllMocks()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())
describe('Google credential persistence and reports', () => {
  it('encrypts stored values and rejects a different encryption key', async () => {
    const value = await seal(runtime, { refreshToken: 'very-secret-token' })
    expect(value).not.toContain('very-secret-token')
    expect(await unseal(runtime, value)).toEqual({ refreshToken: 'very-secret-token' })
    await expect(unseal({ ...runtime, key: new Uint8Array(32).fill(8) }, value)).rejects.toThrow()
  })
  it('checks property access before persisting the refresh token', async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(report())
    await saveAuthorization(runtime, 'code', 'verifier')
    expect((await readConnection(runtime))?.refreshToken).toBe('refresh-secret')
    expect(storage.get(`${runtime.prefix}/connection`)).not.toContain('refresh-secret')
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams
    expect(body.get('code_verifier')).toBe('verifier')
    expect(fetchMock.mock.calls[1][0]).toContain('properties/535315366:runReport')
  })
  it('does not replace a working connection when a new account lacks GA4 access', async () => {
    storage.set(`${runtime.prefix}/connection`, 'original')
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(Response.json({}, { status: 403 }))
    await expect(saveAuthorization(runtime, 'code', 'verifier')).rejects.toMatchObject({
      code: 'ga4_forbidden',
    })
    expect(storage.get(`${runtime.prefix}/connection`)).toBe('original')
  })
  it('rejects missing readonly consent or refresh token', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ access_token: 'a', scope: ANALYTICS_SCOPE }))
    await expect(saveAuthorization(runtime, 'code', 'verifier')).rejects.toMatchObject({
      code: 'missing_consent',
    })
    expect(storage.size).toBe(0)
  })
  it('queries five reports, tolerates unavailable custom dimensions and uses encrypted cache', async () => {
    storage.set(
      `${runtime.prefix}/connection`,
      await seal(runtime, {
        refreshToken: 'refresh-secret',
        id: 'connection',
        connectedAt: 'today',
      }),
    )
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.includes('/token')) return token()
      const body = JSON.parse(init.body as string)
      if (body.dimensions?.[0]?.name === 'customEvent:button_text')
        return Response.json({}, { status: 400 })
      return report()
    })
    const result = await getReport(runtime, range)
    expect(result.clicks).toBe(7)
    expect(result.users).toBe(3)
    expect(result.texts).toEqual([])
    expect(result.warnings).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(6)
    const cached = await getReport(runtime, range)
    expect(cached).toEqual(result)
    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect([...storage.values()].join('')).not.toContain('header')
    await disconnect(runtime)
    await expect(getReport(runtime, range)).rejects.toMatchObject({ code: 'not_connected' })
  })
  it('surfaces revoked authorization instead of showing zero clicks', async () => {
    storage.set(
      `${runtime.prefix}/connection`,
      await seal(runtime, { refreshToken: 'revoked', id: 'connection' }),
    )
    fetchMock.mockResolvedValue(
      Response.json(
        { error: 'invalid_grant', error_description: 'private details' },
        { status: 400 },
      ),
    )
    await expect(getReport(runtime, range)).rejects.toMatchObject({ code: 'reconnect_required' })
  })
})
