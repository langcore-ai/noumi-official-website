import footerDefaults from '@/lib/site/footer-defaults.json'
import { OfficialFooterContact, OfficialFooterLanguage } from './OfficialFooterControls'
import type { MenuSetting } from '@/payload-types'
import { safeHref } from '@/lib/site/managed-routing'
import Link from 'next/link'

import { HOME_ASSETS } from '@/lib/site/homepage-assets'
import {
  OFFICIAL_PRODUCT_AUTH_TARGET_PATH,
  OFFICIAL_PRODUCT_AUTH_URL,
} from '@/lib/site/official-site'

import { OfficialBetaBanner } from './OfficialBetaBanner'

/** 官网主导航固定链接。 */
const PRIMARY_NAV_ITEMS = [
  { href: '/features', label: 'Features' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
] as const

/** 官网主导航项 key。 */
type PrimaryNavItem = (typeof PRIMARY_NAV_ITEMS)[number]['href']

/** 官网导航可高亮项。 */
export type ActiveNavItem = PrimaryNavItem | '/about'

/**
 * 渲染移动端折叠菜单的主导航链接。
 * @param activeItem 当前激活的主导航
 * @returns 主导航列表
 */
function renderMobilePrimaryLinks(activeItem?: ActiveNavItem) {
  return PRIMARY_NAV_ITEMS.map((item) => (
    <Link
      aria-current={activeItem === item.href ? 'page' : undefined}
      className="mobile-nav__link"
      href={item.href}
      key={item.href}
      prefetch={false}
    >
      {item.label}
    </Link>
  ))
}

/**
 * 官网统一主导航
 * @param props 当前激活的导航项
 * @returns 全站头部
 */
export function OfficialHomeHeader(props: {
  activeItem?: ActiveNavItem
  menu?: MenuSetting | null
  pathname?: string
}) {
  const { activeItem, menu, pathname } = props
  const ctaHref = menu?.ctaHref && safeHref(menu.ctaHref) ? menu.ctaHref : OFFICIAL_PRODUCT_AUTH_URL
  const ctaLabel = menu?.ctaLabel || 'Try Noumi Free'
  const customNavigation = (mobile: boolean) =>
    (menu?.header || [])
      .filter((item) => !item.hidden && safeHref(item.href))
      .map((item) => {
        const children = (item.children || []).filter(
          (child) => !child.hidden && safeHref(child.href),
        )
        const active =
          pathname === item.href ||
          (item.href !== '/' && pathname?.startsWith(`${item.href}/`)) ||
          children.some((child) => pathname === child.href)
        const link = (
          <Link
            className={mobile ? 'mobile-nav__link' : active ? 'is-active' : undefined}
            aria-current={active ? 'page' : undefined}
            href={item.href}
          >
            {item.label}
          </Link>
        )
        return children.length ? (
          <details
            className={active ? 'managed-nav-group is-active' : 'managed-nav-group'}
            key={item.id || item.href}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.currentTarget.open = false
                event.currentTarget.querySelector('summary')?.focus()
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                event.currentTarget.open = false
              }
            }}
            onPointerEnter={(event) => {
              if (!mobile && event.pointerType === 'mouse') event.currentTarget.open = true
            }}
            onPointerLeave={(event) => {
              if (!mobile && event.pointerType === 'mouse') event.currentTarget.open = false
            }}
          >
            <summary>{item.label}</summary>
            <div className="managed-nav-children">
              {children.map((child) => (
                <Link
                  key={child.id || child.href}
                  href={child.href}
                  aria-current={pathname === child.href ? 'page' : undefined}
                  onClick={(event) => {
                    const group = event.currentTarget.closest('details')
                    if (group) group.open = false
                  }}
                  className={mobile ? 'mobile-nav__link' : undefined}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </details>
        ) : (
          <span key={item.id || item.href}>{link}</span>
        )
      })

  return (
    <header className="site-header site-header--home" data-official-nav id="nav">
      <OfficialBetaBanner />
      <div className="container nav-row">
        <Link aria-label="Noumi home" className="brand" href="/" prefetch={false}>
          <img
            alt="Noumi icon"
            className="brand__icon brand__icon--img"
            src={HOME_ASSETS.logo}
            width={30}
            height={30}
          />
          <span className="brand__wordmark">Noumi.ai</span>
        </Link>

        <nav aria-label="Primary" className="site-nav">
          {menu ? (
            customNavigation(false)
          ) : (
            <>
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Link
                  aria-current={activeItem === item.href ? 'page' : undefined}
                  className={activeItem === item.href ? 'is-active' : undefined}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                aria-current={activeItem === '/about' ? 'page' : undefined}
                className={
                  activeItem === '/about' ? 'site-nav__about is-active' : 'site-nav__about'
                }
                href="/about"
              >
                About Us
              </Link>
            </>
          )}
        </nav>
        <Link
          className="button button--dark button--nav noumi-modern-cta"
          data-analytics-cta-id="home_header_try_free"
          data-analytics-event="official_cta_clicked"
          data-analytics-placement="header"
          data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
          href={ctaHref}
        >
          {ctaLabel}
        </Link>

        <div className="mobile-nav">
          <input
            aria-label="Toggle menu"
            className="mobile-nav__toggle"
            id="mobile-nav-home"
            type="checkbox"
          />
          <label className="mobile-nav__summary" htmlFor="mobile-nav-home">
            Menu
          </label>
          <div className="mobile-nav__panel">
            <div className="mobile-nav__panel-inner">
              <nav aria-label="Mobile primary navigation" className="mobile-nav__group">
                {menu ? (
                  customNavigation(true)
                ) : (
                  <>
                    {renderMobilePrimaryLinks(activeItem)}
                    <Link
                      aria-current={activeItem === '/about' ? 'page' : undefined}
                      className="mobile-nav__link"
                      href="/about"
                    >
                      About
                    </Link>
                  </>
                )}
                <Link
                  className="mobile-nav__cta noumi-modern-cta"
                  data-analytics-cta-id="home_header_try_free"
                  data-analytics-event="official_cta_clicked"
                  data-analytics-placement="header"
                  data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
                  href={ctaHref}
                >
                  {ctaLabel}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * 官网统一页脚
 * @returns 官网统一页脚
 */
export function OfficialHomeFooter({ menu }: { menu?: MenuSetting | null } = {}) {
  const footerDescription =
    !menu?.description ||
    menu.description.trim() ===
      'A personal AI workspace built for Business & Solutions professionals'
      ? 'The trustworthy AI teammate for presales & solution consultants.'
      : menu.description

  const oldCopyright = [
    '© 2026 Noumi. All rights reserved.',
    '© 2026 Noumi.ai All rights reserved.',
  ]
  const footerCopyright =
    !menu?.copyright || oldCopyright.includes(menu.copyright.trim())
      ? footerDefaults.copyright
      : menu.copyright
  const columns = menu ? menu.footer || [] : footerDefaults.footer
  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link aria-label="Noumi home" className="brand brand--footer" href="/">
            <img
              alt=""
              className="brand__icon brand__icon--img"
              src={HOME_ASSETS.logo}
              width={30}
              height={30}
            />
            <span className="brand__wordmark">Noumi.ai</span>
          </Link>
          <p className="footer-note">
            {footerDescription ===
            'The trustworthy AI teammate for presales & solution consultants.' ? (
              <>
                <span className="footer-note__first-line">
                  The trustworthy AI teammate for presales &amp;
                </span>
                <br />
                solution consultants.
              </>
            ) : (
              footerDescription
            )}
          </p>
          <div className="footer-social-icons" aria-label="Social media">
            {[
              { label: 'YouTube', href: 'https://www.youtube.com/@Noumi-AI', icon: 'youtube' },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/noumi-ai',
                icon: 'linkedin',
              },
              { label: 'X', href: 'https://x.com/Noumi_ai', icon: 'x' },
            ].map(({ label, href, icon }) => (
              <a
                className="footer-social-icon"
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`/assets/redesign/footer-social-${icon}.svg`}
                  alt=""
                  width={16}
                  height={16}
                />
              </a>
            ))}
          </div>
        </div>
        {columns
          .filter((column) => !('hidden' in column && column.hidden))
          .map((column) => (
            <div className="footer-column" key={column.title}>
              <h2 className="footer-heading">{column.title}</h2>
              {(column.links || [])
                .filter((link) => !('hidden' in link && link.hidden) && safeHref(link.href))
                .map((link) =>
                  link.href.startsWith('mailto:') ? (
                    <OfficialFooterContact
                      key={link.href}
                      label={link.label}
                      email={link.href.slice(7).split('?')[0]}
                    />
                  ) : (
                    <Link href={link.href} key={link.href} prefetch={false}>
                      {link.label}
                    </Link>
                  ),
                )}
            </div>
          ))}
      </div>
      {menu && (
        <div className="container">
          {menu.phone && <p>{menu.phone}</p>}
          {menu.address && <p>{menu.address}</p>}
          {menu.icp && <p>{menu.icp}</p>}
          {menu.publicSecurity && <p>{menu.publicSecurity}</p>}
        </div>
      )}
      <div className="container footer-bottom">
        <span>{footerCopyright}</span>
        <OfficialFooterLanguage />
      </div>
    </footer>
  )
}
