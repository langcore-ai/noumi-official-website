import type { ReactNode } from 'react'
import Script from 'next/script'

import { OfficialAnalyticsProvider } from '@/components/site/OfficialAnalyticsProvider'
import { CookieConsentBanner } from '@/components/site/CookieConsentBanner'
import { OfficialGlobalEffects } from '@/components/site/official/OfficialGlobalEffects'
import { OfficialPersistentChrome } from '@/components/site/official/OfficialPersistentChrome'
import { buildOfficialGoogleTagBootstrapScript, OFFICIAL_GOOGLE_TAG_ID } from '@/lib/site/analytics'
import { createOfficialMetadata } from '@/lib/site/official-site'

import './official-base.css'
import './official-home.css'

/**
 * 前台页面保留运行时渲染以支持 Payload 草稿预览；发布态 CMS 读取在读取层走 R2 增量缓存。
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
        <Script
          id="noumi-official-google-tag-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: buildOfficialGoogleTagBootstrapScript(),
          }}
        />
        <Script
          async
          id="noumi-official-google-tag"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
            OFFICIAL_GOOGLE_TAG_ID,
          )}`}
          strategy="afterInteractive"
        />
        <OfficialAnalyticsProvider>
          <OfficialGlobalEffects />
          <OfficialPersistentChrome>{children}</OfficialPersistentChrome>
          <CookieConsentBanner />
        </OfficialAnalyticsProvider>
      </body>
    </html>
  )
}
