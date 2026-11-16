import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const openNext = vi.hoisted(() => ({ fetch: vi.fn() }))
vi.mock('../../.open-next/worker.js', () => ({ default: openNext }))
import worker from '../../worker'

type Ctx = Parameters<typeof worker.fetch>[2]
type Env = Parameters<typeof worker.fetch>[1]

/** 测试上下文与已登记的 waitUntil 任务。 */
type TestContext = {
  ctx: Ctx
  tasks: Promise<unknown>[]
}

/** 记录 waitUntil 任务的测试上下文。 */
function createContext(): TestContext {
  const tasks: Promise<unknown>[] = []
  const ctx = {
    passThroughOnException: (): void => undefined,
    props: {},
    waitUntil: (task: Promise<unknown>): void => {
      tasks.push(task)
    },
  } as unknown as Ctx

  return { ctx, tasks }
}

/** 内存版 Cache API 形状，只包含 worker 用到的部分。 */
type MemoryCache = {
  entries: Map<string, Response>
  match: (key: Request) => Promise<Response | undefined>
  put: (key: Request, response: Response) => Promise<void>
  delete: (key: Request) => Promise<boolean>
}

/** 内存版 Cache API，只实现 worker 用到的 match/put/delete。 */
function createMemoryCache(): MemoryCache {
  const entries = new Map<string, Response>()

  return {
    entries,
    match: vi.fn(async (key: Request) => entries.get(key.url)?.clone()),
    put: vi.fn(async (key: Request, response: Response) => {
      entries.set(key.url, response.clone())
    }),
    delete: vi.fn(async (key: Request) => entries.delete(key.url)),
  }
}

/** 构造只带 D1 空查询与 R2 的 env。 */
function createEnv(r2Get: (key: string) => Promise<unknown>): Env {
  return {
    D1: { prepare: () => ({ bind: () => ({ first: async (): Promise<null> => null }) }) },
    R2: { get: r2Get },
  } as unknown as Env
}

const SNAPSHOT_HTML = '<!doctype html><html><body>Cached snapshot</body></html>'

/** 让 R2 只返回页面快照，dirty marker 不存在。 */
function r2WithSnapshot() {
  return vi.fn(async (key: string) => {
    if (key.endsWith('/dirty.json')) return null
    if (key.includes('/html/')) {
      return {
        httpMetadata: { contentType: 'text/html; charset=utf-8' },
        text: async () => SNAPSHOT_HTML,
      }
    }
    return null
  })
}

let memoryCache: MemoryCache

beforeEach(() => {
  memoryCache = createMemoryCache()
  vi.stubGlobal('caches', { default: memoryCache })
  openNext.fetch.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('HTML snapshot edge cache', () => {
  it('stores a snapshot hit in the edge cache', async () => {
    const { ctx, tasks } = createContext()

    const response = await worker.fetch(
      new Request('https://noumi.ai/about'),
      createEnv(r2WithSnapshot()),
      ctx,
    )
    await Promise.all(tasks)

    expect(await response.text()).toContain('Cached snapshot')
    expect(memoryCache.put).toHaveBeenCalledTimes(1)
    expect([...memoryCache.entries.keys()]).toEqual(['https://noumi.ai/about'])
  })

  it('serves the second request from cache without reading the R2 snapshot', async () => {
    const warm = createContext()
    await worker.fetch(new Request('https://noumi.ai/about'), createEnv(r2WithSnapshot()), warm.ctx)
    await Promise.all(warm.tasks)

    const r2Get = r2WithSnapshot()
    const { ctx } = createContext()
    const response = await worker.fetch(
      new Request('https://noumi.ai/about'),
      createEnv(r2Get),
      ctx,
    )

    expect(await response.text()).toContain('Cached snapshot')
    expect(response.headers.get('x-official-snapshot')).toBe('hit')
    expect(r2Get.mock.calls.map(([key]) => String(key))).toEqual([
      'official-site-snapshots/dirty.json',
    ])
    expect(openNext.fetch).not.toHaveBeenCalled()
  })

  it('drops the cached entry when the snapshot is marked dirty', async () => {
    const { ctx, tasks } = createContext()
    await worker.fetch(new Request('https://noumi.ai/about'), createEnv(r2WithSnapshot()), ctx)
    await Promise.all(tasks)

    openNext.fetch.mockResolvedValueOnce(new Response('Fresh SSR'))
    const r2Get = vi.fn(async (key: string) =>
      key.endsWith('/dirty.json') ? { text: async () => '{}' } : null,
    )
    const response = await worker.fetch(
      new Request('https://noumi.ai/about'),
      createEnv(r2Get),
      createContext().ctx,
    )

    expect(await response.text()).toBe('Fresh SSR')
    expect(memoryCache.delete).toHaveBeenCalledTimes(1)
  })

  it('bypasses the cache for preview cookies, query strings and bypass headers', async () => {
    const scenarios = [
      new Request('https://noumi.ai/about', { headers: { cookie: '__prerender_bypass=1' } }),
      new Request('https://noumi.ai/about?utm_source=mail'),
      new Request('https://noumi.ai/about', { headers: { 'x-official-snapshot-bypass': '1' } }),
    ]

    for (const request of scenarios) {
      openNext.fetch.mockResolvedValueOnce(new Response('Uncached'))
      const response = await worker.fetch(request, createEnv(r2WithSnapshot()), createContext().ctx)
      expect(await response.text()).toBe('Uncached')
    }

    expect(memoryCache.match).not.toHaveBeenCalled()
    expect(memoryCache.put).not.toHaveBeenCalled()
  })

  it('skips the cache entirely when snapshots are disabled', async () => {
    openNext.fetch.mockResolvedValueOnce(new Response('Preview build'))
    const env = {
      ...createEnv(r2WithSnapshot()),
      NOUMI_DISABLE_SNAPSHOTS: 'true',
    } as unknown as Env

    const response = await worker.fetch(
      new Request('https://preview.staging.noumi.ai/about'),
      env,
      createContext().ctx,
    )

    expect(await response.text()).toBe('Preview build')
    expect(memoryCache.match).not.toHaveBeenCalled()
    expect(memoryCache.put).not.toHaveBeenCalled()
  })
})
