import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getUseCasePageBySlug, mapContentSections } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Use case 路由参数
 */
type UseCasePageProps = {
  /** 动态参数 */
  params: Promise<{ slug: string }>
}

/**
 * 生成 metadata
 * @param props 路由参数
 * @returns metadata
 */
export async function generateMetadata(props: UseCasePageProps): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await props.params
  const page = await getUseCasePageBySlug(slug, locale)

  if (!page) {
    return {}
  }

  return createPageMetadata({
    locale,
    title: page.metaTitle?.trim() || page.heroTitle,
    description: page.metaDescription?.trim() || page.heroLead || '',
    pathname: `/use-cases/${page.slug}/`,
    image: typeof page.ogImage === 'object' ? page.ogImage : null,
  })
}

/**
 * Use case 页面
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function UseCaseDetailPage(props: UseCasePageProps) {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const { slug } = await props.params
  const page = await getUseCasePageBySlug(slug, locale)

  if (!page) {
    notFound()
  }

  const solutionSections = mapContentSections(page.solutionSections)
  const relatedFeatures = (page.relatedFeatures ?? []).filter(
    (item): item is Exclude<typeof item, number | null> => typeof item === 'object' && Boolean(item),
  )
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.useCases.breadcrumb, pathname: '/' },
    { name: page.heroTitle || page.slug, pathname: `/use-cases/${page.slug}/` },
  ], locale)

  return (
    <div className="page page--hero">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero">
        <nav aria-label={dictionary.common.breadcrumb} className="breadcrumbs">
          <Link href="/">{dictionary.common.brandName}</Link>
          <span>/</span>
          <span>{dictionary.useCases.breadcrumb}</span>
          <span>/</span>
          <span aria-current="page">{page.roleLabel || page.slug}</span>
        </nav>
        {page.roleLabel ? <span className="page__eyebrow">{page.roleLabel}</span> : null}
        {page.heroTitle ? <h1>{page.heroTitle}</h1> : null}
        {page.heroLead ? <p>{page.heroLead}</p> : null}
      </section>

      {(page.painPoints ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.useCases.painPointsEyebrow}</span>
            <h2>{dictionary.useCases.painPointsTitle}</h2>
          </div>
          <div className="cards cards--3">
            {(page.painPoints ?? []).map((painPoint) =>
              painPoint?.title ? (
                <article key={painPoint.id ?? painPoint.title} className="card">
                  <h3>{painPoint.title}</h3>
                  {painPoint.description ? <p>{painPoint.description}</p> : null}
                </article>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {solutionSections.map((section) => (
        <section key={section.title} className="site-shell section">
          <div className="section__header">
            {section.label ? <span className="page__eyebrow">{section.label}</span> : null}
            <h2>{section.title}</h2>
          </div>
          <div className="panel">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {relatedFeatures.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.useCases.relatedEyebrow}</span>
            <h2>{dictionary.useCases.relatedTitle}</h2>
          </div>
          <div className="cards cards--3">
            {relatedFeatures.map((feature) => (
              <article key={feature.slug} className="card">
                <h3>
                  {feature.heroTitle}
                  {feature.heroEmphasis ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{feature.heroEmphasis}</span>
                    </>
                  ) : null}
                </h3>
                {feature.heroLead ? <p>{feature.heroLead}</p> : null}
                <Link className="feature-grid__link" href={`/features/${feature.slug}/`}>
                  {dictionary.useCases.exploreFeature}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
