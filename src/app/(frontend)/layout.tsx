import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { draftMode, headers } from 'next/headers'
import { PayloadLivePreviewListener } from './PayloadLivePreviewListener'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { ViewportSectionObserver } from '@/components/site/ViewportSectionObserver'
import { getSiteDictionary, getSiteLogoAlt } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getSiteSettings, mapFooterColumns, mapNavigation } from '@/lib/site/cms'
import { buildExitPreviewURL } from '@/lib/site/publishing'
import { createPageMetadata } from '@/lib/site/seo'

import './styles.css'

/**
 * 前台页面统一走动态数据，确保后台修改可立即反映
 */
export const dynamic = 'force-dynamic'

/**
 * 生成前台默认 metadata
 * @returns metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const siteSettings = await getSiteSettings(locale)
  const metadata = await createPageMetadata({
    locale,
    title: siteSettings.siteName?.trim(),
    description: siteSettings.defaultDescription?.trim(),
    pathname: '/',
  })

  metadata.icons = {
    icon: '/Noumi-Logo.svg',
    shortcut: '/Noumi-Logo.svg',
    apple: '/Noumi-Logo.svg',
  }

  return metadata
}

/**
 * 解析当前请求对应的站点 origin
 * live preview 官方组件要求传入准确的 serverURL，用于校验 postMessage 来源。
 * @returns 当前请求 origin；缺失时返回 null
 */
async function getLivePreviewServerURL(): Promise<null | string> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')

  if (!host) {
    return null
  }

  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${protocol}://${host}`
}

/**
 * 官网页面布局
 * @param props 子节点
 * @returns 前台统一壳层
 */
export default async function FrontendLayout(props: { children: ReactNode }) {
  const { children } = props
  const locale = await getRequestLocale()
  const preview = await draftMode()
  const livePreviewServerURL = preview.isEnabled ? await getLivePreviewServerURL() : null
  const dictionary = getSiteDictionary(locale)
  const siteSettings = await getSiteSettings(locale)

  return (
    <html lang={locale}>
      <body>
        <div className="site-root">
          <ViewportSectionObserver />
          {preview.isEnabled && livePreviewServerURL ? (
            <PayloadLivePreviewListener serverURL={livePreviewServerURL} />
          ) : null}
          {preview.isEnabled ? (
            <div className="preview-banner">
              <div className="site-shell preview-banner__inner">
                <p>Previewing draft content from Payload CMS.</p>
                <a className="button button--ghost" href={buildExitPreviewURL('/')}>
                  Exit preview
                </a>
              </div>
            </div>
          ) : null}
          <SiteHeader
            locale={locale}
            localeLabels={dictionary.common.localeNames}
            localeSwitcherLabel={dictionary.common.languageSwitcher}
            mainNavigationLabel={dictionary.common.mainNavigation}
            navCtaHref={siteSettings.navCtaHref}
            navCtaText={siteSettings.navCtaText}
            navigation={mapNavigation(siteSettings)}
            siteName={siteSettings.siteName}
            siteLogoAlt={getSiteLogoAlt(locale, siteSettings.siteName)}
          />
          <main className="site-main">{children}</main>
          <SiteFooter
            columns={mapFooterColumns(siteSettings)}
            copyright={siteSettings.footerCopyright}
            description={siteSettings.footerDescription}
            siteName={siteSettings.siteName}
            siteLogoAlt={getSiteLogoAlt(locale, siteSettings.siteName)}
          />
        </div>
      </body>
    </html>
  )
}
