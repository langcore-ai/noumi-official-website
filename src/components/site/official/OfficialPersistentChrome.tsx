import type { ReactNode } from 'react'

import { OfficialHomeFooter } from './OfficialHomeChrome'
import { OfficialPersistentHeader } from './OfficialPersistentHeader'

/**
 * 前台统一壳层；所有官网路由共享同一套导航和页脚。
 * @param props 页面内容
 * @returns 带统一 header/footer 的页面壳层
 */
export function OfficialPersistentChrome(props: { children: ReactNode }) {
  const { children } = props

  return (
    <div className="page-shell">
      <OfficialPersistentHeader />
      {children}
      <OfficialHomeFooter />
    </div>
  )
}
