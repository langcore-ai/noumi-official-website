'use client'

import type { MenuSetting } from '@/payload-types'

import { useEffect, useRef } from 'react'

import { usePathname } from 'next/navigation'

import { OfficialHomeHeader, type ActiveNavItem } from './OfficialHomeChrome'

/**
 * 根据当前路径推导主导航高亮项。
 * @param pathname 当前前台路径
 * @returns 需要高亮的主导航项
 */
function getActivePrimaryNavItem(pathname: string): ActiveNavItem | undefined {
  if (pathname === '/features' || pathname.startsWith('/features/')) {
    return '/features'
  }

  if (pathname === '/use-cases' || pathname.startsWith('/use-cases/')) {
    return '/use-cases'
  }

  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return '/blog'
  }

  if (pathname === '/pricing') {
    return '/pricing'
  }

  if (pathname === '/about' || pathname.startsWith('/about/')) {
    return '/about'
  }

  return undefined
}

/**
 * 持久在线官网头部；高亮由客户端路径即时计算。
 * @returns 当前路由对应的头部
 */
export function OfficialPersistentHeader({ menu }: { menu?: MenuSetting | null }) {
  const pathname = usePathname() || '/'
  const headerWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = headerWrapperRef.current
    const shell = wrapper?.parentElement
    if (!wrapper || !shell) return

    const updateHeight = () => {
      shell.style.setProperty(
        '--official-header-height',
        `${wrapper.getBoundingClientRect().height}px`,
      )
    }
    const observer = new ResizeObserver(updateHeight)
    observer.observe(wrapper)
    updateHeight()
    return () => {
      observer.disconnect()
      shell.style.removeProperty('--official-header-height')
    }
  }, [])

  useEffect(() => {
    // 切页后关闭移动端菜单，避免持久 header 保留上一次的展开状态。
    headerWrapperRef.current
      ?.querySelectorAll<HTMLInputElement>('.mobile-nav__toggle')
      .forEach((input) => {
        input.checked = false
      })
  }, [pathname])

  return (
    <div className="official-persistent-header" ref={headerWrapperRef}>
      <OfficialHomeHeader
        menu={menu}
        pathname={pathname}
        activeItem={getActivePrimaryNavItem(pathname)}
      />
    </div>
  )
}
