'use client'

import { useEffect, useRef, useState } from 'react'

/** Beta 申请表地址。 */
const OFFICIAL_BETA_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf8H8efkn9YYtMHiBRWGCVYhrRQ9YIDJ7KXNo7AOwLvQlaIdA/viewform?usp=publish-editor'

/** 关闭动画结束后再移除节点，避免页面顶部瞬间跳动。 */
const CLOSE_ANIMATION_MS = 280

type BannerState = 'entering' | 'visible' | 'leaving' | 'closed'

/**
 * 官网顶部 Beta 申请横幅。
 * @returns 可关闭的 Beta banner
 */
export function OfficialBetaBanner() {
  const [bannerState, setBannerState] = useState<BannerState>('entering')
  const stateTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      '--official-promo-banner-offset',
      'var(--official-promo-banner-open-height)',
    )

    stateTimerRef.current = window.setTimeout(() => {
      setBannerState('visible')
    }, 360)

    return () => {
      if (stateTimerRef.current !== null) {
        window.clearTimeout(stateTimerRef.current)
      }
      root.style.removeProperty('--official-promo-banner-offset')
    }
  }, [])

  /**
   * 播放关闭动画，并同步收起桌面端固定导航预留高度。
   */
  const handleDismiss = () => {
    if (bannerState === 'leaving' || bannerState === 'closed') {
      return
    }

    if (stateTimerRef.current !== null) {
      window.clearTimeout(stateTimerRef.current)
    }

    document.documentElement.style.setProperty('--official-promo-banner-offset', '0px')
    setBannerState('leaving')
    stateTimerRef.current = window.setTimeout(() => {
      setBannerState('closed')
    }, CLOSE_ANIMATION_MS)
  }

  if (bannerState === 'closed') {
    return null
  }

  return (
    <aside
      aria-label="Beta application invitation"
      className="official-beta-banner"
      data-state={bannerState}
    >
      <div className="official-beta-banner__clip">
        <div className="container official-beta-banner__inner">
          <div className="official-beta-banner__copy">
            <p className="official-beta-banner__title">
              Join the Beta — Shape Noumi, Get 1 Month of Pro Free
            </p>
            <p className="official-beta-banner__subtitle">
              8,000 credits. Early feature access. A 1-on-1 with our team. Fill in 1 minute.
            </p>
          </div>

          <div className="official-beta-banner__actions">
            <a
              className="official-beta-banner__apply"
              data-analytics-cta-id="beta_banner_apply"
              data-analytics-event="official_cta_clicked"
              data-analytics-placement="top_banner"
              data-analytics-target-path={OFFICIAL_BETA_FORM_URL}
              href={OFFICIAL_BETA_FORM_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Apply Now -&gt;
            </a>
            <button
              aria-label="Close beta application banner"
              className="official-beta-banner__close"
              onClick={handleDismiss}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
