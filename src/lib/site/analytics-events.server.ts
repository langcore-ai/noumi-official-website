import 'server-only'
import { z } from 'zod'

import {
  OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
  OFFICIAL_CLIENT_EVENT_NAMES,
  OFFICIAL_SERVER_EVENT_NAMES,
  normalizeOfficialPagePath,
  officialPageGroup,
} from './analytics'
import { OFFICIAL_SITE_URL } from './official-site'

export { OFFICIAL_ANALYTICS_CONSENT_COOKIE } from './consent-shared'

/** 官网事件接口允许的最大请求体字节数。 */
export const OFFICIAL_ANALYTICS_MAX_BODY_BYTES = 16 * 1024

/** 单个批次允许的最大事件数。 */
export const OFFICIAL_ANALYTICS_MAX_BATCH_SIZE = 20

/** 浏览器必须携带的自定义请求头，跨站简单请求无法伪造。 */
export const OFFICIAL_ANALYTICS_REQUEST_HEADER = 'x-noumi-analytics'

/** 事件发生时间与服务端当前时间的最大偏差。 */
const MAX_EVENT_AGE_MS = 30 * 60 * 1000

const ANONYMOUS_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu

const label = z.string().min(1).max(96)
const pathValue = z.string().min(1).max(160)

/** 官网事件属性白名单；不接受原始 URL、query、邮箱、正文或自由文本。 */
export const officialEventPropertiesSchema = z
  .object({
    action: label.optional(),
    cta_id: label.optional(),
    outcome: label.optional(),
    page_group: label.optional(),
    page_path: pathValue.optional(),
    placement: label.optional(),
    referrer_origin: z.url().max(200).optional(),
    source_path: pathValue.optional(),
    status: label.optional(),
    target_path: pathValue.optional(),
    utm_campaign: label.optional(),
    utm_content: label.optional(),
    utm_medium: label.optional(),
    utm_source: label.optional(),
    utm_term: label.optional(),
    $session_id: z.uuid().optional(),
    $window_id: z.uuid().optional(),
  })
  .strict()

/** 浏览器可提交的单个事件。 */
export const officialClientEventSchema = z
  .object({
    event: z.enum(OFFICIAL_CLIENT_EVENT_NAMES),
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    anonymousId: z.uuid(),
    properties: officialEventPropertiesSchema,
  })
  .strict()

/** 浏览器事件批量请求体。 */
export const officialAnalyticsBatchSchema = z
  .object({
    events: z.array(officialClientEventSchema).min(1).max(OFFICIAL_ANALYTICS_MAX_BATCH_SIZE),
  })
  .strict()

/** 服务端事件名。 */
export const officialServerEventNameSchema = z.enum(OFFICIAL_SERVER_EVENT_NAMES)

/** 服务端 PostHog 配置；project key 与 host 不下发浏览器。 */
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
 * 把浏览器事件转换为 PostHog batch 事件。
 * 页面 URL、host、path 由服务端按可信 origin 构造，浏览器不能覆盖。
 *
 * @param events 已校验的浏览器事件
 * @param officialOrigin 官网可信 origin
 * @returns PostHog batch 事件
 */
export function buildClientPostHogEvents(
  events: z.infer<typeof officialClientEventSchema>[],
  officialOrigin: string,
): PostHogBatchEvent[] {
  return events.map((event) => {
    const pagePath = normalizeOfficialPagePath(event.properties.page_path || '/')
    const pageUrl = new URL(pagePath, officialOrigin)

    return {
      event: event.event,
      distinct_id: event.anonymousId,
      uuid: event.eventId,
      timestamp: event.occurredAt,
      properties: {
        ...event.properties,
        page_path: pagePath,
        page_group: event.properties.page_group || officialPageGroup(pagePath),
        $current_url: pageUrl.href,
        $pathname: pageUrl.pathname,
        $host: pageUrl.host,
        $process_person_profile: false,
        $geoip_disable: true,
        app_source: 'noumi-official',
        schema_version: 1,
      },
    }
  })
}

/**
 * 投递单个服务端事件；在业务提交成功后调用，失败不影响业务结果。
 *
 * @param config 服务端配置
 * @param input 事件事实
 * @returns 是否成功送达
 */
export async function captureOfficialServerEvent(
  config: PostHogServerConfig,
  input: {
    anonymousId: string
    event: z.infer<typeof officialServerEventNameSchema>
    eventId: string
    occurredAt: Date
    properties?: Record<string, unknown>
  },
): Promise<boolean> {
  const parsedProperties = officialEventPropertiesSchema.safeParse(input.properties ?? {})
  if (!parsedProperties.success || !ANONYMOUS_ID_PATTERN.test(input.anonymousId)) {
    return false
  }

  const pagePath = normalizeOfficialPagePath(parsedProperties.data.page_path || '/invite')
  const pageUrl = new URL(pagePath, OFFICIAL_SITE_URL)
  return sendPostHogBatch(config, [
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
        $process_person_profile: false,
        $geoip_disable: true,
        app_source: 'noumi-official',
        schema_version: 1,
      },
    },
  ])
}

/**
 * 判断事件时间是否落在允许窗口内。
 *
 * @param occurredAt ISO 时间
 * @param now 当前时间
 * @returns 是否可以接受
 */
export function isEventTimestampAcceptable(occurredAt: string, now = Date.now()): boolean {
  const timestamp = Date.parse(occurredAt)
  return Number.isFinite(timestamp) && Math.abs(now - timestamp) <= MAX_EVENT_AGE_MS
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
