import { expect, it, vi } from 'vitest'

vi.mock('../../.open-next/worker.js', () => ({ default: { fetch: vi.fn() } }))
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
