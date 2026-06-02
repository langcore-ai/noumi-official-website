import type { ReactNode } from 'react'

import { getOfficialFeatureNavItems, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'

import { OfficialHomeFooter } from './OfficialHomeChrome'
import { OfficialPersistentHeader } from './OfficialPersistentHeader'

/**
 * 前台持久在线壳层。Header/footer 的 CMS 导航数据在 layout 层读取，避免每个页面重复等待。
 * @param props 页面内容
 * @returns 带统一 header/footer 的页面壳层
 */
export async function OfficialPersistentChrome(props: { children: ReactNode }) {
  const { children } = props
  const [features, useCases] = await Promise.all([
    getOfficialFeatureNavItems(),
    getOfficialUseCaseNavItems(),
  ])

  return (
    <div className="page-shell">
      <OfficialPersistentHeader useCases={useCases} />
      {children}
      <OfficialHomeFooter features={features} useCases={useCases} />
    </div>
  )
}
