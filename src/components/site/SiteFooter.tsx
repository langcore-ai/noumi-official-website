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
    <footer role="contentinfo">
      <div className="wrap footer__content">
        <div className="footer__intro">
          <Link className="footer__brand" href="/" aria-label={`${siteNameText || 'Noumi'} homepage`}>
            <img alt={siteLogoAlt} className="footer__logo-mark" height="22" src="/Noumi-Logo.svg" width="22" />
            {siteNameText ? <span className="footer__wordmark">{siteNameText}</span> : null}
          </Link>
          {footerDescription ? <p className="footer__description">{footerDescription}</p> : null}
        </div>

        <div className="footer__columns">
          {columns.map((column) => (
            <section key={column.title} className="footer__column" aria-label={column.title}>
              <h2>{column.title}</h2>
              <ul className="footer__links">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
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

        {footerCopyright ? (
          <div className="footer__meta">
            <small>{footerCopyright}</small>
          </div>
        ) : null}
      </div>
    </footer>
  )
}
