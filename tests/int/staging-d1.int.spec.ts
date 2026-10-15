// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { stagingD1 } from '../../tooling/infra/staging-d1'
vi.mock('../../tooling/infra/shared', async (original) => ({
  ...(await original<typeof import('../../tooling/infra/shared')>()),
  capture: () => JSON.stringify({ token: 'test-token' }),
}))
afterEach(() => vi.unstubAllGlobals())

it('preserves raw column order and binds values without SQL interpolation', async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      success: true,
      result: [
        { success: true, results: { columns: ['name', 'id'], rows: [['sample', 7]] }, meta: {} },
      ],
    }),
  )
  vi.stubGlobal('fetch', fetcher)
  const result = await stagingD1()
    .prepare('SELECT name,id FROM users WHERE email=?')
    .bind("x' OR 1=1")
    .raw({ columnNames: true })
  expect(result).toEqual([
    ['name', 'id'],
    ['sample', 7],
  ])
  const [url, options] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toContain('/2cf5e2cf-7aa3-4ba9-ab17-e8ffe75be5be/raw')
  expect(JSON.parse(options.body as string)).toEqual({
    sql: 'SELECT name,id FROM users WHERE email=?',
    params: ["x' OR 1=1"],
  })
})

it('does not replay an ambiguous write failure', async () => {
  const fetcher = vi.fn(async () => {
    throw new Error('connection lost')
  })
  vi.stubGlobal('fetch', fetcher)
  await expect(
    stagingD1().prepare('INSERT INTO users(email) VALUES(?)').bind('test').run(),
  ).rejects.toThrow('connection lost')
  expect(fetcher).toHaveBeenCalledTimes(1)
})
