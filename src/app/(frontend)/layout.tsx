import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getSiteDictionary, getSiteLogoAlt } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getSiteSettings, mapFooterColumns, mapNavigation } from '@/lib/site/cms'
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
 * 官网页面布局
 * @param props 子节点
 * @returns 前台统一壳层
 */
export default async function FrontendLayout(props: { children: ReactNode }) {
  const { children } = props
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const siteSettings = await getSiteSettings(locale)

  return (
    <html lang={locale}>
      <body>
        <div className="site-root">
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
