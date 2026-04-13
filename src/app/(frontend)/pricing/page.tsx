import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getFaqItems, getPricingPageView } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Pricing 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getPricingPageView(locale)

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title || dictionary.pricing.metadataTitle,
    description: page.metaDescription || page.hero.description || dictionary.pricing.metadataDescription,
    pathname: '/pricing/',
    image: page.ogImage,
  })
}

/**
 * Pricing 页面
 * @returns Pricing 内容
 */
export default async function PricingPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const [page, faqItems] = await Promise.all([
    getPricingPageView(locale),
    getFaqItems(['pricing'], locale),
  ])
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.pricing.breadcrumb, pathname: '/pricing/' },
  ], locale)

  return (
    <div className="page">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero">
        <span className="page__eyebrow">{page.hero.eyebrow || dictionary.pricing.eyebrow}</span>
        <h1>{page.hero.title || dictionary.pricing.title}</h1>
        {page.hero.description ? <p>{page.hero.description}</p> : null}
        {page.hero.supportingText ? <p className="page__hero-support">{page.hero.supportingText}</p> : null}
      </section>

      <PageSections sections={page.sections} />

      {!page.sections.some((section) => section.type === 'cta') && faqItems.length > 0 ? (
        <section className="site-shell section">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.pricing.noteEyebrow}</span>
            <h2>{dictionary.pricing.noteTitle}</h2>
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
