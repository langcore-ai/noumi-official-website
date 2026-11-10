import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

import { OFFICIAL_SITE_URL } from '@/lib/site/official-site'
import {
  OFFICIAL_ANALYTICS_CONSENT_COOKIE,
  OFFICIAL_ANALYTICS_MAX_BODY_BYTES,
  OFFICIAL_ANALYTICS_REQUEST_HEADER,
  buildClientPostHogEvents,
  buildPostHogServerConfig,
  isEventTimestampAcceptable,
  officialAnalyticsBatchSchema,
  sendPostHogBatch,
  type PostHogServerConfig,
} from '@/lib/site/analytics-events.server'

/** 接口依赖 runtime env 与 Cloudflare context，避免构建期静态化。 */
export const dynamic = 'force-dynamic'

/** 同源事件接口每分钟每 IP 的 best-effort 上限；生产仍需 WAF 速率规则兜底。 */
const RATE_LIMIT_PER_MINUTE = 60

const rateLimits = new Map<string, { count: number; windowStart: number }>()

/**
 * 读取 PostHog 服务端配置。
 * 本地优先 `process.env`，Cloudflare 运行时回落到 binding。
 *
 * @returns 服务端投递配置
 */
async function readPostHogServerConfig(): Promise<PostHogServerConfig> {
  const read = async (key: 'POSTHOG_API_HOST' | 'POSTHOG_ENABLED' | 'POSTHOG_PROJECT_KEY') => {
    const processValue = process.env[key]?.trim()
    if (processValue) {
      return processValue
    }
    try {
      const cloudflareContext = await getCloudflareContext({ async: true })
      return (
        (
          cloudflareContext.env as typeof cloudflareContext.env & {
            POSTHOG_API_HOST?: string
            POSTHOG_ENABLED?: string
            POSTHOG_PROJECT_KEY?: string
          }
        )[key]?.trim() || ''
      )
    } catch {
      return ''
    }
  }

  const [apiHost, enabledEnv, projectKey] = await Promise.all([
    read('POSTHOG_API_HOST'),
    read('POSTHOG_ENABLED'),
    read('POSTHOG_PROJECT_KEY'),
  ])

  return buildPostHogServerConfig({ apiHost, enabledEnv, projectKey })
}

/**
 * 读取同意 cookie。
 *
 * @param request 当前请求
 * @returns 用户是否同意 analytics
 */
function hasAnalyticsConsentCookie(request: Request): boolean {
  const cookie = request.headers.get('cookie') || ''
  return cookie.split(';').some((part) => part.trim() === `${OFFICIAL_ANALYTICS_CONSENT_COOKIE}=1`)
}

/**
 * 判断请求是否来自官网同源页面。
 *
 * @param request 当前请求
 * @returns 是否通过同源校验
 */
function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = new Set([new URL(request.url).origin, new URL(OFFICIAL_SITE_URL).origin])
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredSiteUrl) {
    try {
      allowedOrigins.add(new URL(configuredSiteUrl).origin)
    } catch {
      // 非法配置不参与白名单。
    }
  }

  if (origin) {
    return allowedOrigins.has(origin)
  }

  return request.headers.get('sec-fetch-site') === 'same-origin'
}

/**
 * 读取客户端 IP，用于 best-effort 限流。
 *
 * @param request 当前请求
 * @returns IP 文本；未知时返回空串
 */
function readClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  )
}

/**
 * best-effort 限流；窗口过期后清理，避免 Map 无界增长。
 *
 * @param key 限流键
 * @param now 当前时间
 * @returns 是否允许本次请求
 */
function admitRequest(key: string, now = Date.now()): boolean {
  for (const [entryKey, entry] of rateLimits) {
    if (now - entry.windowStart >= 60_000) {
      rateLimits.delete(entryKey)
    }
  }

  const entry = rateLimits.get(key)
  if (!entry) {
    rateLimits.set(key, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT_PER_MINUTE) {
    return false
  }
  entry.count += 1
  return true
}

/**
 * 接收官网浏览器事件并中继到 PostHog。
 *
 * @param request 当前请求
 * @returns 204；拒绝时返回对应错误码
 */
export async function POST(request: Request) {
  const config = await readPostHogServerConfig()
  if (!config.enabled) {
    return new Response(null, { status: 204 })
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'invalid_origin' }, { status: 403 })
  }
  if (request.headers.get(OFFICIAL_ANALYTICS_REQUEST_HEADER) !== '1') {
    return NextResponse.json({ error: 'missing_analytics_header' }, { status: 403 })
  }
  if (!hasAnalyticsConsentCookie(request)) {
    return NextResponse.json({ error: 'missing_analytics_consent' }, { status: 403 })
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'invalid_content_type' }, { status: 415 })
  }

  const clientIp = readClientIp(request)
  if (clientIp && !admitRequest(clientIp)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).byteLength > OFFICIAL_ANALYTICS_MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = officialAnalyticsBatchSchema.safeParse(parsedBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_analytics_event' }, { status: 400 })
  }

  const now = Date.now()
  if (!parsed.data.events.every((event) => isEventTimestampAcceptable(event.occurredAt, now))) {
    return NextResponse.json({ error: 'invalid_analytics_time' }, { status: 400 })
  }

  const events = buildClientPostHogEvents(parsed.data.events, new URL(OFFICIAL_SITE_URL).origin)
  if (!(await sendPostHogBatch(config, events))) {
    console.warn({
      component: 'posthog',
      event: 'relay_delivery_failed',
      count: events.length,
    })
  }

  return new Response(null, { status: 204 })
}
