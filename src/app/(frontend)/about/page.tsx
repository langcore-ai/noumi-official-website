import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { TypesetText } from '@/components/site/TypesetText'
import { hasRenderableHeroContent } from '@/lib/site/hero'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getAboutPageView } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createOrganizationJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * About 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getAboutPageView(locale)

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title || dictionary.about.metadataTitle,
    description: page.metaDescription || page.hero.description || dictionary.about.metadataDescription,
    pathname: '/about/',
    image: page.ogImage,
  })
}

/**
 * About 页面
 * @returns About 内容
 */
export default async function AboutPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getAboutPageView(locale)
  const hasHero = hasRenderableHeroContent(page.hero)
  const [breadcrumbJsonLd, organizationJsonLd] = await Promise.all([
    createBreadcrumbJsonLd([
      { name: dictionary.common.brandName, pathname: '/' },
      { name: dictionary.about.breadcrumb, pathname: '/about/' },
    ], locale),
    createOrganizationJsonLd(locale),
  ])

  return (
    <div className="page page--fullscreen">
      <StructuredData data={breadcrumbJsonLd} />
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}

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

      {!page.sections.some((section) => section.type === 'cta') ? (
        <section className="site-shell section section--screen">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.about.contactEyebrow}</span>
            <div className="page__hero-actions">
              <Link className="button button--ghost" href="/pricing/">
                {dictionary.about.viewPricing}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
