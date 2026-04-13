import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { TypesetText } from '@/components/site/TypesetText'
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
    <div className="page page--hero page--fullscreen">
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
      </section>

      {page.painPointsSection ? (
        <PageSections
          fullScreen
          locale={locale}
          sections={[
            {
              ...page.painPointsSection,
              label: page.painPointsSection.label || dictionary.useCases.painPointsEyebrow,
              title: page.painPointsSection.title || dictionary.useCases.painPointsTitle,
            },
          ]}
        />
      ) : null}

      <PageSections fullScreen locale={locale} sections={page.sections} />

      {page.relatedFeatures.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.useCases.relatedEyebrow}</span>
            <TypesetText as="h2" locale={locale} text={dictionary.useCases.relatedTitle} variant="sectionTitle">
              {dictionary.useCases.relatedTitle}
            </TypesetText>
          </div>
          <div className="cards cards--3">
            {page.relatedFeatures.map((feature) => (
              <article key={feature.slug} className="card">
                <TypesetText
                  as="h3"
                  locale={locale}
                  text={`${feature.hero.title}${feature.hero.highlight ? ` ${feature.hero.highlight}` : ''}`}
                  variant="cardTitle"
                >
                  {feature.hero.title}
                  {feature.hero.highlight ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{feature.hero.highlight}</span>
                    </>
                  ) : null}
                </TypesetText>
                {feature.hero.description ? (
                  <TypesetText as="p" locale={locale} text={feature.hero.description} variant="body">
                    {feature.hero.description}
                  </TypesetText>
                ) : null}
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
