'use client'

import { usePathname } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  buildOfficialAttributionProperties,
  buildOfficialGoogleTagConsentPayload,
  buildOfficialGoogleTagPageViewPayload,
  buildOfficialOutboundAttributionParams,
  isOfficialClientEventName,
  normalizeOfficialPagePath,
  officialPageGroup,
  OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG,
  OFFICIAL_GOOGLE_TAG_ID,
  sanitizeOfficialAnalyticsProperties,
  type OfficialAnalyticsProperties,
  type OfficialClientEventName,
  type OfficialFirstTouch,
  type PublicOfficialAnalyticsConfig,
} from '@/lib/site/analytics'
import { resolveOfficialFirstTouch } from '@/lib/site/attribution'
import { readSharedVisitorId } from '@/lib/site/shared-visitor'
import { readDeviceFingerprint } from '@/lib/site/device-fingerprint'
import { trackOfficialReplay } from '@/lib/site/replay/recorder'
import { getTryFreeClickPayload } from '@/lib/site/try-free-tracking'
import { OFFICIAL_PRODUCT_AUTH_URL } from '@/lib/site/official-site'

/** Landing page 视图仅在一个会话内记一次。 */
const LANDING_PAGE_VIEWED_SESSION_KEY = 'noumi:official:landing_page_viewed'

/** SDK 初始化前最多缓冲的事件数；初始化失败时避免无限增长。 */
const MAX_PENDING_CAPTURES = 50

/** PostHog 持久化命名空间；隔离第一代 SDK 的本地状态。 */
const POSTHOG_PERSISTENCE_NAME = 'noumi_website'

type GoogleTagCommand = [command: string, ...args: unknown[]]

type GoogleTagWindow = Window &
  typeof globalThis & {
    dataLayer?: (GoogleTagCommand | Record<string, unknown>)[]
    gtag?: (...args: GoogleTagCommand) => void
    [OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG]?: boolean
  }

/** 官网只依赖 posthog-js 的 capture 与 distinct id，避免把整个 SDK 类型带进组件。 */
type PostHogClient = {
  capture: (eventName: string, properties?: Record<string, unknown>) => void
  get_distinct_id: () => string
}

/** SDK 初始化前缓冲的事件。 */
type PendingCapture = [eventName: OfficialClientEventName, properties: OfficialAnalyticsProperties]

/** 官网埋点上下文。 */
type OfficialAnalyticsContextValue = {
  /**
   * 发送官网分析事件。
   * @param eventName 埋点事件名
   * @param properties 允许的属性
   */
  capture: (eventName: OfficialClientEventName, properties?: OfficialAnalyticsProperties) => void
}

const OfficialAnalyticsContext = createContext<OfficialAnalyticsContextValue>({
  capture: () => {},
})

/**
 * 读取官网公开埋点配置。
 * @returns 埋点配置；失败时返回关闭状态
 */
async function loadOfficialAnalyticsConfig(): Promise<PublicOfficialAnalyticsConfig> {
  const response = await fetch('/api/site/analytics/config', {
    cache: 'no-store',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`load official analytics config failed: ${response.status}`)
  }

  return (await response.json()) as PublicOfficialAnalyticsConfig
}

/**
 * 提供 gtag 命令函数，保证命令能进入 `dataLayer` 队列。
 *
 * 本函数不再自行插入脚本：GTM 容器内已配置同一 GA4 属性（G-TJBXDRBMVM），
 * 再插一份 `gtag/js` 会重复上报；而且动态插入的 async script 在 `load`
 * 之前插入时，会把它拖成 `load` 的依赖（实测 GTM 域名不可达时 `load` 永不触发）。
 * @returns gtag 命令函数
 */
function ensureOfficialGoogleTag() {
  const googleWindow = window as GoogleTagWindow
  googleWindow.dataLayer = googleWindow.dataLayer || []
  googleWindow.gtag =
    googleWindow.gtag ||
    ((...args: GoogleTagCommand) => {
      googleWindow.dataLayer?.push(args)
    })

  return googleWindow.gtag
}

/**
 * 只保留来源 URL 的 origin；`$direct` 与空值原样返回。
 *
 * @param value 原始来源
 * @returns origin 或空串
 */
function readReferrerOrigin(value: unknown): string {
  if (typeof value !== 'string' || !value || value === '$direct') {
    return ''
  }

  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

/**
 * 追加归因参数；已有参数不覆盖。
 * UTM、首触来源与匿名身份对所有产品侧 CTA 都写入。
 *
 * @param url 外跳链接
 * @param input 首触归因、CTA 标识与当前 distinct id
 * @returns 追加归因后的链接
 */
function buildAttributedOutboundUrl(
  url: URL,
  input: {
    ctaId?: string | null
    distinctId: string
    firstTouch: OfficialFirstTouch | null
  },
): URL {
  const params = buildOfficialOutboundAttributionParams({
    anonymousDistinctId: input.distinctId,
    visitorId: readSharedVisitorId(),
    baseUrl: window.location.origin,
    ctaId: input.ctaId,
    firstTouch: input.firstTouch,
  })

  for (const [key, value] of params) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value)
    }
  }

  return url
}

/**
 * 提供官网分析上下文与 posthog-js 生命周期。
 *
 * 浏览器从 `/api/site/analytics/config` 拿到公开写 key，SDK 的 `api_host` 固定为
 * 同域 `/ingest`，由 Worker 原样转发到 PostHog；原始浏览器环境、来源与滚动深度
 * 全部由 SDK 计算，组件只补充业务字段并发送官网自定义事件。
 *
 * @param props.children 前台页面节点
 * @param props.statisticsEnabled 是否启用浏览器统计
 * @returns 包裹后的前台页面
 */
export function OfficialAnalyticsProvider(props: {
  children: ReactNode
  statisticsEnabled?: boolean
}) {
  const { children, statisticsEnabled = true } = props
  const pathname = usePathname()
  const [analyticsConfig, setAnalyticsConfig] = useState<PublicOfficialAnalyticsConfig | null>(null)
  const googleTagBootstrappedRef = useRef(false)
  const googleTagPageViewKeyRef = useRef<string | null>(null)
  const sdkInitStartedRef = useRef(false)
  const posthogRef = useRef<PostHogClient | null>(null)
  const pendingCapturesRef = useRef<PendingCapture[]>([])
  // 首触归因：首个带渠道信号的访问决定来源，之后所有事件与跳转复用。
  const firstTouchRef = useRef<OfficialFirstTouch | null>(null)
  // 访客编号在 SDK 初始化前先接续官网已有 Cookie。
  const visitorIdRef = useRef('')
  // 指纹采集一次；事件照常上报，采集完成前的事件不带 device_fp。
  const fingerprintRef = useRef('')

  useEffect(() => {
    if (!statisticsEnabled) return
    let canceled = false

    void loadOfficialAnalyticsConfig()
      .then((config) => {
        if (!canceled) {
          setAnalyticsConfig(config)
        }
      })
      .catch(() => {
        if (!canceled) {
          setAnalyticsConfig({
            apiHost: null,
            enabled: false,
            projectKey: null,
            uiHost: null,
          })
        }
      })

    return () => {
      canceled = true
    }
  }, [statisticsEnabled])

  useEffect(() => {
    // 首触必须在落地页就记录；之后站内翻页时地址栏已无 UTM。
    firstTouchRef.current =
      resolveOfficialFirstTouch({
        baseUrl: window.location.origin,
        pathname: window.location.pathname,
        referrer: document.referrer,
        search: window.location.search,
      }) ?? firstTouchRef.current
  }, [pathname])

  useEffect(() => {
    if (!statisticsEnabled || !analyticsConfig?.enabled) {
      return
    }

    const { apiHost, projectKey, uiHost } = analyticsConfig
    if (!apiHost || !projectKey || !uiHost) {
      return
    }
    if (sdkInitStartedRef.current) {
      return
    }
    sdkInitStartedRef.current = true

    let canceled = false
    const visitorId = readSharedVisitorId()
    visitorIdRef.current = visitorId
    firstTouchRef.current =
      firstTouchRef.current ??
      resolveOfficialFirstTouch({
        baseUrl: window.location.origin,
        pathname: window.location.pathname,
        referrer: document.referrer,
        search: window.location.search,
      })

    void import('posthog-js')
      .then(({ default: posthog }) => {
        if (canceled) {
          return
        }

        posthog.init(projectKey, {
          api_host: apiHost,
          ui_host: uiHost,
          // 官网没有 feature flags / 远程配置需求，少一次 /flags 请求。
          advanced_disable_decide: true,
          autocapture: false,
          // 用官网已有访客编号起头，保持切换前后的身份连续。
          bootstrap: { distinctID: visitorId, isIdentifiedID: false },
          capture_pageleave: true,
          capture_pageview: 'history_change',
          capture_performance: false,
          cross_subdomain_cookie: false,
          disable_session_recording: true,
          disable_surveys: true,
          persistence: 'localStorage',
          persistence_name: POSTHOG_PERSISTENCE_NAME,
          person_profiles: 'always',
          sanitize_properties: (properties) => {
            const pagePath = normalizeOfficialPagePath(
              typeof properties.$pathname === 'string'
                ? properties.$pathname
                : window.location.pathname,
            )
            const currentUrl =
              typeof properties.$current_url === 'string'
                ? properties.$current_url
                : window.location.href
            let search = ''
            try {
              search = new URL(currentUrl, window.location.origin).search
            } catch {
              // 非法 URL 不构成来源参数。
            }

            const enriched: Record<string, unknown> = {
              ...properties,
              ...buildOfficialAttributionProperties(firstTouchRef.current, {
                baseUrl: window.location.origin,
                referrer: document.referrer,
                search,
              }),
              app_source: 'noumi-official',
              page_group: officialPageGroup(pagePath),
              page_path: pagePath,
            }

            if (visitorIdRef.current) {
              enriched.visitor_id = visitorIdRef.current
            }
            if (fingerprintRef.current) {
              enriched.device_fp = fingerprintRef.current
            }

            // 只保留来源域名；完整外部 URL 没必要进入分析系统。
            for (const key of ['$referrer', '$initial_referrer', '$session_entry_referrer']) {
              const origin = readReferrerOrigin(enriched[key])
              if (origin) {
                enriched[key] = origin
              }
            }

            return enriched
          },
        })

        posthogRef.current = posthog
        for (const [eventName, properties] of pendingCapturesRef.current.splice(0)) {
          posthog.capture(eventName, properties)
        }
      })
      .catch((error) => {
        sdkInitStartedRef.current = false
        console.warn('official analytics sdk failed to initialize', error)
      })

    return () => {
      canceled = true
      if (!posthogRef.current) {
        sdkInitStartedRef.current = false
      }
    }
  }, [analyticsConfig, statisticsEnabled])

  const capture = useCallback(
    (eventName: OfficialClientEventName, properties: OfficialAnalyticsProperties = {}) => {
      trackOfficialReplay(eventName, properties)
      if (
        !statisticsEnabled ||
        !analyticsConfig?.enabled ||
        !isOfficialClientEventName(eventName)
      ) {
        return
      }

      const sanitizedProperties = sanitizeOfficialAnalyticsProperties(
        properties,
        window.location.origin,
      )
      const client = posthogRef.current
      if (!client) {
        if (pendingCapturesRef.current.length < MAX_PENDING_CAPTURES) {
          pendingCapturesRef.current.push([eventName, sanitizedProperties])
        }
        return
      }

      client.capture(eventName, sanitizedProperties)
    },
    [analyticsConfig?.enabled, statisticsEnabled],
  )

  useEffect(() => {
    if (!statisticsEnabled) return
    const gtag = ensureOfficialGoogleTag()
    // analytics_storage 始终 granted：站点不再以 cookie 同意为分析采集前提。
    const consentPayload = buildOfficialGoogleTagConsentPayload()
    const googleWindow = window as GoogleTagWindow

    if (googleWindow[OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG] === true) {
      googleTagBootstrappedRef.current = true
    }

    if (!googleTagBootstrappedRef.current) {
      gtag('consent', 'default', consentPayload)
      gtag('js', new Date())
      gtag('config', OFFICIAL_GOOGLE_TAG_ID, {
        send_page_view: false,
      })
      googleTagBootstrappedRef.current = true
      googleWindow[OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG] = true
      return
    }

    gtag('consent', 'update', consentPayload)
  }, [statisticsEnabled])

  useEffect(() => {
    const search = window.location.search
    const pageViewKey = `${pathname}:${search}`
    if (googleTagPageViewKeyRef.current === pageViewKey) {
      return
    }

    if (!statisticsEnabled) return
    const gtag = ensureOfficialGoogleTag()
    googleTagPageViewKeyRef.current = pageViewKey
    gtag(
      'event',
      'page_view',
      buildOfficialGoogleTagPageViewPayload({
        baseUrl: window.location.origin,
        pathname,
        search,
        title: document.title,
      }),
    )
  }, [pathname, statisticsEnabled])

  // GTM owns GA4 click delivery; this listener is independent of PostHog.
  useEffect(() => {
    if (!statisticsEnabled) return
    const handleTryFreeClick = (event: MouseEvent) => {
      const payload = getTryFreeClickPayload(event.target)
      if (!payload) return
      const googleWindow = window as GoogleTagWindow
      googleWindow.dataLayer = googleWindow.dataLayer || []
      googleWindow.dataLayer.push({ event: 'try_free_click', ...payload })
    }
    document.addEventListener('click', handleTryFreeClick, true)
    return () => document.removeEventListener('click', handleTryFreeClick, true)
  }, [statisticsEnabled])

  useEffect(() => {
    if (!statisticsEnabled) return
    let canceled = false

    void readDeviceFingerprint().then((fingerprint) => {
      if (!canceled && fingerprint) {
        fingerprintRef.current = fingerprint
      }
    })

    return () => {
      canceled = true
    }
  }, [statisticsEnabled])

  useEffect(() => {
    if (!analyticsConfig?.enabled) {
      return
    }

    if (!sessionStorage.getItem(LANDING_PAGE_VIEWED_SESSION_KEY)) {
      sessionStorage.setItem(LANDING_PAGE_VIEWED_SESSION_KEY, '1')
      // 来源属性由 SDK 的 sanitize_properties 统一注入，这里只标记「本会话首个落地页」。
      capture('landing_page_viewed', {})
    }
  }, [analyticsConfig?.enabled, capture])

  useEffect(() => {
    if (!analyticsConfig?.enabled) {
      return
    }

    /** 单次页面停留事件的上限，避免长时间挂机页面拉高均值。 */
    const MAX_PAGE_ENGAGEMENT_MS = 30 * 60 * 1000
    let activeMs = 0
    let activeSince: number | null = null

    const flushPageEngagement = (reason: string) => {
      if (activeSince !== null) {
        activeMs += Date.now() - activeSince
        activeSince = null
      }
      const durationMs = Math.min(activeMs, MAX_PAGE_ENGAGEMENT_MS)
      if (durationMs < 1000) {
        activeMs = 0
        return
      }
      capture('official_page_engagement', {
        duration_ms: durationMs,
        status: reason,
      })
      activeMs = 0
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushPageEngagement('background')
      } else {
        activeSince = Date.now()
      }
    }
    const handlePageHide = () => {
      flushPageEngagement('pagehide')
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      // 客户端路由切换时上报上一页停留，再重置计时。
      flushPageEngagement('navigate')
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [analyticsConfig?.enabled, capture, pathname])

  useEffect(() => {
    if (!statisticsEnabled) return

    const productOrigin = new URL(OFFICIAL_PRODUCT_AUTH_URL, window.location.origin).origin

    /**
     * 只改写产品侧入口：外站内容链接（LinkedIn / 目录站）不该被塞 UTM。
     * @param href 原始 href
     * @returns 是否为产品入口
     */
    const isProductOutbound = (href: string) => {
      try {
        const url = new URL(href, window.location.origin)
        return (
          (url.protocol === 'http:' || url.protocol === 'https:') &&
          url.origin !== window.location.origin &&
          url.origin === productOrigin
        )
      } catch {
        return false
      }
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const analyticsElement = target.closest<HTMLElement>('[data-analytics-event]')
      const analyticsEventName = analyticsElement?.dataset.analyticsEvent || ''
      if (analyticsElement && isOfficialClientEventName(analyticsEventName)) {
        capture(analyticsEventName, {
          action: analyticsElement.dataset.analyticsAction || undefined,
          cta_id: analyticsElement.dataset.analyticsCtaId || undefined,
          placement: analyticsElement.dataset.analyticsPlacement || undefined,
          source_path: analyticsElement.dataset.analyticsSourcePath || undefined,
          target_path: analyticsElement.dataset.analyticsTargetPath || undefined,
        })
      }

      const link =
        target.closest('a') ??
        (analyticsElement instanceof HTMLAnchorElement ? analyticsElement : null)
      if (
        !link ||
        !isProductOutbound(link.getAttribute('href') || '') ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      // 外跳归因携带 UTM、首触来源与匿名身份，保证产品侧链路完整（W7）。
      const firstTouch =
        firstTouchRef.current ??
        resolveOfficialFirstTouch({
          baseUrl: window.location.origin,
          pathname: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
        })
      firstTouchRef.current = firstTouch

      link.href = buildAttributedOutboundUrl(new URL(link.href, window.location.origin), {
        ctaId: analyticsElement?.dataset.analyticsCtaId,
        distinctId: posthogRef.current?.get_distinct_id() || readSharedVisitorId(),
        firstTouch,
      }).toString()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [capture, statisticsEnabled])

  const contextValue = {
    capture,
  }

  return (
    <OfficialAnalyticsContext.Provider value={contextValue}>
      {children}
    </OfficialAnalyticsContext.Provider>
  )
}

/**
 * 读取官网分析上下文。
 * @returns 官网分析 capture 方法；未挂载 Provider 时返回 no-op
 */
export function useOfficialAnalytics() {
  return useContext(OfficialAnalyticsContext)
}
