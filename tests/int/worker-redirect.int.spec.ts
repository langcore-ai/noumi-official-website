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
