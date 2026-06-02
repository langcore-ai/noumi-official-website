'use client'

import { useEffect, useRef } from 'react'

import { usePathname } from 'next/navigation'

import type { OfficialUseCaseNavItem } from '@/lib/site/official-cms'

import {
  OfficialHomeHeader,
  OfficialUseCaseHeader,
  type ActiveNavItem,
} from './OfficialHomeChrome'

/**
 * 根据当前路径推导主导航高亮项。
 * @param pathname 当前前台路径
 * @returns 需要高亮的主导航项
 */
function getActivePrimaryNavItem(pathname: string): ActiveNavItem | undefined {
  if (pathname === '/features' || pathname.startsWith('/features/')) {
    return '/features'
  }

  if (pathname === '/use-cases') {
    return '/use-cases'
  }

  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return '/blog'
  }

  if (pathname === '/pricing') {
    return '/pricing'
  }

  return undefined
}

/**
 * 从路径中解析 Use Case 详情页 slug。
 * @param pathname 当前前台路径
 * @returns Use Case slug
 */
function getUseCaseDetailSlug(pathname: string): string | undefined {
  const [, slug] = pathname.match(/^\/use-cases\/([^/?#]+)/) ?? []

  return slug ? decodeURIComponent(slug) : undefined
}

/**
 * 持久在线官网头部。导航数据固定由 layout 提供，高亮由客户端路径即时计算。
 * @param props Use Case 导航项
 * @returns 当前路由对应的头部
 */
export function OfficialPersistentHeader(props: { useCases: OfficialUseCaseNavItem[] }) {
  const { useCases } = props
  const pathname = usePathname() || '/'
  const headerWrapperRef = useRef<HTMLDivElement>(null)
  const activeUseCaseSlug = getUseCaseDetailSlug(pathname)

  useEffect(() => {
    // 切页后关闭移动端菜单，避免持久 header 保留上一次的展开状态。
    headerWrapperRef.current
      ?.querySelectorAll<HTMLInputElement>('.mobile-nav__toggle')
      .forEach((input) => {
        input.checked = false
      })
  }, [pathname])

  return (
    <div ref={headerWrapperRef}>
      {activeUseCaseSlug ? (
        <OfficialUseCaseHeader activeSlug={activeUseCaseSlug} useCases={useCases} />
      ) : (
        <OfficialHomeHeader
          activeItem={getActivePrimaryNavItem(pathname)}
          useCases={useCases}
        />
      )}
    </div>
  )
}
