import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getFaqItems, getPricingPage } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Pricing 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)

  return createPageMetadata({
    locale,
    title: dictionary.pricing.metadataTitle,
    description: dictionary.pricing.metadataDescription,
    pathname: '/pricing/',
  })
}

/**
 * Pricing 页面
 * @returns Pricing 内容
 */
export default async function PricingPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const [page, faqItems] = await Promise.all([getPricingPage(locale), getFaqItems(['pricing'], locale)])
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.pricing.breadcrumb, pathname: '/pricing/' },
  ], locale)

  return (
    <div className="page">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero">
        <span className="page__eyebrow">{dictionary.pricing.eyebrow}</span>
        <h1>{dictionary.pricing.title}</h1>
        {page.intro ? <p>{page.intro}</p> : null}
      </section>

      {(page.plans ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="cards cards--3">
            {(page.plans ?? []).map((plan) =>
              plan?.title ? (
                <article key={plan.id ?? plan.title} className="card">
                  <h3>{plan.title}</h3>
                  {plan.description ? <p>{plan.description}</p> : null}
                  {(plan.highlights ?? []).length > 0 ? (
                    <ul>
                      {(plan.highlights ?? []).map((highlight) =>
                        highlight?.text ? (
                          <li key={highlight.id ?? highlight.text}>{highlight.text}</li>
                        ) : null,
                      )}
                    </ul>
                  ) : null}
                </article>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {page.note || faqItems.length > 0 ? (
        <section className="site-shell section">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.pricing.noteEyebrow}</span>
            <h2>{dictionary.pricing.noteTitle}</h2>
            {page.note ? <p>{page.note}</p> : null}
            <div className="page__hero-actions">
              <Link className="button button--solid" href="/faqs/">
                {dictionary.pricing.readFaqs}
              </Link>
              <Link className="button button--ghost" href="/about/">
                {dictionary.pricing.aboutNoumi}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
