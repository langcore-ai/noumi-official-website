import 'server-only'
import { z } from 'zod'

import {
  OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
  OFFICIAL_SERVER_EVENT_NAMES,
  normalizeOfficialPagePath,
  officialPageGroup,
} from './analytics'
import { OFFICIAL_SITE_URL } from './official-site'

const ANONYMOUS_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu

const label = z.string().min(1).max(96)
const pathValue = z.string().min(1).max(160)

/** 服务端事件属性白名单；不接受原始 URL、query、邮箱、正文或自由文本。 */
export const officialEventPropertiesSchema = z
  .object({
    action: label.optional(),
    cta_id: label.optional(),
    country: label.optional(),
    device: label.optional(),
    device_fp: z
      .string()
      .regex(/^[0-9a-f]{8,64}$/iu)
      .optional(),
    duration_ms: z
      .number()
      .int()
      .min(0)
      .max(24 * 60 * 60 * 1000)
      .optional(),
    outcome: label.optional(),
    page_group: label.optional(),
    page_path: pathValue.optional(),
    placement: label.optional(),
    referrer_origin: z.url().max(200).optional(),
    source_path: pathValue.optional(),
    status: label.optional(),
    target_path: pathValue.optional(),
    first_touch_campaign: label.optional(),
    first_touch_content: label.optional(),
    first_touch_landing_page: pathValue.optional(),
    first_touch_medium: label.optional(),
    first_touch_referrer_origin: z.url().max(200).optional(),
    first_touch_source: label.optional(),
    first_touch_term: label.optional(),
    utm_campaign: label.optional(),
    utm_content: label.optional(),
    utm_medium: label.optional(),
    utm_source: label.optional(),
    utm_term: label.optional(),
    timezone: label.optional(),
    visitor_id: z.uuid().optional(),
  })
  .strict()

/** 服务端事件名。 */
export const officialServerEventNameSchema = z.enum(OFFICIAL_SERVER_EVENT_NAMES)

/** 服务端 PostHog 配置；仅用于服务端事实事件。 */
export type PostHogServerConfig = {
  apiHost: string
  enabled: boolean
  projectKey: string | null
}

/** 可直接投递给 PostHog `/batch/` 的事件。 */
export type PostHogBatchEvent = {
  event: string
  distinct_id: string
  uuid: string
  timestamp: string
  properties: Record<string, unknown>
}

/**
 * 解析 PostHog ingest origin。
 * 只接受不带凭据、query、hash 的 HTTP(S) origin，非法配置视为未启用。
 *
 * @param value 原始 host
 * @returns 规范化 origin；非法时返回空串
 */
export function normalizePostHogApiHost(value: string | null | undefined): string {
  const trimmed = value?.trim() || OFFICIAL_ANALYTICS_DEFAULT_API_HOST
  try {
    const url = new URL(trimmed)
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    ) {
      return ''
    }
    return url.origin
  } catch {
    return ''
  }
}

/**
 * 构造服务端 PostHog 配置。
 *
 * @param input 原始环境变量
 * @returns 投递配置；关闭或非法时 enabled=false
 */
export function buildPostHogServerConfig(input: {
  apiHost?: string | null
  enabledEnv?: string | null
  projectKey?: string | null
}): PostHogServerConfig {
  const apiHost = normalizePostHogApiHost(input.apiHost)
  const projectKey = input.projectKey?.trim() || ''
  const enabled =
    /^(1|true|yes|on)$/i.test(input.enabledEnv?.trim() || '') &&
    Boolean(projectKey) &&
    Boolean(apiHost)

  return {
    apiHost: apiHost || OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
    enabled,
    projectKey: projectKey || null,
  }
}

/**
 * 投递单个服务端事件；在业务提交成功后调用，失败不影响业务结果。
 *
 * @param config 服务端配置
 * @param input 事件事实
 * @param send fetch 实现，便于测试注入
 * @returns 是否成功送达
 */
export async function captureOfficialServerEvent(
  config: PostHogServerConfig,
  input: {
    anonymousId: string
    event: z.infer<typeof officialServerEventNameSchema>
    eventId: string
    occurredAt: Date
    clientIp?: string
    properties?: Record<string, unknown>
  },
  send: typeof fetch = fetch,
): Promise<boolean> {
  const parsedProperties = officialEventPropertiesSchema.safeParse(input.properties ?? {})
  if (!parsedProperties.success || !ANONYMOUS_ID_PATTERN.test(input.anonymousId)) {
    return false
  }

  const pagePath = normalizeOfficialPagePath(parsedProperties.data.page_path || '/invite')
  const pageUrl = new URL(pagePath, OFFICIAL_SITE_URL)
  return sendPostHogBatch(
    config,
    [
      {
        event: input.event,
        distinct_id: input.anonymousId,
        uuid: input.eventId,
        timestamp: input.occurredAt.toISOString(),
        properties: {
          ...parsedProperties.data,
          page_path: pagePath,
          page_group: officialPageGroup(pagePath),
          $current_url: pageUrl.href,
          $pathname: pageUrl.pathname,
          $host: pageUrl.host,
          ...(input.clientIp ? { $ip: input.clientIp } : { $geoip_disable: true }),
          $process_person_profile: true,
          app_source: 'noumi-official',
          schema_version: 1,
        },
      },
    ],
    send,
  )
}

/**
 * 把一批事件投递到 PostHog `/batch/`。
 * 429/5xx 在请求内重试一次；其余失败只返回结果，由调用方记录日志。
 *
 * @param config 服务端配置
 * @param events 待投递事件
 * @param send fetch 实现，便于测试注入
 * @returns 是否成功送达
 */
export async function sendPostHogBatch(
  config: PostHogServerConfig,
  events: PostHogBatchEvent[],
  send: typeof fetch = fetch,
): Promise<boolean> {
  if (!config.enabled || !config.projectKey || events.length === 0) {
    return false
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await send(`${config.apiHost}/batch/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ api_key: config.projectKey, batch: events }),
        signal: AbortSignal.timeout(5_000),
      })

      if (response.ok) {
        return true
      }
      if (response.status !== 429 && response.status < 500) {
        return false
      }
    } catch {
      // 网络错误与超时按可重试处理，最多两次。
    }
  }

  return false
}
