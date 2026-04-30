import Link from 'next/link'

import type { OfficialUseCaseNavItem } from '@/lib/site/official-cms'

/**
 * 渲染站内 use case 链接列表
 * @param useCases use case 列表
 * @returns 链接节点
 */
function renderUseCaseLinks(useCases: OfficialUseCaseNavItem[]) {
  return useCases.map((useCase) => (
    <li key={useCase.slug}>
      <Link href={`/use-cases/${useCase.slug}`}>{useCase.label}</Link>
    </li>
  ))
}

type OfficialInnerHeaderProps = {
  /** 当前主导航激活项 */
  activeItem?: 'blog' | 'pricing' | 'use-cases'
  /** use case 列表 */
  useCases: OfficialUseCaseNavItem[]
}

/**
 * 判断主导航项是否激活
 * @param activeItem 当前激活项
 * @param item 导航项
 * @returns 是否激活
 */
function getNavLinkClass(
  activeItem: OfficialInnerHeaderProps['activeItem'],
  item: NonNullable<OfficialInnerHeaderProps['activeItem']>,
) {
  return activeItem === item ? 'is-active' : undefined
}

/**
 * 正式内页导航
 * @param props 组件参数
 * @returns 导航栏
 */
export function OfficialInnerHeader(props: OfficialInnerHeaderProps) {
  const { activeItem } = props

  return (
    <nav
      aria-label="Main navigation"
      className="official-inner-nav"
      data-official-nav
      id="nav"
      role="navigation"
    >
      <Link className="nav-logo" href="/">
        <img alt="Noumi" src="/Noumi-Logo.svg" />
        <span>Noumi</span>
      </Link>
      <ul className="nav-links">
        <li>
          <Link className={getNavLinkClass(activeItem, 'use-cases')} href="/use-cases">
            Use Cases
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass(activeItem, 'blog')} href="/blog">
            Blog
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass(activeItem, 'pricing')} href="/pricing">
            Pricing
          </Link>
        </li>
        <li>
          <Link
            className="nav-cta"
            data-analytics-cta-id="inner_header_try_free"
            data-analytics-event="official_cta_clicked"
            data-analytics-placement="header"
            data-analytics-target-path="/invite"
            href="/invite"
          >
            Try Free →
          </Link>
        </li>
      </ul>
    </nav>
  )
}

/**
 * 正式内页页脚
 * @param props 组件参数
 * @returns 页脚
 */
export function OfficialInnerFooter(props: { useCases: OfficialUseCaseNavItem[] }) {
  const { useCases } = props

  return (
    <footer className="official-inner-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="footer-logo" href="/">
              Noumi
            </Link>
            <p className="footer-note">Don&apos;t teach your AI twice.</p>
          </div>
          <div className="footer-col">
            <h4>Use Cases</h4>
            <ul>{renderUseCaseLinks(useCases)}</ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/faqs">FAQ</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Noumi. All rights reserved.</p>
          <p className="footer-copy">noumi.ai</p>
        </div>
      </div>
    </footer>
  )
}
