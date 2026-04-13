import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { TypesetText } from '@/components/site/TypesetText'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getFaqItems } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createFaqJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * FAQ 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)

  return createPageMetadata({
    locale,
    title: dictionary.faq.metadataTitle,
    description: dictionary.faq.metadataDescription,
    pathname: '/faqs/',
  })
}

/**
 * FAQ 页面
 * @returns FAQ 页面内容
 */
export default async function FaqPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const items = await getFaqItems(['faqs', 'home'], locale)
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.faq.breadcrumb, pathname: '/faqs/' },
  ], locale)

  return (
    <div className="page page--fullscreen">
      <StructuredData data={breadcrumbJsonLd} />
      {items.length > 0 ? <StructuredData data={createFaqJsonLd(items)} /> : null}

      <section className="site-shell page__hero">
        <span className="page__eyebrow">{dictionary.faq.eyebrow}</span>
        <TypesetText as="h1" locale={locale} text={dictionary.faq.title} variant="heroTitle">
          {dictionary.faq.title}
        </TypesetText>
      </section>

      {items.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="faq-list">
            {items.map((item, index) => (
              <details key={item.id} open={index === 0}>
                <summary>{item.question}</summary>
                <TypesetText as="p" locale={locale} text={item.answer} variant="body">
                  {item.answer}
                </TypesetText>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="site-shell section section--screen">
        <div className="feature-detail__summary">
          <span className="page__eyebrow">{dictionary.faq.moreEyebrow}</span>
          <TypesetText as="h2" locale={locale} text={dictionary.faq.moreTitle} variant="sectionTitle">
            {dictionary.faq.moreTitle}
          </TypesetText>
          <div className="page__hero-actions">
            <Link className="button button--solid" href="/features/persistent-memory/">
              {dictionary.faq.exploreFeatures}
            </Link>
            <Link className="button button--ghost" href="/blog/">
              {dictionary.faq.readBlog}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
