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
export function OfficialHomeHeader(props: { activeItem?: ActiveNavItem }) {
  const { activeItem } = props

  return (
    <header className="site-header site-header--home" data-official-nav id="nav">
      <OfficialBetaBanner />
      <div className="container nav-row">
        <Link aria-label="Noumi home" className="brand" href="/">
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
            className="site-nav__about"
            href="/about"
          >
            About Us
          </Link>
        </nav>
        <Link
          className="button button--dark button--nav noumi-modern-cta"
          data-analytics-cta-id="home_header_try_free"
          data-analytics-event="official_cta_clicked"
          data-analytics-placement="header"
          data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
          href={OFFICIAL_PRODUCT_AUTH_URL}
        >
          Try Noumi Free
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
                {renderMobilePrimaryLinks(activeItem)}
                <Link
                  aria-current={activeItem === '/about' ? 'page' : undefined}
                  className="mobile-nav__link"
                  href="/about"
                >
                  About
                </Link>
                <Link
                  className="mobile-nav__cta noumi-modern-cta"
                  data-analytics-cta-id="home_header_try_free"
                  data-analytics-event="official_cta_clicked"
                  data-analytics-placement="header"
                  data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
                  href={OFFICIAL_PRODUCT_AUTH_URL}
                >
                  Try Noumi Free
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
export function OfficialHomeFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-grid">
        <div>
          <Link aria-label="Noumi home" className="brand brand--footer" href="/">
            <img
              alt="Noumi.ai"
              className="footer-prototype-logo"
              src={HOME_ASSETS.footerLogo}
              width={190}
              height={48}
            />
          </Link>
          <p className="footer-note">
            A personal AI workspace built for Business &amp; Solutions professionals
          </p>
          <Link
            className="footer-free-cta"
            href={OFFICIAL_PRODUCT_AUTH_URL}
            data-analytics-cta-id="footer_try_free"
            data-analytics-event="official_cta_clicked"
            data-analytics-placement="footer"
            data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
          >
            Try Noumi Free
          </Link>
        </div>
        <div>
          <h2 className="footer-heading">Product</h2>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/features">Features</Link>
          <Link href="/use-cases">Use Cases</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <h2 className="footer-heading">Resources</h2>
          <Link href="/faqs">FAQ</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/links">Links</Link>
        </div>
        <div>
          <h2 className="footer-heading">Contact</h2>
          <div className="footer-social-area">
            {[
              {
                label: 'Email',
                href: 'mailto:official@noumi.ai?subject=Inquiry%20from%20Noumi%20Website',
                icon: 'email.png',
              },
              { label: 'YouTube', href: 'https://www.youtube.com/@Noumi-AI', icon: 'youtube.png' },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/noumi-ai',
                icon: 'linkedin.svg',
              },
              { label: 'Twitter', href: 'https://x.com/Noumi_ai', icon: 'twitter.svg' },
            ].map(({ label, href, icon }) => (
              <a
                className="footer-social-link"
                href={href}
                key={label}
                target={href.startsWith('https:') ? '_blank' : undefined}
                rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}
              >
                <span>{label}</span>
                <img
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  src={`/assets/redesign/footer-${icon}`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Noumi. All rights reserved.</span>
      </div>
    </footer>
  )
}
