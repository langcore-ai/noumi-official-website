import Link from 'next/link'

import type { OfficialUseCaseNavItem } from '@/lib/site/official-cms'

/**
 * 首页头部
 * @param props use case 页签
 * @returns 首页头部
 */
export function OfficialHomeHeader(props: { useCases: OfficialUseCaseNavItem[] }) {
  const { useCases } = props
  const primaryUseCase = useCases[0]

  return (
    <header className="site-header" data-official-nav id="nav">
      <div className="container nav-row">
        <Link aria-label="Noumi home" className="brand" href="/">
          <img
            alt=""
            className="brand__icon brand__icon--img"
            src="/assets/materials/WEB ICON.png"
          />
          <img alt="Noumi" className="brand__title-img" src="/assets/materials/WEB TITLE.png" />
        </Link>

        <nav aria-label="Primary" className="site-nav">
          <Link href={primaryUseCase ? `/use-cases/${primaryUseCase.slug}` : '/'}>Use Cases</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/pricing">Pricing</Link>
          <Link className="button button--dark button--nav" href="/invite">
            Try Free
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
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
  const primaryUseCase = useCases[0]

  return (
    <header className="site-header" data-official-nav id="nav">
      <div className="container nav-row">
        <Link aria-label="Noumi home" className="brand" href="/">
          <img
            alt=""
            className="brand__icon brand__icon--img"
            src="/assets/materials/WEB ICON.png"
          />
          <img alt="Noumi" className="brand__title-img" src="/assets/materials/WEB TITLE.png" />
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
          <Link href={primaryUseCase ? `/use-cases/${primaryUseCase.slug}` : '/'}>Use Cases</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/pricing">Pricing</Link>
          <Link className="button button--dark button--nav" href="/invite">
            Try Free
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

/**
 * 首页页脚
 * @param props use case 页签
 * @returns 首页页脚
 */
export function OfficialHomeFooter(props: { useCases: OfficialUseCaseNavItem[] }) {
  const { useCases } = props

  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-grid">
        <div>
          <Link aria-label="Noumi home" className="brand brand--footer" href="/">
            <img alt="" className="brand__icon brand__icon--img" src="/assets/materials/WEB ICON.png" />
            <img
              alt="Noumi"
              className="brand__title-img brand__title-img--footer"
              src="/assets/materials/WEB TITLE.png"
            />
          </Link>
          <p className="footer-note">Don&apos;t teach your AI twice.</p>
        </div>
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
