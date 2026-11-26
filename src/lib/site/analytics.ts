/** 官网分析配置的默认 PostHog ingest 地址。 */
export const OFFICIAL_ANALYTICS_DEFAULT_API_HOST = 'https://us.i.posthog.com'

/** 浏览器使用的同域 PostHog ingest 路径；Worker 在该路径下原样转发到 PostHog。 */
export const OFFICIAL_ANALYTICS_BROWSER_API_PATH = '/ingest'

/** PostHog 应用地址；reverse proxy 下只用于 SDK 的工具栏链接。 */
export const OFFICIAL_ANALYTICS_UI_HOST = 'https://us.posthog.com'

/** 官网 GA4 Measurement ID。 */
export const OFFICIAL_GOOGLE_TAG_ID = 'G-TJBXDRBMVM'

/** window 上标记 GA4 初始化是否已完成的字段名。 */
export const OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG = 'noumiOfficialGoogleTagBootstrapped'

/** 官网浏览器可见的 PostHog 配置；project key 是公开写 key，host 固定为同域 ingest 路径。 */
export type PublicOfficialAnalyticsConfig = {
  enabled: boolean
  apiHost: string | null
  projectKey: string | null
  uiHost: string | null
}

/** 官网分析属性值类型。 */
export type OfficialAnalyticsPrimitive = string | number | boolean | null

/** 官网分析属性集合。 */
export type OfficialAnalyticsProperties = Record<string, OfficialAnalyticsPrimitive>

/** 官网 GA4 page_view 事件参数。 */
export type OfficialGoogleTagPageViewPayload = {
  page_location: string
  page_path: string
  page_title?: string
}

/** 官网识别渠道用的 UTM 参数；事件、GA4 与产品侧透传共用同一份白名单。 */
export const OFFICIAL_UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const

/**
 * 官网首触归因快照。
 *
 * 保存访客第一次被识别出渠道时（utm 或站外 referrer）的来源，之后每次事件与
 * 产品侧跳转都复用它，避免站内翻页后来源丢失（断点清单 W1/W4/W7）。
 */
export type OfficialFirstTouch = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer_origin?: string
  landing_page: string
  captured_at: string
}

/** GA4 consent mode 支持的授权值。 */
export type OfficialGoogleTagConsentValue = 'denied' | 'granted'

/** 官网 GA4 consent mode 参数。 */
export type OfficialGoogleTagConsentPayload = {
  ad_personalization: OfficialGoogleTagConsentValue
  ad_storage: OfficialGoogleTagConsentValue
  ad_user_data: OfficialGoogleTagConsentValue
  analytics_storage: OfficialGoogleTagConsentValue
}

/** 浏览器允许上报的官网埋点事件名；标准页面事件由 posthog-js 自动产生。 */
export const OFFICIAL_CLIENT_EVENT_NAMES = [
  'landing_page_viewed',
  'official_cta_clicked',
  'official_page_engagement',
  'official_invite_lookup_completed',
  'official_product_auth_redirected',
] as const

/** 只能由服务端在业务成功后上报的官网埋点事件名。 */
export const OFFICIAL_SERVER_EVENT_NAMES = ['official_invite_request_submitted'] as const

/** 浏览器可上报的官网埋点事件名类型。 */
export type OfficialClientEventName = (typeof OFFICIAL_CLIENT_EVENT_NAMES)[number]

/** 服务端可上报的官网埋点事件名类型。 */
export type OfficialServerEventName = (typeof OFFICIAL_SERVER_EVENT_NAMES)[number]

const ANALYTICS_TEXT_KEYS = new Set([
  'visitor_id',
  'action',
  'device',
  'device_fp',
  'app_surface',
  'cta_id',
  'official_cta_id',
  'outcome',
  'placement',
  'source_surface',
  'status',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
  'first_touch_source',
  'first_touch_medium',
  'first_touch_campaign',
  'first_touch_content',
  'first_touch_term',
])

const ANALYTICS_PATH_KEYS = new Set([
  'first_touch_landing_page',
  'page_path',
  'source_path',
  'target_path',
])

const ANALYTICS_ORIGIN_KEYS = new Set(['first_touch_referrer_origin', 'referrer_origin'])

const TEXT_VALUE_MAX_LENGTH = 96

const PATH_VALUE_MAX_LENGTH = 160

/** 外跳归因里匿名 distinct id 的最大长度。 */
const DISTINCT_ID_VALUE_MAX_LENGTH = 160

const PAGE_TITLE_VALUE_MAX_LENGTH = 300

/**
 * 判断事件名是否属于浏览器允许上报的埋点集合。
 * @param value 待判断的事件名
 * @returns 是否为受支持的客户端事件名
 */
export function isOfficialClientEventName(value: string): value is OfficialClientEventName {
  return (OFFICIAL_CLIENT_EVENT_NAMES as readonly string[]).includes(value)
}

/**
 * 规范化文本值，避免把超长或空白字符串直接送入分析系统。
 * @param value 原始值
 * @param maxLength 允许的最长长度
 * @returns 规范化后的文本；无效时返回空串
 */
function normalizeTextValue(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().slice(0, maxLength)
}

/**
 * 判断字符串是否属于可追踪的路径或 URL。
 * @param value 待判断文本
 * @returns 是否为可追踪值
 */
function isTrackableUrlLike(value: string): boolean {
  return value.startsWith('/') || /^https?:\/\//i.test(value)
}

const OFFICIAL_STATIC_PAGE_PATHS = new Set([
  '/',
  '/about',
  '/auth',
  '/blog',
  '/contact',
  '/faqs',
  '/features',
  '/invite',
  '/links',
  '/pricing',
  '/privacy',
  '/terms',
  '/use-cases',
])

const OFFICIAL_DYNAMIC_PAGE_PATH = /^\/(?:blog|features|use-cases)\/[a-z0-9][a-z0-9-]{0,95}$/

/**
 * 规范化官网公开页面路径，拒绝 query/hash、动态私有路径和原型路径。
 *
 * @param value 原始 pathname
 * @returns 公开路径模板；未知路径返回 `/other`
 */
export function normalizeOfficialPagePath(value: string): string {
  const rawPath = value.split(/[?#]/, 1)[0]?.trim() || ''
  if (
    !rawPath.startsWith('/') ||
    rawPath.length > PATH_VALUE_MAX_LENGTH ||
    rawPath.includes('..')
  ) {
    return '/other'
  }

  const normalizedPath = rawPath.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
  if (OFFICIAL_STATIC_PAGE_PATHS.has(normalizedPath)) {
    return normalizedPath
  }
  if (OFFICIAL_DYNAMIC_PAGE_PATH.test(normalizedPath)) {
    return normalizedPath
  }
  return '/other'
}

/**
 * 将官网路径归入稳定的功能分组，避免下游按动态 slug 聚合。
 *
 * @param value 原始 pathname
 * @returns 功能分组
 */
export function officialPageGroup(value: string): string {
  const pagePath = normalizeOfficialPagePath(value)
  if (pagePath === '/') return 'home'
  if (pagePath === '/privacy' || pagePath === '/terms') return 'legal'
  return pagePath.split('/')[1] || 'other'
}

/**
 * 规范化路径或 URL。
 * 结果只保留 path，不保留 query/hash，也不保留完整域名。
 *
 * @param value 原始文本
 * @param baseUrl 用于解析相对路径的基准 URL
 * @returns 规范化后的站内路径；非法值返回空串
 */
function normalizePathLike(value: string, baseUrl: string): string {
  const trimmedValue = value.trim()
  if (!trimmedValue || !isTrackableUrlLike(trimmedValue)) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedValue, baseUrl)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return ''
    }

    const normalizedPath = parsedUrl.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '')
    return normalizedPath || '/'
  } catch {
    return ''
  }
}

/**
 * 规范化来源域名，只保留 origin。
 * @param value 原始文本
 * @param baseUrl 用于解析相对路径的基准 URL
 * @returns 规范化后的 origin；非法值返回空串
 */
function normalizeOriginLike(value: string, baseUrl: string): string {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedValue, baseUrl)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return ''
    }

    return parsedUrl.origin
  } catch {
    return ''
  }
}

/**
 * 规范化并裁剪官网分析属性，避免敏感值和超长值进入 PostHog。
 * @param properties 原始属性
 * @param baseUrl 解析相对路径时使用的基准 URL
 * @returns 清洗后的属性集合
 */
export function sanitizeOfficialAnalyticsProperties(
  properties: Record<string, unknown>,
  baseUrl: string,
): OfficialAnalyticsProperties {
  const sanitizedProperties: OfficialAnalyticsProperties = {}

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) {
      continue
    }

    if (ANALYTICS_PATH_KEYS.has(key)) {
      if (typeof value !== 'string') {
        continue
      }

      const normalizedPath = normalizePathLike(value, baseUrl)
      if (normalizedPath) {
        sanitizedProperties[key] = normalizedPath.slice(0, PATH_VALUE_MAX_LENGTH)
      }
      continue
    }

    if (ANALYTICS_ORIGIN_KEYS.has(key)) {
      if (typeof value !== 'string') {
        continue
      }

      const normalizedOrigin = normalizeOriginLike(value, baseUrl)
      if (normalizedOrigin) {
        sanitizedProperties[key] = normalizedOrigin
      }
      continue
    }

    if (ANALYTICS_TEXT_KEYS.has(key)) {
      const normalizedText = normalizeTextValue(value, TEXT_VALUE_MAX_LENGTH)
      if (normalizedText) {
        sanitizedProperties[key] = normalizedText
      }
      continue
    }

    if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      sanitizedProperties[key] = value as OfficialAnalyticsPrimitive
    }
  }

  return sanitizedProperties
}

/**
 * 把首触快照转换成事件属性，供每个事件携带来源（W1/W2/W3/W4）。
 *
 * 输出两套键：
 * - `first_touch_*`：本条访问的首触渠道，站内翻页后仍然存在。
 * - `utm_*`：当前地址栏里的 UTM（用户中途点开新的活动链接时覆盖首触）。
 *
 * @param firstTouch 首触快照
 * @param current 当前地址栏与 referrer（可选）
 * @returns 可上报的来源属性
 */
export function buildOfficialAttributionProperties(
  firstTouch: OfficialFirstTouch | null,
  current?: { baseUrl: string; pathname?: string; referrer?: string | null; search?: string },
): OfficialAnalyticsProperties {
  const properties: OfficialAnalyticsProperties = {}

  if (firstTouch) {
    for (const key of OFFICIAL_UTM_KEYS) {
      const value = firstTouch[key]
      if (value) {
        properties[`first_touch_${key.slice('utm_'.length)}`] = value
      }
    }
    if (firstTouch.referrer_origin) {
      properties.first_touch_referrer_origin = firstTouch.referrer_origin
    }
    properties.first_touch_landing_page = firstTouch.landing_page
  }

  if (current) {
    const searchParams = new URLSearchParams(
      current.search?.startsWith('?') ? current.search.slice(1) : (current.search ?? ''),
    )
    for (const key of OFFICIAL_UTM_KEYS) {
      const value = (searchParams.get(key) || '').trim().slice(0, TEXT_VALUE_MAX_LENGTH)
      if (value) {
        properties[key] = value
      }
    }

    const trimmedReferrer = current.referrer?.trim()
    if (trimmedReferrer) {
      try {
        const parsedReferrer = new URL(trimmedReferrer)
        if (
          (parsedReferrer.protocol === 'http:' || parsedReferrer.protocol === 'https:') &&
          parsedReferrer.origin !== new URL(current.baseUrl).origin
        ) {
          properties.referrer_origin = parsedReferrer.origin
        }
      } catch {
        // 非法 referrer 不构成来源。
      }
    }
  }

  return properties
}

/**
 * 构建官网跳转产品侧时的归因参数。
 *
 * 同时写两套键：产品侧 `/auth` 埋点读标准 `utm_*`，官网历史契约保留
 * `first_touch_*`。UTM 是渠道信息而非个人数据，因此不受 analytics 同意门控；
 * 匿名 ID 与 visitor_id 是否出现由调用方按同意状态决定（断点清单 W7）。
 *
 * @param options 首触归因、CTA 标识与可选匿名身份
 * @returns URL 查询参数；仅包含白名单元数据
 */
export function buildOfficialOutboundAttributionParams(options: {
  anonymousDistinctId?: string | null
  baseUrl: string
  ctaId?: string | null
  firstTouch: OfficialFirstTouch | null
  visitorId?: string
}): URLSearchParams {
  const params = new URLSearchParams()

  if (options.firstTouch) {
    const properties = buildOfficialAttributionProperties(options.firstTouch)
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string' && value) {
        params.set(key, value)
      }
    }

    // 产品侧 /auth 只认标准 UTM 键，官网渠道因此必须原样带上。
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const) {
      const value = options.firstTouch[key]
      if (value) {
        params.set(key, value)
      }
    }
  }

  const trimmedCtaId = (options.ctaId || '').trim().slice(0, TEXT_VALUE_MAX_LENGTH)
  if (trimmedCtaId) {
    params.set('official_cta_id', trimmedCtaId)
  }
  const anonymousDistinctId = (options.anonymousDistinctId || '')
    .trim()
    .slice(0, DISTINCT_ID_VALUE_MAX_LENGTH)
  if (anonymousDistinctId) {
    params.set('posthog_anonymous_distinct_id', anonymousDistinctId)
  }
  if (
    options.visitorId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      options.visitorId,
    )
  ) {
    params.set('visitor_id', options.visitorId)
  }
  params.set('source_surface', 'official')

  return params
}

/**
 * 构建 GA4 page_view 参数。
 * 路径与地址会去掉 query/hash，保持与官网现有匿名分析的隐私边界一致。
 *
 * @param input 当前页面位置
 * @returns 可直接传给 gtag page_view 的参数
 */
export function buildOfficialGoogleTagPageViewPayload(input: {
  baseUrl: string
  pathname: string
  search?: string
  title?: string | null
}): OfficialGoogleTagPageViewPayload {
  const pagePath = normalizePathLike(input.pathname, input.baseUrl) || '/'
  const pageLocationUrl = new URL(pagePath, input.baseUrl)
  const searchParams = new URLSearchParams(input.search || '')
  for (const key of OFFICIAL_UTM_KEYS) {
    const value = searchParams.get(key)?.trim()
    if (value) {
      pageLocationUrl.searchParams.set(key, normalizeTextValue(value, TEXT_VALUE_MAX_LENGTH))
    }
  }
  const pageLocation = pageLocationUrl.toString()
  const pageTitle = normalizeTextValue(input.title, PAGE_TITLE_VALUE_MAX_LENGTH)
  const payload: OfficialGoogleTagPageViewPayload = {
    page_location: pageLocation,
    page_path: pagePath,
  }

  if (pageTitle) {
    payload.page_title = pageTitle
  }

  return payload
}

/**
 * 构建 GA4 consent mode 参数。
 * 广告相关授权保持关闭；站点分析不依赖 cookie 同意，analytics_storage 固定授权。
 *
 * @returns 可传给 gtag consent 命令的参数
 */
export function buildOfficialGoogleTagConsentPayload(): OfficialGoogleTagConsentPayload {
  return {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: 'granted',
  }
}

/**
 * 构建官网 GA4 初始化脚本。
 * 初始化必须早于外链 gtag.js 稳定存在，自动 page_view 继续关闭，由客户端 Provider 发送去敏后的页面事件。
 *
 * @returns 可安全注入前台 layout 的 inline script 内容
 */
export function buildOfficialGoogleTagBootstrapScript(): string {
  const googleTagId = JSON.stringify(OFFICIAL_GOOGLE_TAG_ID)
  const bootstrapFlag = JSON.stringify(OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG)

  return `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
(function(){
  window.gtag('consent', 'default', {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: 'granted'
  });
  window.gtag('js', new Date());
  window.gtag('config', ${googleTagId}, { send_page_view: false });
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  window[${bootstrapFlag}] = true;
})();
`.trim()
}

/**
 * 解析浏览器可见的 PostHog 配置。
 * project key 是公开写 key；浏览器只拿到同域 ingest 路径，不直接连接 PostHog。
 *
 * @param input 原始环境配置
 * @returns 浏览器配置；关闭时不下发 key
 */
export function buildPublicOfficialAnalyticsConfig(input: {
  enabledEnv?: string | null
  projectKey?: string | null
}): PublicOfficialAnalyticsConfig {
  const projectKey = input.projectKey?.trim() || ''
  const enabled = /^(1|true|yes|on)$/i.test(input.enabledEnv?.trim() || '') && Boolean(projectKey)

  if (!enabled) {
    return {
      apiHost: null,
      enabled: false,
      projectKey: null,
      uiHost: null,
    }
  }

  return {
    apiHost: OFFICIAL_ANALYTICS_BROWSER_API_PATH,
    enabled: true,
    projectKey,
    uiHost: OFFICIAL_ANALYTICS_UI_HOST,
  }
}
