import Link from 'next/link'

import type { SiteNavigationItem } from '@/lib/site/cms'

/**
 * 官网头部导航
 * @param props 品牌与导航配置
 * @returns 顶部导航栏
 */
export function SiteHeader(props: {
  mainNavigationLabel: string
  navigation: SiteNavigationItem[]
  siteName?: string | null
  siteLogoAlt: string
  navCtaText?: string | null
  navCtaHref?: string | null
}) {
  const { mainNavigationLabel, navigation, siteName, siteLogoAlt, navCtaText, navCtaHref } = props
  const siteNameText = siteName?.trim()
  const navCtaLabel = navCtaText?.trim()
  const navCtaLink = navCtaHref?.trim()

  return (
    <nav className="nav" aria-label={mainNavigationLabel} data-site-header>
      <div className="wrap nav__inner">
        <Link className="nav__logo" href="/" aria-label={`${siteNameText || 'Noumi'} homepage`}>
          <img alt={siteLogoAlt} className="nav__logo-mark" height="28" src="/Noumi-Logo.svg" width="28" />
          {siteNameText ? <span className="nav__wordmark">{siteNameText}</span> : null}
        </Link>

        <ul className="nav__links">
          {navigation.map((item) => {
            if (!item.children?.length) {
              return (
                <li key={item.label} className="nav__item">
                  <Link href={item.href ?? '/'}>{item.label}</Link>
                </li>
              )
            }

            return (
              <li key={item.label} className="nav__item nav__item--has-menu">
                <button aria-haspopup="true" className="nav__trigger" type="button">
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="nav__caret">
                    ▾
                  </span>
                </button>
                <div className="nav__menu">
                  {item.children.map((child) => (
                    <Link key={child.href} className="nav__menu-link" href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>

        {navCtaLabel && navCtaLink ? (
          <Link className="nav__cta" href={navCtaLink}>
            {navCtaLabel}
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
