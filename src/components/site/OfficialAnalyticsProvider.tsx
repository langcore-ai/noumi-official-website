'use client'

import { usePathname } from 'next/navigation'
import posthog, { type CaptureResult } from 'posthog-js'
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
  buildOfficialGoogleTagConsentPayload,
  buildOfficialGoogleTagPageViewPayload,
  buildOfficialLandingSourceProperties,
  buildOfficialOutboundAttributionParams,
  isOfficialAnalyticsEventName,
  OFFICIAL_GOOGLE_TAG_ID,
  sanitizeOfficialBrowserEventProperties,
  sanitizeOfficialAnalyticsProperties,
  type OfficialAnalyticsEventName,
  type OfficialAnalyticsProperties,
  type PublicOfficialAnalyticsConfig,
} from '@/lib/site/analytics'
import { COOKIE_CONSENT_CHANGE_EVENT, readStoredConsent } from '@/lib/site/consent'

/** Landing page 视图仅在一个会话内记一次。 */
const LANDING_PAGE_VIEWED_SESSION_KEY = 'noumi:official:landing_page_viewed'
const ACTIVE_HEARTBEAT_SECONDS = 60
const GOOGLE_TAG_SCRIPT_ID = 'noumi-official-google-tag'

type GoogleTagCommand = [command: string, ...args: unknown[]]

type GoogleTagWindow = Window &
  typeof globalThis & {
    dataLayer?: GoogleTagCommand[]
    gtag?: (...args: GoogleTagCommand) => void
  }

/** 官网埋点上下文。 */
type OfficialAnalyticsContextValue = {
  /**
   * 发送官网分析事件。
   * @param eventName 埋点事件名
   * @param properties 允许的属性
   */
  capture: (eventName: OfficialAnalyticsEventName, properties?: OfficialAnalyticsProperties) => void
}

const OfficialAnalyticsContext = createContext<OfficialAnalyticsContextValue>({
  capture: () => {},
})

/**
 * 读取官网公开埋点配置。
 * @returns PostHog 浏览器公开配置；失败时返回关闭状态
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
 * 清洗浏览器级别的 PostHog payload，去掉 query/hash 与不允许的值。
 * @param payload 即将发送的事件
 * @returns 清洗后的 payload；返回 null 时会丢弃事件
 */
function sanitizeBrowserEvent(payload: CaptureResult | null): CaptureResult | null {
  if (!payload?.properties) {
    return payload
  }

  const sanitizedProperties = sanitizeOfficialBrowserEventProperties(
    payload.properties as Record<string, unknown>,
    window.location.origin,
  )

  return {
    ...payload,
    properties: sanitizedProperties,
  }
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
 * 提供官网分析上下文与 PostHog 生命周期管理。
 *
 * @param props.children 前台页面节点
 * @returns 包裹后的前台页面
 */
export function OfficialAnalyticsProvider(props: { children: ReactNode }) {
  const { children } = props
  const pathname = usePathname()
  const [analyticsConfig, setAnalyticsConfig] = useState<PublicOfficialAnalyticsConfig | null>(null)
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(readInitialAnalyticsConsent)
  const sdkBootstrappedRef = useRef(false)
  const googleTagBootstrappedRef = useRef(false)
  const googleTagPageViewKeyRef = useRef<string | null>(null)
  const hasAnalyticsConsentRef = useRef(hasAnalyticsConsent)

  useEffect(() => {
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
            enabled: false,
            projectKey: null,
            apiHost: null,
            uiHost: null,
          })
        }
      })

    return () => {
      canceled = true
    }
  }, [])

  useEffect(() => {
    const syncConsent = () => {
      const storedConsent = readStoredConsent()
      const nextHasAnalyticsConsent = storedConsent?.analytics === true
      hasAnalyticsConsentRef.current = nextHasAnalyticsConsent
      setHasAnalyticsConsent(nextHasAnalyticsConsent)
    }

    syncConsent()
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
    window.addEventListener('storage', syncConsent)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncConsent)
      window.removeEventListener('storage', syncConsent)
    }
  }, [])

  useEffect(() => {
    if (!analyticsConfig?.enabled || !analyticsConfig.projectKey || !analyticsConfig.apiHost) {
      return
    }

    if (!hasAnalyticsConsent) {
      if (sdkBootstrappedRef.current) {
        posthog.opt_out_capturing()
      }
      return
    }

    if (!sdkBootstrappedRef.current) {
      posthog.init(analyticsConfig.projectKey, {
        api_host: analyticsConfig.apiHost,
        autocapture: false,
        before_send: sanitizeBrowserEvent,
        capture_pageleave: true,
        capture_pageview: 'history_change',
        cross_subdomain_cookie: true,
        disable_session_recording: true,
        person_profiles: 'identified_only',
        ui_host: analyticsConfig.uiHost ?? undefined,
      })
      sdkBootstrappedRef.current = true
      return
    }

    posthog.opt_in_capturing()
  }, [analyticsConfig, hasAnalyticsConsent])

  useEffect(() => {
    const gtag = ensureOfficialGoogleTag()
    const consentPayload = buildOfficialGoogleTagConsentPayload(hasAnalyticsConsent)

    if (!googleTagBootstrappedRef.current) {
      gtag('consent', 'default', consentPayload)
      gtag('js', new Date())
      gtag('config', OFFICIAL_GOOGLE_TAG_ID, {
        send_page_view: false,
      })
      googleTagBootstrappedRef.current = true
      return
    }

    gtag('consent', 'update', consentPayload)
  }, [hasAnalyticsConsent])

  useEffect(() => {
    const pageViewKey = `${hasAnalyticsConsent ? 'granted' : 'denied'}:${pathname}`
    if (googleTagPageViewKeyRef.current === pageViewKey) {
      return
    }

    const gtag = ensureOfficialGoogleTag()
    googleTagPageViewKeyRef.current = pageViewKey
    gtag(
      'event',
      'page_view',
      buildOfficialGoogleTagPageViewPayload({
        baseUrl: window.location.origin,
        pathname,
        title: document.title,
      }),
    )
  }, [hasAnalyticsConsent, pathname])

  const capture = useCallback(
    (eventName: OfficialAnalyticsEventName, properties: OfficialAnalyticsProperties = {}) => {
      if (!sdkBootstrappedRef.current || !hasAnalyticsConsentRef.current) {
        return
      }

      posthog.capture(
        eventName,
        sanitizeOfficialAnalyticsProperties(
          {
            ...properties,
            page_path: pathname,
          },
          window.location.origin,
        ),
      )
    },
    [pathname],
  )

  useEffect(() => {
    if (!sdkBootstrappedRef.current || !hasAnalyticsConsentRef.current) {
      return
    }

    capture('official_page_viewed', {})
    capture('app_active', {
      app_surface: 'official',
    })

    if (!sessionStorage.getItem(LANDING_PAGE_VIEWED_SESSION_KEY)) {
      sessionStorage.setItem(LANDING_PAGE_VIEWED_SESSION_KEY, '1')
      capture(
        'landing_page_viewed',
        buildOfficialLandingSourceProperties({
          baseUrl: window.location.origin,
          referrer: document.referrer,
          search: window.location.search,
        }),
      )
    }
  }, [capture, pathname])

  useEffect(() => {
    if (!sdkBootstrappedRef.current || !hasAnalyticsConsentRef.current) {
      return
    }

    const captureActive = () => {
      if (document.visibilityState !== 'visible') {
        return
      }

      capture('app_active', {
        active_seconds: ACTIVE_HEARTBEAT_SECONDS,
        app_surface: 'official',
        heartbeat_interval_seconds: ACTIVE_HEARTBEAT_SECONDS,
      })
    }

    captureActive()
    const interval = window.setInterval(captureActive, ACTIVE_HEARTBEAT_SECONDS * 1000)

    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const analyticsElement = target.closest<HTMLElement>('[data-analytics-event]')
      if (!analyticsElement) {
        return
      }

      const analyticsEventName = analyticsElement.dataset.analyticsEvent || ''
      if (!isOfficialAnalyticsEventName(analyticsEventName)) {
        return
      }

      capture(analyticsEventName, {
        action: analyticsElement.dataset.analyticsAction || undefined,
        cta_id: analyticsElement.dataset.analyticsCtaId || undefined,
        placement: analyticsElement.dataset.analyticsPlacement || undefined,
        source_path: analyticsElement.dataset.analyticsSourcePath || undefined,
        target_path: analyticsElement.dataset.analyticsTargetPath || undefined,
      })

      const link =
        analyticsElement instanceof HTMLAnchorElement
          ? analyticsElement
          : analyticsElement.closest('a')
      if (
        !link ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const attributionParams = buildOfficialOutboundAttributionParams({
        anonymousDistinctId: posthog.get_distinct_id(),
        baseUrl: window.location.origin,
        ctaId: analyticsElement.dataset.analyticsCtaId,
        landingPage: window.location.pathname,
        referrer: document.referrer,
        search: window.location.search,
      })
      const nextUrl = new URL(link.href, window.location.origin)
      for (const [key, value] of attributionParams) {
        if (!nextUrl.searchParams.has(key)) {
          nextUrl.searchParams.set(key, value)
        }
      }
      link.href = nextUrl.toString()
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('visibilitychange', captureActive)

    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('visibilitychange', captureActive)
      window.clearInterval(interval)
    }
  }, [capture, hasAnalyticsConsent])

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
