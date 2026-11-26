import { describe, expect, it } from 'vitest'

import {
  buildPostHogServerConfig,
  captureOfficialServerEvent,
  normalizePostHogApiHost,
  sendPostHogBatch,
} from '@/lib/site/analytics-events.server'

/**
 * 构造可观测的 fetch 实现。
 * @param statuses 每次请求依次返回的状态码
 * @returns 调用记录与 fetch 实现
 */
function createSend(statuses: number[] = [200]) {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
  const send: typeof fetch = async (input, init) => {
    calls.push({ input, init })
    const status = statuses[Math.min(calls.length - 1, statuses.length - 1)] ?? 200
    return new Response(null, { status })
  }

  return { calls, send }
}

describe('posthog server config', () => {
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
})

describe('posthog server transport', () => {
  it('posts the batch with the project key as api_key', async () => {
    const { calls, send } = createSend()
    const config = {
      apiHost: 'https://us.i.posthog.com',
      enabled: true,
      projectKey: 'phc_test',
    }

    await expect(
      sendPostHogBatch(
        config,
        [
          {
            event: 'official_invite_request_submitted',
            distinct_id: crypto.randomUUID(),
            uuid: 'invite:1',
            timestamp: '2026-11-10T12:00:00.000Z',
            properties: { outcome: 'created' },
          },
        ],
        send,
      ),
    ).resolves.toBe(true)

    expect(String(calls[0]?.input)).toBe('https://us.i.posthog.com/batch/')
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({
      api_key: 'phc_test',
      batch: [{ event: 'official_invite_request_submitted' }],
    })
  })

  it('retries server errors once and gives up on client errors', async () => {
    const retry = createSend([500, 200])
    await expect(
      sendPostHogBatch(
        { apiHost: 'https://us.i.posthog.com', enabled: true, projectKey: 'phc_test' },
        [
          {
            event: 'official_invite_request_submitted',
            distinct_id: crypto.randomUUID(),
            uuid: 'invite:1',
            timestamp: '2026-11-10T12:00:00.000Z',
            properties: {},
          },
        ],
        retry.send,
      ),
    ).resolves.toBe(true)
    expect(retry.calls).toHaveLength(2)

    const rejected = createSend([400])
    await expect(
      sendPostHogBatch(
        { apiHost: 'https://us.i.posthog.com', enabled: true, projectKey: 'phc_test' },
        [
          {
            event: 'official_invite_request_submitted',
            distinct_id: crypto.randomUUID(),
            uuid: 'invite:1',
            timestamp: '2026-11-10T12:00:00.000Z',
            properties: {},
          },
        ],
        rejected.send,
      ),
    ).resolves.toBe(false)
    expect(rejected.calls).toHaveLength(1)
  })

  it('does nothing when disabled', async () => {
    const { calls, send } = createSend()
    await expect(
      sendPostHogBatch(
        { apiHost: 'https://us.i.posthog.com', enabled: false, projectKey: 'phc_test' },
        [
          {
            event: 'official_invite_request_submitted',
            distinct_id: crypto.randomUUID(),
            uuid: 'invite:1',
            timestamp: '2026-11-10T12:00:00.000Z',
            properties: {},
          },
        ],
        send,
      ),
    ).resolves.toBe(false)
    expect(calls).toHaveLength(0)
  })
})

describe('official server events', () => {
  it('stamps the trusted URL, client IP and person profile', async () => {
    const { calls, send } = createSend()
    const anonymousId = crypto.randomUUID()
    const delivered = await captureOfficialServerEvent(
      { apiHost: 'https://us.i.posthog.com', enabled: true, projectKey: 'phc_test' },
      {
        anonymousId,
        event: 'official_invite_request_submitted',
        eventId: 'invite:1',
        occurredAt: new Date('2026-11-10T12:00:00.000Z'),
        clientIp: '203.0.113.9',
        properties: { outcome: 'created', page_path: '/invite' },
      },
      send,
    )

    expect(delivered).toBe(true)
    const body = JSON.parse(String(calls[0]?.init?.body))
    expect(body.batch[0]).toMatchObject({
      distinct_id: anonymousId,
      event: 'official_invite_request_submitted',
      properties: {
        $current_url: 'https://noumi.ai/invite',
        $host: 'noumi.ai',
        $ip: '203.0.113.9',
        $process_person_profile: true,
        $pathname: '/invite',
        app_source: 'noumi-official',
        outcome: 'created',
        page_group: 'invite',
        page_path: '/invite',
      },
    })
  })

  it('rejects invalid anonymous ids and unknown properties without sending', async () => {
    const { calls, send } = createSend()
    const config = { apiHost: 'https://us.i.posthog.com', enabled: true, projectKey: 'phc_test' }

    await expect(
      captureOfficialServerEvent(
        config,
        {
          anonymousId: 'not-a-uuid',
          event: 'official_invite_request_submitted',
          eventId: 'invite:1',
          occurredAt: new Date('2026-11-10T12:00:00.000Z'),
          properties: { outcome: 'created' },
        },
        send,
      ),
    ).resolves.toBe(false)

    await expect(
      captureOfficialServerEvent(
        config,
        {
          anonymousId: crypto.randomUUID(),
          event: 'official_invite_request_submitted',
          eventId: 'invite:1',
          occurredAt: new Date('2026-11-10T12:00:00.000Z'),
          properties: { email: 'user@example.com' },
        },
        send,
      ),
    ).resolves.toBe(false)

    expect(calls).toHaveLength(0)
  })
})
