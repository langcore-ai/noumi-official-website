// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/payload-types'
import { handleGa4 } from '@/lib/ga4/handler'
import { ANALYTICS_SCOPE, parseDateRange, reportRequest } from '@/lib/ga4/core'
const mocks = vi.hoisted(() => ({
  getRuntime: vi.fn(),
  readConnection: vi.fn(),
  getReport: vi.fn(),
  saveAuthorization: vi.fn(),
  disconnect: vi.fn(),
  seal: vi.fn(),
  unseal: vi.fn(),
}))
vi.mock('@/lib/ga4/server', () => mocks)
const runtime = {
  redirectUri: 'https://noumi.ai/api/site/ga4/callback',
  clientId: 'client-id',
  propertyId: '535315366',
}
const user = (roles = ['admin']) => ({ id: 1, roles }) as User
const req = (action: string, method = 'GET', origin = 'https://noumi.ai') =>
  new Request(`https://noumi.ai/api/site/ga4/${action}`, { method, headers: { origin } })
beforeEach(() => {
  vi.resetAllMocks()
  mocks.getRuntime.mockResolvedValue(runtime)
  mocks.seal.mockResolvedValue('encrypted')
  mocks.readConnection.mockResolvedValue(null)
})
describe('GA4 authorization boundary', () => {
  it('does not read credentials for anonymous or disallowed roles', async () => {
    expect((await handleGa4(req('status'), 'status', null)).status).toBe(401)
    expect((await handleGa4(req('status'), 'status', user(['translator']))).status).toBe(403)
    expect(mocks.getRuntime).not.toHaveBeenCalled()
  })
  it.each(['connect', 'disconnect', 'callback'])('blocks viewer mutation: %s', async (action) => {
    expect(
      (
        await handleGa4(
          req(action, action === 'callback' ? 'GET' : 'POST'),
          action,
          user(['viewer']),
        )
      ).status,
    ).toBe(403)
    expect(mocks.getRuntime).not.toHaveBeenCalled()
  })
  it('rejects cross-origin mutations and GET connect', async () => {
    expect(
      (await handleGa4(req('connect', 'POST', 'https://attacker.example'), 'connect', user()))
        .status,
    ).toBe(403)
    expect((await handleGa4(req('connect'), 'connect', user())).status).toBe(405)
    expect(mocks.seal).not.toHaveBeenCalled()
  })
  it('accepts Next internal URL normalization only with the configured Host', async () => {
    const internal = new Request('http://0.0.0.0:3000/api/site/ga4/status', {
      headers: { host: 'noumi.ai' },
    })
    expect((await handleGa4(internal, 'status', user())).status).toBe(200)
    const wrongHost = new Request('https://noumi.ai/api/site/ga4/status', {
      headers: { host: 'evil.example' },
    })
    expect((await handleGa4(wrongHost, 'status', user())).status).toBe(403)
  })
  it('uses readonly consent, PKCE and a secure HttpOnly cookie', async () => {
    const response = await handleGa4(req('connect', 'POST'), 'connect', user())
    const data = (await response.json()) as { url: string }
    const url = new URL(data.url)
    expect(url.origin).toBe('https://accounts.google.com')
    expect(url.searchParams.get('scope')).toBe(ANALYTICS_SCOPE)
    expect(url.searchParams.get('access_type')).toBe('offline')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('code_challenge')).toHaveLength(43)
    expect(response.headers.get('set-cookie')).toContain(
      'HttpOnly; SameSite=Lax; Max-Age=600; Secure',
    )
    expect(mocks.seal.mock.calls[0][1].userId).toBe('1')
  })
  it.each([
    { userId: '2' },
    { expires: 1 },
    { state: 'wrong' },
    { redirectUri: 'https://other.example' },
  ])('rejects invalid callback state %s', async (override) => {
    mocks.unseal.mockResolvedValue({
      userId: '1',
      expires: Date.now() + 60000,
      state: 'expected',
      redirectUri: runtime.redirectUri,
      verifier: 'secret',
      ...override,
    })
    const response = await handleGa4(
      req('callback?code=secret-code&state=expected'),
      'callback',
      user(),
    )
    expect(response.headers.get('location')).toBe(
      'https://noumi.ai/admin/analytics?google=invalid_state',
    )
    expect(mocks.saveAuthorization).not.toHaveBeenCalled()
  })
  it('exchanges a valid callback and clears its cookie without exposing the code', async () => {
    mocks.unseal.mockResolvedValue({
      userId: '1',
      expires: Date.now() + 60000,
      state: 'expected',
      redirectUri: runtime.redirectUri,
      verifier: 'verifier',
    })
    const response = await handleGa4(
      req('callback?code=secret-code&state=expected'),
      'callback',
      user(),
    )
    expect(mocks.saveAuthorization).toHaveBeenCalledWith(runtime, 'secret-code', 'verifier')
    expect(response.headers.get('location')).toBe(
      'https://noumi.ai/admin/analytics?google=connected',
    )
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  })
  it('never serializes tokens in status', async () => {
    mocks.readConnection.mockResolvedValue({
      refreshToken: 'private-token',
      id: 'private-id',
      connectedAt: 'today',
    })
    const response = await handleGa4(req('status'), 'status', user(['viewer']))
    expect(await response.text()).not.toContain('private-')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
  it('bounds report dates before querying Google', async () => {
    const response = await handleGa4(
      req('report?startDate=2026-02-30&endDate=2026-03-01'),
      'report',
      user(),
    )
    expect(response.status).toBe(400)
    expect(mocks.getReport).not.toHaveBeenCalled()
  })
})
describe('report contract', () => {
  it('keeps the event filter exact and queries the source page, not landing page', () => {
    const request = reportRequest(
      { startDate: '2026-11-01', endDate: '2026-11-06' },
      'pageLocation',
    )
    expect(request.dimensionFilter.filter.stringFilter.value).toBe('try_free_click')
    expect(request.dimensions).toEqual([{ name: 'pageLocation' }])
    expect(request.limit).toBe(100)
  })
  it.each([
    'startDate=2026-11-07&endDate=2026-11-06',
    'startDate=2020-01-01&endDate=2026-11-06',
    'startDate=x&endDate=y',
  ])('rejects invalid ranges %s', (query) => {
    expect(() => parseDateRange(new URLSearchParams(query))).toThrow()
  })
})
