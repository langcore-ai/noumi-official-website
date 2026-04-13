import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
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
  const [breadcrumbJsonLd, organizationJsonLd] = await Promise.all([
    createBreadcrumbJsonLd([
      { name: dictionary.common.brandName, pathname: '/' },
      { name: dictionary.about.breadcrumb, pathname: '/about/' },
    ], locale),
    createOrganizationJsonLd(locale),
  ])

  return (
    <div className="page">
      <StructuredData data={breadcrumbJsonLd} />
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}

      <section className="site-shell page__hero">
        <span className="page__eyebrow">{page.hero.eyebrow || dictionary.about.eyebrow}</span>
        <h1>{page.hero.title || dictionary.about.title}</h1>
        {page.hero.description ? <p>{page.hero.description}</p> : null}
        {page.hero.supportingText ? <p className="page__hero-support">{page.hero.supportingText}</p> : null}
      </section>

      <PageSections sections={page.sections} />

      {!page.sections.some((section) => section.type === 'cta') ? (
        <section className="site-shell section">
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
