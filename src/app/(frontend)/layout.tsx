import type { ReactNode } from 'react'

import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { CookieConsentBanner } from '@/components/site/CookieConsentBanner'
import { OfficialGlobalEffects } from '@/components/site/official/OfficialGlobalEffects'
import { createOfficialMetadata } from '@/lib/site/official-site'

import './official-base.css'
import './official-home.css'

/**
 * 前台页面统一走动态数据，确保 CMS 内容可立即反映。
 */
export const dynamic = 'force-dynamic'

/**
 * 生成前台默认 metadata
 * @returns metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'AI Personal Assistant That Works Like a Colleague | Noumi',
    description:
      'Noumi works like a real colleague — understanding context, managing tasks, and delivering results without constant prompting.',
    pathname: '/',
  })
}

/**
 * 官网页面布局
 * @param props 子节点
 * @returns 前台统一壳层
 */
export default async function FrontendLayout(props: { children: ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <OfficialAnalyticsProvider>
          <OfficialGlobalEffects />
          {children}
          <CookieConsentBanner />
        </OfficialAnalyticsProvider>
      </body>
    </html>
  )
}
