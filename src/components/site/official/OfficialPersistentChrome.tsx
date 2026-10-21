import { getMenuSettings } from '@/lib/site/managed-settings'
import type { ReactNode } from 'react'

import { OfficialFinalCTA } from './OfficialFinalCTA'
import { OfficialHomeFooter } from './OfficialHomeChrome'
import { OfficialPersistentHeader } from './OfficialPersistentHeader'

/**
 * 前台统一壳层；所有官网路由共享同一套导航和页脚。
 * @param props 页面内容
 * @returns 带统一 header/footer 的页面壳层
 */
export async function OfficialPersistentChrome(props: { children: ReactNode }) {
  const { children } = props
  const menu = await getMenuSettings()

  return (
    <div className="page-shell">
      <OfficialPersistentHeader menu={menu} />
      {children}
      <OfficialFinalCTA />
      <OfficialHomeFooter menu={menu} />
    </div>
  )
}
