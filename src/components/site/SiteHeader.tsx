import Link from 'next/link'

import { SiteLanguageSwitcher } from '@/components/site/SiteLanguageSwitcher'
import type { SiteNavigationItem } from '@/lib/site/cms'
import type { SiteLocale } from '@/lib/site/i18n'

/**
 * 官网头部导航
 * @param props 品牌与导航配置
 * @returns 顶部导航栏
 */
export function SiteHeader(props: {
  locale: SiteLocale
  localeLabels: Record<SiteLocale, string>
  localeSwitcherLabel: string
  mainNavigationLabel: string
  navigation: SiteNavigationItem[]
  siteName?: string | null
  siteLogoAlt: string
  navCtaText?: string | null
  navCtaHref?: string | null
}) {
  const {
    locale,
    localeLabels,
    localeSwitcherLabel,
    mainNavigationLabel,
    navigation,
    siteName,
    siteLogoAlt,
    navCtaText,
    navCtaHref,
  } = props
  const siteNameText = siteName?.trim()
  const navCtaLabel = navCtaText?.trim()
  const navCtaLink = navCtaHref?.trim()

  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <Link className="site-brand" href="/">
          <img
            alt={siteLogoAlt}
            className="site-brand__logo"
            height="40"
            src="/Noumi-Logo.svg"
            width="40"
          />
          {siteNameText ? <span className="site-brand__wordmark">{siteNameText}</span> : null}
        </Link>

        <nav aria-label={mainNavigationLabel} className="site-nav">
          <ul className="site-nav__list">
            {navigation.map((item) => {
              if (!item.children?.length) {
                return (
                  <li key={item.label} className="site-nav__item">
                    <Link className="site-nav__link" href={item.href ?? '/'}>
                      {item.label}
                    </Link>
                  </li>
                )
              }

              return (
                <li key={item.label} className="site-nav__item site-nav__item--has-menu">
                  <button
                    aria-haspopup="true"
                    className="site-nav__trigger"
                    type="button"
                  >
                    {item.label}
                    <span aria-hidden="true">▾</span>
                  </button>
                  <div className="site-nav__menu">
                    {item.children.map((child) => (
                      <Link key={child.href} className="site-nav__menu-link" href={child.href}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <SiteLanguageSwitcher
            ariaLabel={localeSwitcherLabel}
            labels={localeLabels}
            locale={locale}
          />
          {navCtaLabel && navCtaLink ? (
            <Link className="button button--solid site-header__cta" href={navCtaLink}>
              {navCtaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
