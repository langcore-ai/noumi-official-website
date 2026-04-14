import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { TypesetText } from '@/components/site/TypesetText'
import { hasRenderableHeroContent } from '@/lib/site/hero'
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
  const hasHero = hasRenderableHeroContent(page.hero)
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.pricing.breadcrumb, pathname: '/pricing/' },
  ], locale)

  return (
    <div className="page page--fullscreen">
      <StructuredData data={breadcrumbJsonLd} />

      {hasHero ? (
        <section className="site-shell page__hero">
          {page.hero.eyebrow ? <span className="page__eyebrow">{page.hero.eyebrow}</span> : null}
          {page.hero.title ? (
            <TypesetText as="h1" locale={locale} text={page.hero.title} variant="heroTitle">
              {page.hero.title}
            </TypesetText>
          ) : null}
          {page.hero.description ? (
            <TypesetText as="p" locale={locale} text={page.hero.description} variant="heroBody">
              {page.hero.description}
            </TypesetText>
          ) : null}
          {page.hero.supportingText ? (
            <TypesetText
              as="p"
              className="page__hero-support"
              locale={locale}
              text={page.hero.supportingText}
              variant="heroBody"
            >
              {page.hero.supportingText}
            </TypesetText>
          ) : null}
        </section>
      ) : null}

      <PageSections fullScreen locale={locale} sections={page.sections} />

      {!page.sections.some((section) => section.type === 'cta') && faqItems.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.pricing.noteEyebrow}</span>
            <TypesetText as="h2" locale={locale} text={dictionary.pricing.noteTitle} variant="sectionTitle">
              {dictionary.pricing.noteTitle}
            </TypesetText>
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
