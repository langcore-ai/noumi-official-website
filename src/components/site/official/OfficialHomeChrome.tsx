import Link from 'next/link'

import {
  getOfficialFeatureNavItems,
  type OfficialFeatureNavItem,
  type OfficialUseCaseNavItem,
} from '@/lib/site/official-cms'
import {
  OFFICIAL_LOGO,
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
type ActiveNavItem = PrimaryNavItem

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
    >
      {item.label}
    </Link>
  ))
}

/**
 * 首页头部
 * @param props use case 页签
 * @returns 首页头部
 */
export function OfficialHomeHeader(props: {
  activeItem?: ActiveNavItem
  useCases: OfficialUseCaseNavItem[]
}) {
  const { activeItem } = props

  return (
    <header className="site-header site-header--home" data-official-nav id="nav">
      <OfficialBetaBanner />
      <div className="container nav-row">
        <Link aria-label="Noumi home" className="brand" href="/">
          <img
            alt="Noumi icon"
            className="brand__icon brand__icon--img"
            src={OFFICIAL_LOGO}
          />
          <span className="brand__wordmark">Noumi</span>
        </Link>

        <nav aria-label="Primary" className="site-nav">
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
            className="button button--dark button--nav"
            data-analytics-cta-id="home_header_try_free"
            data-analytics-event="official_cta_clicked"
            data-analytics-placement="header"
            data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
            href={OFFICIAL_PRODUCT_AUTH_URL}
          >
            Try Free
            <span aria-hidden="true">→</span>
          </Link>
        </nav>

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
                {renderMobilePrimaryLinks(activeItem)}
                <Link
                  className="mobile-nav__cta"
                  data-analytics-cta-id="home_header_try_free"
                  data-analytics-event="official_cta_clicked"
                  data-analytics-placement="header"
                  data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
                  href={OFFICIAL_PRODUCT_AUTH_URL}
                >
                  Try Free
                  <span aria-hidden="true">→</span>
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
 * Use case 页专属头部
 * @param props use case 页签与当前页 slug
 * @returns 头部
 */
export function OfficialUseCaseHeader(props: {
  activeSlug: string
  useCases: OfficialUseCaseNavItem[]
}) {
  const { activeSlug, useCases } = props

  return (
    <header className="site-header site-header--use-case" data-official-nav id="nav">
      <OfficialBetaBanner />
      <div className="container nav-row">
        <Link aria-label="Noumi home" className="brand" href="/">
          <img
            alt="Noumi icon"
            className="brand__icon brand__icon--img"
            src={OFFICIAL_LOGO}
          />
          <span className="brand__wordmark">Noumi</span>
        </Link>

        <nav aria-label="Use case navigation" className="site-nav site-nav--use-case">
          {useCases.map((useCase) => (
            <Link
              aria-current={useCase.slug === activeSlug ? 'page' : undefined}
              className={useCase.slug === activeSlug ? 'is-active' : undefined}
              href={`/use-cases/${useCase.slug}`}
              key={useCase.slug}
            >
              {useCase.label.replace(/^For\s+/i, '')}
            </Link>
          ))}
        </nav>

        <nav aria-label="Primary" className="site-nav">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link
              aria-current={item.href === '/use-cases' ? 'page' : undefined}
              className={item.href === '/use-cases' ? 'is-active' : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="button button--dark button--nav"
            data-analytics-cta-id="use_case_header_try_free"
            data-analytics-event="official_cta_clicked"
            data-analytics-placement="header"
            data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
            href={OFFICIAL_PRODUCT_AUTH_URL}
          >
            Try Free
            <span aria-hidden="true">→</span>
          </Link>
        </nav>

        <div className="mobile-nav mobile-nav--use-case">
          <input
            aria-label="Toggle menu"
            className="mobile-nav__toggle"
            id="mobile-nav-use-case"
            type="checkbox"
          />
          <label className="mobile-nav__summary" htmlFor="mobile-nav-use-case">
            Menu
          </label>
          <div className="mobile-nav__panel">
            <div className="mobile-nav__panel-inner">
              <nav aria-label="Mobile primary navigation" className="mobile-nav__group">
                {renderMobilePrimaryLinks('/use-cases')}
                <Link
                  className="mobile-nav__cta"
                  data-analytics-cta-id="use_case_header_try_free"
                  data-analytics-event="official_cta_clicked"
                  data-analytics-placement="header"
                  data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
                  href={OFFICIAL_PRODUCT_AUTH_URL}
                >
                  Try Free
                  <span aria-hidden="true">→</span>
                </Link>
              </nav>
              {useCases.length > 0 ? (
                <nav aria-label="Mobile use case navigation" className="mobile-nav__group">
                  <span className="mobile-nav__label">Use cases</span>
                  {useCases.map((useCase) => (
                    <Link
                      aria-current={useCase.slug === activeSlug ? 'page' : undefined}
                      className="mobile-nav__link"
                      href={`/use-cases/${useCase.slug}`}
                      key={useCase.slug}
                    >
                      {useCase.label.replace(/^For\s+/i, '')}
                    </Link>
                  ))}
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * 首页页脚
 * @param props use case 页签
 * @returns 首页页脚
 */
export async function OfficialHomeFooter(props: {
  features?: OfficialFeatureNavItem[]
  useCases: OfficialUseCaseNavItem[]
}) {
  const { useCases } = props
  const features = props.features ?? (await getOfficialFeatureNavItems())

  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-grid">
        <div>
          <Link aria-label="Noumi home" className="brand brand--footer" href="/">
            <img
              alt="Noumi icon"
              className="brand__icon brand__icon--img"
              src={OFFICIAL_LOGO}
            />
            <span className="brand__wordmark brand__wordmark--footer">Noumi</span>
          </Link>
          <p className="footer-note">Don&apos;t teach your AI twice.</p>
        </div>
        {features.length > 0 ? (
          <div>
            <p className="footer-heading">FEATURES</p>
            {features.map((feature) => (
              <Link href={feature.href} key={feature.href}>
                {feature.label}
              </Link>
            ))}
          </div>
        ) : null}
        <div>
          <p className="footer-heading">USE CASES</p>
          {useCases.map((useCase) => (
            <Link href={`/use-cases/${useCase.slug}`} key={useCase.slug}>
              {useCase.label}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-heading">COMPANY</p>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <p className="footer-heading">RESOURCES</p>
          <Link href="/blog">Blog</Link>
          <Link href="/faqs">FAQ</Link>
          <Link href="/links">Links</Link>
        </div>
        <div>
          <p className="footer-heading">LEGAL</p>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Noumi. All rights reserved.</span>
        <span>noumi.ai</span>
      </div>
    </footer>
  )
}
