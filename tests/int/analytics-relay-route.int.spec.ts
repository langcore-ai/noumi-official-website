import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/api/site/analytics/events/route'

type MockBatch = {
  api_key: string
  batch: Array<{
    event: string
    distinct_id: string
    uuid: string
    timestamp: string
    properties: Record<string, unknown>
  }>
}

const batches: MockBatch[] = []

/**
 * 拦截合成 base URL 的 `/batch/` 请求并记录批次。
 * @param input 请求地址
 * @param init 请求参数
 * @returns 模拟的 PostHog 响应
 */
async function mockBatchFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!String(input).endsWith('/batch/')) {
    return new Response(null, { status: 404 })
  }
  batches.push(JSON.parse(String(init?.body)) as MockBatch)
  return Response.json({ status: 1 })
}

const uuid = () => crypto.randomUUID()

/**
 * 构造事件接口请求。
 * @param overrides 覆盖项
 * @returns 请求
 */
function relayRequest(
  overrides: {
    body?: unknown
    consent?: boolean
    header?: boolean
    origin?: string | null
  } = {},
) {
  const headers = new Headers({ 'content-type': 'application/json' })
  headers.set(
    'origin',
    overrides.origin === undefined ? 'https://noumi.ai' : String(overrides.origin),
  )
  if (overrides.header !== false) headers.set('x-noumi-analytics', '1')
  if (overrides.consent !== false) headers.set('cookie', 'noumi_analytics_consent=1')

  return new Request('https://noumi.ai/api/site/analytics/events', {
    method: 'POST',
    headers,
    body: JSON.stringify(
      overrides.body ?? {
        events: [
          {
            event: '$pageview',
            eventId: uuid(),
            occurredAt: new Date().toISOString(),
            anonymousId: uuid(),
            properties: { page_path: '/pricing?email=secret#top' },
          },
        ],
      },
    ),
  })
}

beforeAll(() => {
  vi.stubEnv('POSTHOG_ENABLED', 'true')
  vi.stubEnv('POSTHOG_PROJECT_KEY', 'phc_local_test')
  vi.stubEnv('POSTHOG_API_HOST', 'https://us.i.posthog.com')
  vi.stubGlobal('fetch', mockBatchFetch)
})

afterAll(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

beforeEach(() => {
  batches.length = 0
})

describe('POST /api/site/analytics/events', () => {
  it('forwards an allowlisted batch to PostHog with the server-side key', async () => {
    const response = await POST(relayRequest())
    expect(response.status).toBe(204)

    const [batch] = batches
    expect(batch?.api_key).toBe('phc_local_test')
    expect(batch?.batch).toHaveLength(1)
    expect(batch?.batch[0]).toMatchObject({
      event: '$pageview',
      properties: {
        $current_url: 'https://noumi.ai/pricing',
        $host: 'noumi.ai',
        $pathname: '/pricing',
        app_source: 'noumi-official',
        page_group: 'pricing',
        page_path: '/pricing',
        $geoip_disable: true,
        $process_person_profile: false,
      },
    })
    expect(JSON.stringify(batch)).not.toContain('email=')
    expect(JSON.stringify(batch)).not.toContain('#top')
  })

  it('rejects requests that skip the consent cookie', async () => {
    const response = await POST(relayRequest({ consent: false }))
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'missing_analytics_consent' })
    expect(batches).toHaveLength(0)
  })

  it('rejects cross-origin and header-less requests', async () => {
    expect((await POST(relayRequest({ origin: 'https://evil.test' }))).status).toBe(403)
    expect((await POST(relayRequest({ header: false }))).status).toBe(403)
    expect(batches).toHaveLength(0)
  })

  it('rejects unknown events and browser-supplied URLs', async () => {
    const unknownEvent = await POST(
      relayRequest({
        body: {
          events: [
            {
              event: 'payment_succeeded',
              eventId: uuid(),
              occurredAt: new Date().toISOString(),
              anonymousId: uuid(),
              properties: { page_path: '/pricing' },
            },
          ],
        },
      }),
    )
    expect(unknownEvent.status).toBe(400)

    const spoofedUrl = await POST(
      relayRequest({
        body: {
          events: [
            {
              event: '$pageview',
              eventId: uuid(),
              occurredAt: new Date().toISOString(),
              anonymousId: uuid(),
              properties: { page_path: '/', $current_url: 'https://evil.test/x' },
            },
          ],
        },
      }),
    )
    expect(spoofedUrl.status).toBe(400)
    expect(batches).toHaveLength(0)
  })

  it('rejects events outside the accepted time window', async () => {
    const response = await POST(
      relayRequest({
        body: {
          events: [
            {
              event: '$pageview',
              eventId: uuid(),
              occurredAt: '2020-01-01T00:00:00.000Z',
              anonymousId: uuid(),
              properties: { page_path: '/' },
            },
          ],
        },
      }),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid_analytics_time' })
    expect(batches).toHaveLength(0)
  })

  it('rejects oversized batches and non-JSON content types', async () => {
    const tooMany = await POST(
      relayRequest({
        body: {
          events: Array.from({ length: 21 }, () => ({
            event: '$pageview',
            eventId: uuid(),
            occurredAt: new Date().toISOString(),
            anonymousId: uuid(),
            properties: { page_path: '/' },
          })),
        },
      }),
    )
    expect(tooMany.status).toBe(400)

    const request = relayRequest()
    request.headers.set('content-type', 'text/plain')
    expect((await POST(request)).status).toBe(415)
    expect(batches).toHaveLength(0)
  })

  it('stays silent when the relay is disabled', async () => {
    vi.stubEnv('POSTHOG_ENABLED', 'false')
    try {
      expect((await POST(relayRequest())).status).toBe(204)
      expect(batches).toHaveLength(0)
    } finally {
      vi.stubEnv('POSTHOG_ENABLED', 'true')
    }
  })
})
