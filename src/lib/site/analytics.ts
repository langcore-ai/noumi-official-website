/** 官网分析配置的默认 PostHog UI 地址。 */
export const OFFICIAL_ANALYTICS_DEFAULT_UI_HOST = 'https://us.posthog.com'

/** 官网分析配置的默认代理采集地址。 */
export const OFFICIAL_ANALYTICS_DEFAULT_API_HOST = 'https://e.noumi.ai'

/** PostHog 浏览器可见配置。 */
export type PublicOfficialAnalyticsConfig = {
  enabled: boolean
  projectKey: string | null
  apiHost: string | null
  uiHost: string | null
}

/** 官网分析属性值类型。 */
export type OfficialAnalyticsPrimitive = string | number | boolean | null

/** 官网分析属性集合。 */
export type OfficialAnalyticsProperties = Record<string, OfficialAnalyticsPrimitive>

/** 可上报的官网埋点事件名。 */
export const OFFICIAL_ANALYTICS_EVENT_NAMES = [
  '$pageview',
  'app_active',
  'landing_page_viewed',
  'official_page_viewed',
  'official_cta_clicked',
  'official_invite_lookup_completed',
  'official_invite_request_submitted',
  'official_product_auth_redirected',
] as const

/** 可上报的官网埋点事件名类型。 */
export type OfficialAnalyticsEventName = (typeof OFFICIAL_ANALYTICS_EVENT_NAMES)[number]

const ANALYTICS_TEXT_KEYS = new Set([
  'action',
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
])

const ANALYTICS_PATH_KEYS = new Set(['first_touch_landing_page', 'page_path', 'source_path', 'target_path'])

const ANALYTICS_ORIGIN_KEYS = new Set(['first_touch_referrer_origin', 'referrer_origin'])

const POSTHOG_SYSTEM_TEXT_KEYS = new Set(['token', 'distinct_id'])

const POSTHOG_SYSTEM_URL_KEYS = new Set([
  '$current_url',
  '$initial_current_url',
  '$initial_referrer',
  '$referrer',
])

const TEXT_VALUE_MAX_LENGTH = 96

const PATH_VALUE_MAX_LENGTH = 160

const DISTINCT_ID_VALUE_MAX_LENGTH = 160

const POSTHOG_SYSTEM_TEXT_VALUE_MAX_LENGTH = 300

/**
 * 判断事件名是否属于当前允许上报的埋点集合。
 * @param value 待判断的事件名
 * @returns 是否为受支持事件名
 */
export function isOfficialAnalyticsEventName(value: string): value is OfficialAnalyticsEventName {
  return (OFFICIAL_ANALYTICS_EVENT_NAMES as readonly string[]).includes(value)
}

/**
 * 读取并规范化布尔型环境变量。
 * @param value 原始环境变量
 * @returns 布尔结果
 */
function readBooleanEnv(value: string | null | undefined): boolean {
  return /^(1|true|yes|on)$/i.test(value?.trim() || '')
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
 * 规范化 PostHog SDK 自动属性里的完整 URL。
 * 只去掉 query/hash，保留 origin 和 path，避免泄露参数同时保留 PostHog 页面归因能力。
 *
 * @param value 原始 URL 或路径
 * @param baseUrl 用于解析相对路径的基准 URL
 * @returns 不含 query/hash 的完整 URL；非法值返回空串
 */
function normalizeUrlWithoutSearch(value: string, baseUrl: string): string {
  const trimmedValue = value.trim()
  if (!trimmedValue || !isTrackableUrlLike(trimmedValue)) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedValue, baseUrl)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return ''
    }

    parsedUrl.search = ''
    parsedUrl.hash = ''
    return parsedUrl.toString().slice(0, POSTHOG_SYSTEM_TEXT_VALUE_MAX_LENGTH)
  } catch {
    return ''
  }
}

/**
 * 规范化 host 或 URL，允许传入裸域名或完整 URL。
 * @param value 原始 host/url
 * @param fallback 兜底地址
 * @returns 规范化后的 origin；非法值返回兜底
 */
function normalizeHostUrl(value: string, fallback: string): string {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return fallback
  }

  const withScheme = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`

  try {
    const parsedUrl = new URL(withScheme)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return fallback
    }

    return parsedUrl.origin
  } catch {
    return fallback
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
 * 清洗 PostHog 浏览器 SDK 即将发送的属性。
 *
 * 业务属性仍走官网 allowlist；同时保留 SDK 必需的 token、distinct_id 与 `$` 系统属性。
 * PostHog 的 `/e/` 端点依赖 `properties.token` 识别项目，误删会导致 401。
 *
 * @param properties PostHog SDK 组装后的原始属性
 * @param baseUrl 解析相对路径时使用的基准 URL
 * @returns 可发送给 PostHog 的属性集合
 */
export function sanitizeOfficialBrowserEventProperties(
  properties: Record<string, unknown>,
  baseUrl: string,
): OfficialAnalyticsProperties {
  const sanitizedProperties = sanitizeOfficialAnalyticsProperties(properties, baseUrl)

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) {
      continue
    }

    if (POSTHOG_SYSTEM_URL_KEYS.has(key)) {
      if (typeof value !== 'string') {
        continue
      }

      const normalizedUrl = normalizeUrlWithoutSearch(value, baseUrl)
      if (normalizedUrl) {
        sanitizedProperties[key] = normalizedUrl
      }
      continue
    }

    if (POSTHOG_SYSTEM_TEXT_KEYS.has(key) || key.startsWith('$')) {
      if (typeof value === 'string') {
        const normalizedText = normalizeTextValue(value, POSTHOG_SYSTEM_TEXT_VALUE_MAX_LENGTH)
        if (normalizedText) {
          sanitizedProperties[key] = normalizedText
        }
        continue
      }

      if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
        sanitizedProperties[key] = value as OfficialAnalyticsPrimitive
      }
    }
  }

  return sanitizedProperties
}

/**
 * 从浏览器地址栏提取允许上报的来源参数。
 * @param options 当前地址与 referrer
 * @returns 仅包含允许字段的来源属性
 */
export function buildOfficialLandingSourceProperties(options: {
  baseUrl: string
  referrer?: string | null
  search: string
}): OfficialAnalyticsProperties {
  const properties: OfficialAnalyticsProperties = {}
  const searchParams = new URLSearchParams(options.search.startsWith('?') ? options.search.slice(1) : options.search)

  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const) {
    const value = searchParams.get(key)?.trim()
    if (value) {
      properties[key] = normalizeTextValue(value, TEXT_VALUE_MAX_LENGTH)
    }
  }

  const referrer = options.referrer?.trim()
  if (referrer) {
    const referrerOrigin = normalizeOriginLike(referrer, options.baseUrl)
    if (referrerOrigin) {
      properties.referrer_origin = referrerOrigin
    }
  }

  return properties
}

/**
 * 构建官网跳转产品侧时可透传的安全归因参数。
 * @param options 当前地址、referrer 与 CTA 标识
 * @returns URL 查询参数；仅包含白名单元数据
 */
export function buildOfficialOutboundAttributionParams(options: {
  anonymousDistinctId?: string | null
  baseUrl: string
  ctaId?: string | null
  landingPage: string
  referrer?: string | null
  search: string
}): URLSearchParams {
  const landingProperties = buildOfficialLandingSourceProperties({
    baseUrl: options.baseUrl,
    referrer: options.referrer,
    search: options.search,
  })
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(landingProperties)) {
    if (typeof value !== 'string' || !value) {
      continue
    }
    if (key !== 'utm_source' && key !== 'utm_medium' && key !== 'utm_campaign' && key !== 'referrer_origin') {
      continue
    }
    if (key === 'referrer_origin') {
      params.set('first_touch_referrer_origin', value)
      continue
    }
    params.set(key.replace(/^utm_/, 'first_touch_'), value)
  }

  const landingPage = normalizePathLike(options.landingPage, options.baseUrl)
  if (landingPage) {
    params.set('first_touch_landing_page', landingPage)
  }

  const ctaId = normalizeTextValue(options.ctaId, TEXT_VALUE_MAX_LENGTH)
  if (ctaId) {
    params.set('official_cta_id', ctaId)
  }
  const anonymousDistinctId = normalizeTextValue(options.anonymousDistinctId, DISTINCT_ID_VALUE_MAX_LENGTH)
  if (anonymousDistinctId) {
    params.set('posthog_anonymous_distinct_id', anonymousDistinctId)
  }
  params.set('source_surface', 'official')

  return params
}

/**
 * 解析 PostHog 浏览器侧公开配置。
 * @param input 原始环境配置
 * @returns 可直接暴露给浏览器的配置；缺少关键项时返回关闭状态
 */
export function buildPublicOfficialAnalyticsConfig(input: {
  apiHost?: string | null
  enabledEnv?: string | null
  projectKey?: string | null
  uiHost?: string | null
}): PublicOfficialAnalyticsConfig {
  const enabled = readBooleanEnv(input.enabledEnv)
  const projectKey = input.projectKey?.trim() || ''
  if (!enabled || !projectKey) {
    return {
      enabled: false,
      projectKey: null,
      apiHost: null,
      uiHost: null,
    }
  }

  const apiHost = normalizeHostUrl(
    input.apiHost || OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
    OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
  )
  const uiHost = normalizeHostUrl(
    input.uiHost || OFFICIAL_ANALYTICS_DEFAULT_UI_HOST,
    OFFICIAL_ANALYTICS_DEFAULT_UI_HOST,
  )

  return {
    enabled: true,
    projectKey,
    apiHost,
    uiHost,
  }
}
