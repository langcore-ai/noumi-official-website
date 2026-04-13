'use client'

import { useEffect } from 'react'

/** 站点头部选择器 */
const SITE_HEADER_SELECTOR = '[data-site-header]'

/**
 * 同步导航栏高度到全局 CSS 变量
 * @returns void
 */
function syncSiteHeaderHeight(): void {
  const siteHeader = document.querySelector<HTMLElement>(SITE_HEADER_SELECTOR)
  const headerHeight = siteHeader?.getBoundingClientRect().height ?? 0

  document.documentElement.style.setProperty('--site-header-height', `${Math.round(headerHeight)}px`)
}

/**
 * 监听导航栏高度变化，驱动整屏 section 的视口计算
 * @returns null
 */
export function ViewportSectionObserver(): null {
  useEffect(() => {
    const siteHeader = document.querySelector<HTMLElement>(SITE_HEADER_SELECTOR)

    // 首次渲染立即同步，避免首屏出现高度闪动
    syncSiteHeaderHeight()

    if (!siteHeader) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      syncSiteHeaderHeight()
    })

    resizeObserver.observe(siteHeader)
    window.addEventListener('resize', syncSiteHeaderHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncSiteHeaderHeight)
    }
  }, [])

  return null
}
