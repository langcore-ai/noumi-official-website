import { describe, expect, it, vi } from 'vitest'

import {
  buildClientPostHogEvents,
  buildPostHogServerConfig,
  isEventTimestampAcceptable,
  normalizePostHogApiHost,
  officialAnalyticsBatchSchema,
  officialClientEventSchema,
  sendPostHogBatch,
} from '@/lib/site/analytics-events.server'

const uuid = () => crypto.randomUUID()

/**
 * 构造合法客户端事件。
 * @param overrides 覆盖字段
 * @returns 事件
 */
function event(overrides: Record<string, unknown> = {}) {
  return {
    event: '$pageview',
    eventId: uuid(),
    occurredAt: new Date().toISOString(),
    anonymousId: uuid(),
    properties: { page_path: '/pricing' },
    ...overrides,
  }
}

describe('analytics relay schema', () => {
  it('accepts allowlisted events and rejects unknown ones', () => {
    expect(officialClientEventSchema.safeParse(event()).success).toBe(true)
    expect(officialClientEventSchema.safeParse(event({ event: 'app_active' })).success).toBe(false)
    expect(
      officialClientEventSchema.safeParse(event({ event: 'official_invite_request_submitted' }))
        .success,
    ).toBe(false)
  })

  it('rejects unknown properties and browser-provided URLs', () => {
    expect(
      officialClientEventSchema.safeParse(event({ properties: { email: 'a@b.c' } })).success,
    ).toBe(false)
    expect(
      officialClientEventSchema.safeParse(
        event({ properties: { $current_url: 'https://evil.test/x' } }),
      ).success,
    ).toBe(false)
    expect(
      officialClientEventSchema.safeParse(event({ properties: { token: 'phc_x' } })).success,
    ).toBe(false)
  })

  it('rejects malformed ids, timestamps and oversized labels', () => {
    expect(officialClientEventSchema.safeParse(event({ eventId: 'not-a-uuid' })).success).toBe(
      false,
    )
    expect(officialClientEventSchema.safeParse(event({ occurredAt: 'yesterday' })).success).toBe(
      false,
    )
    expect(
      officialClientEventSchema.safeParse(event({ properties: { cta_id: 'x'.repeat(120) } }))
        .success,
    ).toBe(false)
  })

  it('caps the batch size', () => {
    expect(
      officialAnalyticsBatchSchema.safeParse({
        events: Array.from({ length: 21 }, () => event()),
      }).success,
    ).toBe(false)
    expect(officialAnalyticsBatchSchema.safeParse({ events: [] }).success).toBe(false)
  })

  it('only accepts event timestamps inside the allowed window', () => {
    const now = Date.parse('2026-11-10T12:00:00.000Z')
    expect(isEventTimestampAcceptable('2026-11-10T12:10:00.000Z', now)).toBe(true)
    expect(isEventTimestampAcceptable('2026-11-10T13:00:00.000Z', now)).toBe(false)
    expect(isEventTimestampAcceptable('2026-11-09T12:00:00.000Z', now)).toBe(false)
  })
})

describe('analytics relay transport', () => {
  it('requires an explicit enable flag, project key and valid host', () => {
    expect(
      buildPostHogServerConfig({
        apiHost: 'https://us.i.posthog.com',
        enabledEnv: 'true',
        projectKey: 'phc_test',
      }),
    ).toEqual({ apiHost: 'https://us.i.posthog.com', enabled: true, projectKey: 'phc_test' })

    expect(
      buildPostHogServerConfig({
        apiHost: 'https://us.i.posthog.com',
        enabledEnv: 'false',
        projectKey: 'phc_test',
      }).enabled,
    ).toBe(false)
    expect(
      buildPostHogServerConfig({ enabledEnv: 'true', projectKey: 'phc_test', apiHost: '' }).enabled,
    ).toBe(true)
    expect(
      buildPostHogServerConfig({
        apiHost: 'https://user:pass@us.i.posthog.com/path',
        enabledEnv: 'true',
        projectKey: 'phc_test',
      }).enabled,
    ).toBe(false)
  })

  it('normalizes only bare origins', () => {
    expect(normalizePostHogApiHost('us.i.posthog.com')).toBe('')
    expect(normalizePostHogApiHost('https://us.i.posthog.com/')).toBe('https://us.i.posthog.com')
    expect(normalizePostHogApiHost('https://us.i.posthog.com/x')).toBe('')
    expect(normalizePostHogApiHost('ftp://us.i.posthog.com')).toBe('')
  })

  it('constructs trusted URL fields from the official origin', () => {
    const [built] = buildClientPostHogEvents(
      officialAnalyticsBatchSchema.parse({
        events: [event({ properties: { page_path: '/blog/post?x=1#y' } })],
      }).events,
      'https://noumi.ai',
    )

    expect(built.properties).toMatchObject({
      $current_url: 'https://noumi.ai/blog/post',
      $host: 'noumi.ai',
      $pathname: '/blog/post',
      $geoip_disable: true,
      $process_person_profile: false,
      app_source: 'noumi-official',
      page_group: 'blog',
      page_path: '/blog/post',
      schema_version: 1,
    })
    expect(built.properties).not.toHaveProperty('token')
  })

  it('posts the batch with the project key as api_key', async () => {
    const send = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 200 }),
    )
    const config = {
      apiHost: 'https://us.i.posthog.com',
      enabled: true,
      projectKey: 'phc_test',
    }
    const events = buildClientPostHogEvents(
      officialAnalyticsBatchSchema.parse({ events: [event()] }).events,
      'https://noumi.ai',
    )

    await expect(sendPostHogBatch(config, events, send)).resolves.toBe(true)
    const [url, init] = send.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://us.i.posthog.com/batch/')
    expect(JSON.parse(String(init.body))).toMatchObject({ api_key: 'phc_test' })
  })

  it('retries server errors once and gives up on client errors', async () => {
    const events = buildClientPostHogEvents(
      officialAnalyticsBatchSchema.parse({ events: [event()] }).events,
      'https://noumi.ai',
    )
    const config = { apiHost: 'https://us.i.posthog.com', enabled: true, projectKey: 'phc_test' }

    const retrying = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    await expect(sendPostHogBatch(config, events, retrying)).resolves.toBe(true)
    expect(retrying).toHaveBeenCalledTimes(2)

    const rejecting = vi.fn(async () => new Response(null, { status: 400 }))
    await expect(sendPostHogBatch(config, events, rejecting)).resolves.toBe(false)
    expect(rejecting).toHaveBeenCalledTimes(1)
  })

  it('does nothing when disabled', async () => {
    const send = vi.fn(async () => new Response(null, { status: 200 }))
    await expect(
      sendPostHogBatch(
        { apiHost: 'https://us.i.posthog.com', enabled: false, projectKey: null },
        [],
        send,
      ),
    ).resolves.toBe(false)
    expect(send).not.toHaveBeenCalled()
  })
})
