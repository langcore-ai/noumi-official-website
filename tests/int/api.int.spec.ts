import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * Payload config 依赖 Cloudflare 运行时；这里先把它 mock 成一个可预测的本地对象，
 * 避免测试直接拉起 wrangler / Miniflare。
 */
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(async () => ({
    env: {
      D1: {},
      PAYLOAD_SECRET: 'test-secret',
      R2: {},
    },
  })),
}))

const testProcessEnv = process.env as Record<string, string | undefined>
const previousNodeEnv = testProcessEnv.NODE_ENV
testProcessEnv.NODE_ENV = 'production'

let payloadConfig: unknown

describe('API', () => {
  beforeAll(async () => {
    const { default: configPromise } = await import('@/payload.config')
    payloadConfig = await configPromise
  })

  it('loads the payload config under a mocked Cloudflare runtime', () => {
    expect(payloadConfig).toBeDefined()
  })
})

afterAll(() => {
  if (previousNodeEnv === undefined) {
    delete testProcessEnv.NODE_ENV
    return
  }

  testProcessEnv.NODE_ENV = previousNodeEnv
})
