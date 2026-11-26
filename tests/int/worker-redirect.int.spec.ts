import { expect, it, vi } from 'vitest'

const openNext = vi.hoisted(() => ({ fetch: vi.fn() }))
vi.mock('../../.open-next/worker.js', () => ({ default: openNext }))
import worker from '../../worker'

it('redirects before reading stale HTML snapshots or invoking OpenNext', async () => {
  const readSnapshot = vi.fn(() => {
    throw new Error('Snapshot must not be read')
  })
  const env = { R2: { get: readSnapshot } } as unknown as Parameters<typeof worker.fetch>[1]
  const ctx = {} as Parameters<typeof worker.fetch>[2]
  const response = await worker.fetch(
    new Request('https://noumi.ai/use-cases/solutions-engineer/?from=old'),
    env,
    ctx,
  )
  expect(response.status).toBe(301)
  expect(response.headers.get('location')).toBe('https://noumi.ai/use-cases?from=old')
  expect(readSnapshot).not.toHaveBeenCalled()
})

it('marks staging redirects noindex without changing the production response', async () => {
  const request = new Request('https://staging.noumi.ai/blog/')
  const env = { APP_ENV: 'staging' } as Parameters<typeof worker.fetch>[1]
  const response = await worker.fetch(request, env, {} as Parameters<typeof worker.fetch>[2])
  expect(response.status).toBe(301)
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  expect(response.headers.get('location')).toBe('https://staging.noumi.ai/blog')
})

it('applies published CMS redirects before snapshot reads and preserves query parameters', async () => {
  const readSnapshot = vi.fn()
  const bind = vi.fn((path: string, status: string) => ({
    first: async () =>
      status === 'published' && path === '/old-campaign'
        ? { target: '/pricing', type: '302' }
        : null,
  }))
  const env = {
    D1: { prepare: () => ({ bind }) },
    R2: { get: readSnapshot },
  } as unknown as Parameters<typeof worker.fetch>[1]
  const response = await worker.fetch(
    new Request('https://noumi.ai/old-campaign?utm_source=test'),
    env,
    {} as Parameters<typeof worker.fetch>[2],
  )
  expect(response.status).toBe(302)
  expect(response.headers.get('location')).toBe('https://noumi.ai/pricing?utm_source=test')
  expect(bind).toHaveBeenCalledWith('/old-campaign', 'published')
  expect(readSnapshot).not.toHaveBeenCalled()
})

it('serves Preview pages directly without stale snapshot reads or writes', async () => {
  vi.mocked(openNext.fetch).mockResolvedValueOnce(new Response('Fresh Preview'))
  const get = vi.fn()
  const put = vi.fn()
  const env = {
    APP_ENV: 'staging',
    NOUMI_DISABLE_SNAPSHOTS: 'true',
    D1: { prepare: () => ({ bind: () => ({ first: async (): Promise<null> => null }) }) },
    R2: { get, put },
  } as unknown as Parameters<typeof worker.fetch>[1]
  const response = await worker.fetch(
    new Request('https://preview.staging.noumi.ai/about'),
    env,
    {} as Parameters<typeof worker.fetch>[2],
  )
  expect(await response.text()).toBe('Fresh Preview')
  expect(response.headers.get('x-robots-tag')).toContain('noindex')
  expect(get).not.toHaveBeenCalled()
  expect(put).not.toHaveBeenCalled()
})

it('proxies PostHog ingest before redirects, snapshots and OpenNext', async () => {
  vi.mocked(openNext.fetch).mockClear()
  const readSnapshot = vi.fn()
  const env = { R2: { get: readSnapshot } } as unknown as Parameters<typeof worker.fetch>[1]
  const ctx = { waitUntil: vi.fn() } as unknown as Parameters<typeof worker.fetch>[2]
  const upstream = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('proxied'),
  )
  vi.stubGlobal('fetch', upstream)

  const response = await worker.fetch(
    new Request('https://noumi.ai/ingest/e/', {
      body: '{"event":"$pageview"}',
      headers: { 'cf-connecting-ip': '203.0.113.9', 'content-type': 'application/json' },
      method: 'POST',
    }),
    env,
    ctx,
  )

  expect(await response.text()).toBe('proxied')
  expect(String(upstream.mock.calls[0]?.[0])).toBe('https://us.i.posthog.com/e/')
  expect(new Headers(upstream.mock.calls[0]?.[1]?.headers).get('x-forwarded-for')).toBe(
    '203.0.113.9',
  )
  expect(readSnapshot).not.toHaveBeenCalled()
  expect(openNext.fetch).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
})
