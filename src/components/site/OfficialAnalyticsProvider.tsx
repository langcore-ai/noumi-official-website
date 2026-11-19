'use client'
import { createBrowserUuid } from '@/lib/site/browser-uuid'

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
  readOfficialDevice,
  officialPageGroup,
  OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG,
  OFFICIAL_GOOGLE_TAG_ID,
  sanitizeOfficialAnalyticsProperties,
  type OfficialAnalyticsProperties,
  type OfficialClientEventName,
  type OfficialFirstTouch,
  type PublicOfficialAnalyticsConfig,
} from '@/lib/site/analytics'
import { clearOfficialFirstTouch, resolveOfficialFirstTouch } from '@/lib/site/attribution'
import {
  readOfficialAnonymousId,
  readOfficialBrowserSession,
  rotateOfficialAnonymousId,
  touchOfficialBrowserSession,
} from '@/lib/site/analytics-identity'
import { readSharedVisitorId } from '@/lib/site/shared-visitor'
import { readDeviceFingerprint } from '@/lib/site/device-fingerprint'
import { trackOfficialReplay } from '@/lib/site/replay/recorder'
import { getTryFreeClickPayload } from '@/lib/site/try-free-tracking'
import { COOKIE_CONSENT_CHANGE_EVENT, readStoredConsent } from '@/lib/site/consent'
import { OFFICIAL_PRODUCT_AUTH_URL } from '@/lib/site/official-site'

/** Landing page 视图仅在一个会话内记一次。 */
const LANDING_PAGE_VIEWED_SESSION_KEY = 'noumi:official:landing_page_viewed'

/** 事件上报接口路径与自定义请求头，服务端据此拒绝跨站简单请求。 */
const ANALYTICS_EVENTS_ENDPOINT = '/api/site/analytics/events'
const ANALYTICS_REQUEST_HEADER = 'x-noumi-analytics'

/** 小批量合并窗口与单批上限，与接口 20 条上限保持一致。 */
const FLUSH_DELAY_MS = 50
const MAX_BATCH_SIZE = 20

const GOOGLE_TAG_SCRIPT_ID = 'noumi-official-google-tag'

type GoogleTagCommand = [command: string, ...args: unknown[]]

type GoogleTagWindow = Window &
  typeof globalThis & {
    dataLayer?: (GoogleTagCommand | Record<string, unknown>)[]
    gtag?: (...args: GoogleTagCommand) => void
    [OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG]?: boolean
  }

type QueuedEvent = {
  anonymousId: string
  event: OfficialClientEventName
  eventId: string
  occurredAt: string
  properties: OfficialAnalyticsProperties
}

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
 * 读取官网公开埋点开关。
 * @returns 埋点开关；失败时返回关闭状态
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
 * 按需插入官网 GA4 gtag 脚本。
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

  if (!document.getElementById(GOOGLE_TAG_SCRIPT_ID)) {
    const script = document.createElement('script')
    script.async = true
    script.id = GOOGLE_TAG_SCRIPT_ID
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(OFFICIAL_GOOGLE_TAG_ID)}`
    document.head.appendChild(script)
  }

  return googleWindow.gtag
}

/**
 * 读取初始 analytics cookie 授权。
 * @returns 是否已经同意 analytics cookie
 */
function readInitialAnalyticsConsent() {
  if (typeof window === 'undefined') {
    return false
  }

  return readStoredConsent()?.analytics === true
}

/**
 * 追加归因参数；已有参数不覆盖。
 * UTM 与首触来源对所有 CTA 都写入，匿名身份只在已同意时带出。
 *
 * @param url 外跳链接
 * @param input 首触归因、CTA 标识与是否已获同意
 * @returns 追加归因后的链接
 */
function buildAttributedOutboundUrl(
  url: URL,
  input: { consent: boolean; ctaId?: string | null; firstTouch: OfficialFirstTouch | null },
): URL {
  const params = buildOfficialOutboundAttributionParams({
    anonymousDistinctId: input.consent ? readOfficialAnonymousId() : null,
    visitorId: input.consent ? readSharedVisitorId() : undefined,
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
 * 提供官网分析上下文与同源事件中继。
 * 浏览器不持有 PostHog project key 或 ingest host，所有事件经官网接口转发。
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
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(readInitialAnalyticsConsent)
  const googleTagBootstrappedRef = useRef(false)
  const googleTagPageViewKeyRef = useRef<string | null>(null)
  const hasAnalyticsConsentRef = useRef(hasAnalyticsConsent)
  const enabledRef = useRef(false)
  const queueRef = useRef<QueuedEvent[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPageViewKeyRef = useRef('')
  // 首触归因：首个带渠道信号的访问决定来源，之后所有事件与跳转复用。
  const firstTouchRef = useRef<OfficialFirstTouch | null>(null)
  // 指纹只在 consent 后采集一次;事件照常上报,采集完成前的事件不带 device_fp。
  const fingerprintRef = useRef('')

  useEffect(() => {
    if (!statisticsEnabled) return
    let canceled = false

    void loadOfficialAnalyticsConfig()
      .then((config) => {
        if (!canceled) {
          enabledRef.current = config.enabled
          setAnalyticsConfig(config)
        }
      })
      .catch(() => {
        if (!canceled) {
          enabledRef.current = false
          setAnalyticsConfig({ enabled: false })
        }
      })

    return () => {
      canceled = true
    }
  }, [statisticsEnabled])

  useEffect(() => {
    const syncConsent = () => {
      const storedConsent = readStoredConsent()
      const nextHasAnalyticsConsent = storedConsent?.analytics === true
      hasAnalyticsConsentRef.current = nextHasAnalyticsConsent
      setHasAnalyticsConsent(nextHasAnalyticsConsent)

      if (!nextHasAnalyticsConsent) {
        queueRef.current = []
        fingerprintRef.current = ''
        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current)
          flushTimerRef.current = null
        }
        rotateOfficialAnonymousId()
        clearOfficialFirstTouch()
        firstTouchRef.current = null
      }
    }

    syncConsent()
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
    window.addEventListener('storage', syncConsent)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
      window.removeEventListener('storage', syncConsent)
    }
  }, [])

  /**
   * 立即把队列提交到同源事件接口。
   * 失败只记录一次警告，不重试，避免拖慢页面。
   */
  const flush = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current)
      flushTimerRef.current = null
    }
    const events = queueRef.current.splice(0, MAX_BATCH_SIZE)
    if (events.length === 0) {
      return
    }

    void fetch(ANALYTICS_EVENTS_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'content-type': 'application/json', [ANALYTICS_REQUEST_HEADER]: '1' },
      body: JSON.stringify({ events }),
    })
      .then((response) => {
        if (!response.ok) {
          console.warn('official analytics relay rejected events', response.status)
        }
      })
      .catch(() => {
        console.warn('official analytics relay unreachable')
      })
  }, [])

  useEffect(() => {
    // 首触必须在落地页就记录：用户先站内翻页、之后才同意时，UTM 已不在地址栏。
    // 未同意时只写内存快照，不落 localStorage。
    firstTouchRef.current =
      resolveOfficialFirstTouch({
        baseUrl: window.location.origin,
        consent: hasAnalyticsConsentRef.current,
        pathname: window.location.pathname,
        referrer: document.referrer,
        search: window.location.search,
      }) ?? firstTouchRef.current
  }, [hasAnalyticsConsent, pathname])

  const capture = useCallback(
    (eventName: OfficialClientEventName, properties: OfficialAnalyticsProperties = {}) => {
      trackOfficialReplay(eventName, properties)
      if (
        !statisticsEnabled ||
        !enabledRef.current ||
        !hasAnalyticsConsentRef.current ||
        !isOfficialClientEventName(eventName)
      ) {
        return
      }

      const occurredAt = Date.now()
      const pagePath = normalizeOfficialPagePath(pathname)
      const firstTouch =
        firstTouchRef.current ??
        resolveOfficialFirstTouch({
          baseUrl: window.location.origin,
          consent: hasAnalyticsConsentRef.current,
          now: occurredAt,
          pathname: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
        })
      firstTouchRef.current = firstTouch

      queueRef.current.push({
        anonymousId: readOfficialAnonymousId(),
        event: eventName,
        eventId: createBrowserUuid(),
        occurredAt: new Date(occurredAt).toISOString(),
        properties: {
          ...sanitizeOfficialAnalyticsProperties(
            {
              ...properties,
              device: readOfficialDevice(),
              device_fp: fingerprintRef.current || undefined,
              page_path: pagePath,
            },
            window.location.origin,
          ),
          page_group: officialPageGroup(pagePath),
          ...touchOfficialBrowserSession(occurredAt),
          // 每个事件都带来源，站内翻页后不丢（W1/W2/W3/W4）。
          ...sanitizeOfficialAnalyticsProperties(
            buildOfficialAttributionProperties(firstTouch, {
              baseUrl: window.location.origin,
              referrer: document.referrer,
              search: window.location.search,
            }),
            window.location.origin,
          ),
          visitor_id: readSharedVisitorId() || undefined,
        },
      })

      if (queueRef.current.length >= MAX_BATCH_SIZE) {
        flush()
        return
      }
      flushTimerRef.current ??= setTimeout(flush, FLUSH_DELAY_MS)
    },
    [flush, pathname, statisticsEnabled],
  )

  useEffect(() => {
    if (!statisticsEnabled) return
    const gtag = ensureOfficialGoogleTag()
    const consentPayload = buildOfficialGoogleTagConsentPayload(hasAnalyticsConsent)
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
  }, [hasAnalyticsConsent, statisticsEnabled])

  useEffect(() => {
    const search = window.location.search
    const pageViewKey = `${hasAnalyticsConsent ? 'granted' : 'denied'}:${pathname}:${search}`
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
  }, [hasAnalyticsConsent, pathname, statisticsEnabled])

  // GTM owns GA4 click delivery; this listener is independent of the relay.
  useEffect(() => {
    if (!statisticsEnabled) return
    const handleTryFreeClick = (event: MouseEvent) => {
      if (!hasAnalyticsConsentRef.current) return
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
    if (!statisticsEnabled || !hasAnalyticsConsent) return
    let canceled = false

    void readDeviceFingerprint().then((fingerprint) => {
      if (!canceled && fingerprint) {
        fingerprintRef.current = fingerprint
      }
    })

    return () => {
      canceled = true
    }
  }, [hasAnalyticsConsent, statisticsEnabled])

  useEffect(() => {
    if (!analyticsConfig?.enabled || !hasAnalyticsConsent) {
      return
    }

    const session = readOfficialBrowserSession()
    const pageViewKey = `${session.$session_id}:${pathname}`
    if (lastPageViewKeyRef.current !== pageViewKey) {
      lastPageViewKeyRef.current = pageViewKey
      capture('$pageview', {})
    }

    if (!sessionStorage.getItem(LANDING_PAGE_VIEWED_SESSION_KEY)) {
      sessionStorage.setItem(LANDING_PAGE_VIEWED_SESSION_KEY, '1')
      // 来源属性由 capture 统一注入，这里只标记「本会话首个落地页」。
      capture('landing_page_viewed', {})
    }
  }, [analyticsConfig, capture, hasAnalyticsConsent, pathname])

  useEffect(() => {
    if (!analyticsConfig?.enabled || !hasAnalyticsConsent) {
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
  }, [analyticsConfig, capture, hasAnalyticsConsent, pathname])

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

      // 外跳归因不受 analytics 同意门控：UTM 属于渠道信息，报告里需要完整链路（W7）。
      // 匿名身份只写进 URL 时也仅由 buildAttributedOutboundUrl 按同意状态决定。
      const firstTouch =
        firstTouchRef.current ??
        resolveOfficialFirstTouch({
          baseUrl: window.location.origin,
          // 未同意时用内存快照，不写本地存储。
          consent: hasAnalyticsConsentRef.current,
          pathname: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search,
        })
      firstTouchRef.current = firstTouch

      link.href = buildAttributedOutboundUrl(new URL(link.href, window.location.origin), {
        consent: hasAnalyticsConsentRef.current,
        ctaId: analyticsElement?.dataset.analyticsCtaId,
        firstTouch,
      }).toString()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [capture, statisticsEnabled])

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
      }
    }
  }, [])

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
