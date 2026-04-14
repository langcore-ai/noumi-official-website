import Link from 'next/link'

import type { SiteFooterColumn } from '@/lib/site/cms'

/**
 * 官网页脚
 * @param props 页脚配置
 * @returns 页脚结构
 */
export function SiteFooter(props: {
  columns: SiteFooterColumn[]
  siteName?: string | null
  siteLogoAlt: string
  description?: string | null
  copyright?: string | null
}) {
  const { columns, siteName, siteLogoAlt, description, copyright } = props
  const siteNameText = siteName?.trim()
  const footerDescription = description?.trim()
  const footerCopyright = copyright?.trim()

  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__grid">
        <div className="site-footer__intro">
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
          {footerDescription ? <p>{footerDescription}</p> : null}
        </div>

        {columns.map((column) => (
          <section key={column.title} className="site-footer__column">
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('mailto:') ? (
                    <a href={link.href}>{link.label}</a>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="site-shell site-footer__bottom">
        {footerCopyright ? <small>{footerCopyright}</small> : null}
      </div>
    </footer>
  )
}
