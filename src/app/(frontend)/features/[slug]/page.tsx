import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getFeaturePageView } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Feature 详情页 props
 */
type FeaturePageProps = {
  /** 路由参数 */
  params: Promise<{ slug: string }>
}

/**
 * 生成页面 metadata
 * @param props 路由参数
 * @returns metadata
 */
export async function generateMetadata(props: FeaturePageProps): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await props.params
  const page = await getFeaturePageView(slug, locale)

  if (!page) {
    return {}
  }

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title,
    description: page.metaDescription || page.hero.description || '',
    pathname: `/features/${page.slug}/`,
    image: page.ogImage,
  })
}

/**
 * Feature 详情页
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function FeatureDetailPage(props: FeaturePageProps) {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const { slug } = await props.params
  const page = await getFeaturePageView(slug, locale)

  if (!page) {
    notFound()
  }

  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.features.breadcrumb, pathname: '/' },
    { name: page.hero.title || page.slug, pathname: `/features/${page.slug}/` },
  ], locale)

  return (
    <div className="page page--hero">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero">
        <nav aria-label={dictionary.common.breadcrumb} className="breadcrumbs">
          <Link href="/">{dictionary.common.brandName}</Link>
          <span>/</span>
          <span>{dictionary.features.breadcrumb}</span>
          <span>/</span>
          <span aria-current="page">{page.hero.title || page.slug}</span>
        </nav>
        {page.hero.eyebrow ? <span className="page__eyebrow">{page.hero.eyebrow}</span> : null}
        {page.hero.title ? (
          <h1>
            {page.hero.title}
            {page.hero.highlight ? (
              <>
                {' '}
                <span className="hero-highlight">{page.hero.highlight}</span>
              </>
            ) : null}
          </h1>
        ) : null}
        {page.hero.description ? <p>{page.hero.description}</p> : null}
      </section>

      {page.summarySection ? (
        <PageSections
          sections={[
            {
              ...page.summarySection,
              title: page.summarySection.title || dictionary.features.summaryTitle,
            },
          ]}
        />
      ) : null}

      <PageSections sections={page.sections} />

      {page.relatedFeatures.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.features.relatedEyebrow}</span>
            <h2>{dictionary.features.relatedTitle}</h2>
          </div>
          <div className="cards cards--2">
            {page.relatedFeatures.map((relatedPage) => (
              <article key={relatedPage.slug} className="card">
                <h3>
                  {relatedPage.hero.title}
                  {relatedPage.hero.highlight ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{relatedPage.hero.highlight}</span>
                    </>
                  ) : null}
                </h3>
                {relatedPage.hero.description ? <p>{relatedPage.hero.description}</p> : null}
                <Link className="feature-grid__link" href={`/features/${relatedPage.slug}/`}>
                  {dictionary.features.viewDetail}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {page.ctaSection ? (
        <PageSections
          sections={[
            {
              ...page.ctaSection,
              label: page.ctaSection.label || dictionary.features.ctaEyebrow,
              primaryCta:
                page.ctaSection.primaryCta || { label: dictionary.features.getStarted, href: '/pricing/' },
              secondaryCta:
                page.ctaSection.secondaryCta || { label: dictionary.features.readFaqs, href: '/faqs/' },
            },
          ]}
        />
      ) : null}
    </div>
  )
}
