import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getFeaturePageBySlug, mapContentSections } from '@/lib/site/cms'
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
  const page = await getFeaturePageBySlug(slug, locale)

  if (!page) {
    return {}
  }

  return createPageMetadata({
    locale,
    title: page.metaTitle?.trim() || page.heroTitle,
    description: page.metaDescription?.trim() || page.heroLead || '',
    pathname: `/features/${page.slug}/`,
    image: typeof page.ogImage === 'object' ? page.ogImage : null,
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
  const page = await getFeaturePageBySlug(slug, locale)

  if (!page) {
    notFound()
  }

  const sections = mapContentSections(page.body)
  const relatedPages = (page.relatedFeatures ?? []).filter(
    (item): item is Exclude<typeof item, number | null> => typeof item === 'object' && Boolean(item),
  )
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.features.breadcrumb, pathname: '/' },
    { name: page.heroTitle || page.slug, pathname: `/features/${page.slug}/` },
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
          <span aria-current="page">{page.heroTitle || page.slug}</span>
        </nav>
        {page.heroLabel ? <span className="page__eyebrow">{page.heroLabel}</span> : null}
        {page.heroTitle ? (
          <h1>
            {page.heroTitle}
            {page.heroEmphasis ? (
              <>
                {' '}
                <span className="hero-highlight">{page.heroEmphasis}</span>
              </>
            ) : null}
          </h1>
        ) : null}
        {page.heroLead ? <p>{page.heroLead}</p> : null}
      </section>

      {(page.summaryBullets ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="feature-detail__summary">
            <h2>{dictionary.features.summaryTitle}</h2>
            <ul>
              {(page.summaryBullets ?? []).map((bullet) =>
                bullet?.text ? <li key={bullet.id ?? bullet.text}>{bullet.text}</li> : null,
              )}
            </ul>
          </div>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.title} className="site-shell section">
          <div className="section__header">
            {section.label ? <span className="page__eyebrow">{section.label}</span> : null}
            <h2>{section.title}</h2>
          </div>
          <div className={section.cards?.length ? 'feature-detail__layout' : undefined}>
            <div className="panel">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {(section.bullets ?? []).length > 0 ? (
                <ul>
                  {(section.bullets ?? []).map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            {(section.cards ?? []).length > 0 ? (
              <div className="panel-grid">
                {(section.cards ?? []).map((card) => (
                  <article key={card.title} className="panel">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}

      {relatedPages.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.features.relatedEyebrow}</span>
            <h2>{dictionary.features.relatedTitle}</h2>
          </div>
          <div className="cards cards--2">
            {relatedPages.map((relatedPage) => (
              <article key={relatedPage.slug} className="card">
                <h3>
                  {relatedPage.heroTitle}
                  {relatedPage.heroEmphasis ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{relatedPage.heroEmphasis}</span>
                    </>
                  ) : null}
                </h3>
                {relatedPage.heroLead ? <p>{relatedPage.heroLead}</p> : null}
                <Link className="feature-grid__link" href={`/features/${relatedPage.slug}/`}>
                  {dictionary.features.viewDetail}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {page.ctaTitle || page.ctaDescription ? (
        <section className="site-shell section">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.features.ctaEyebrow}</span>
            {page.ctaTitle ? <h2>{page.ctaTitle}</h2> : null}
            {page.ctaDescription ? <p>{page.ctaDescription}</p> : null}
            <div className="page__hero-actions">
              <Link className="button button--solid" href="/pricing/">
                {dictionary.features.getStarted}
              </Link>
              <Link className="button button--ghost" href="/faqs/">
                {dictionary.features.readFaqs}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
