import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getUseCasePageView } from '@/lib/site/cms'
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
  const page = await getUseCasePageView(slug, locale)

  if (!page) {
    return {}
  }

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title,
    description: page.metaDescription || page.hero.description || '',
    pathname: `/use-cases/${page.slug}/`,
    image: page.ogImage,
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
  const page = await getUseCasePageView(slug, locale)

  if (!page) {
    notFound()
  }

  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.useCases.breadcrumb, pathname: '/' },
    { name: page.hero.title || page.slug, pathname: `/use-cases/${page.slug}/` },
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
          <span aria-current="page">{page.hero.eyebrow || page.slug}</span>
        </nav>
        {page.hero.eyebrow ? <span className="page__eyebrow">{page.hero.eyebrow}</span> : null}
        {page.hero.title ? <h1>{page.hero.title}</h1> : null}
        {page.hero.description ? <p>{page.hero.description}</p> : null}
      </section>

      {page.painPointsSection ? (
        <PageSections
          sections={[
            {
              ...page.painPointsSection,
              label: page.painPointsSection.label || dictionary.useCases.painPointsEyebrow,
              title: page.painPointsSection.title || dictionary.useCases.painPointsTitle,
            },
          ]}
        />
      ) : null}

      <PageSections sections={page.sections} />

      {page.relatedFeatures.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.useCases.relatedEyebrow}</span>
            <h2>{dictionary.useCases.relatedTitle}</h2>
          </div>
          <div className="cards cards--3">
            {page.relatedFeatures.map((feature) => (
              <article key={feature.slug} className="card">
                <h3>
                  {feature.hero.title}
                  {feature.hero.highlight ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{feature.hero.highlight}</span>
                    </>
                  ) : null}
                </h3>
                {feature.hero.description ? <p>{feature.hero.description}</p> : null}
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
