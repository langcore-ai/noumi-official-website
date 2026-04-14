import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { TypesetText } from '@/components/site/TypesetText'
import { hasRenderableHeroContent } from '@/lib/site/hero'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getPrivacyPageView } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Privacy 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getPrivacyPageView(locale)

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title || dictionary.legal.privacyMetadataTitle,
    description: page.metaDescription || page.hero.description || dictionary.legal.privacyMetadataDescription,
    pathname: '/privacy/',
    image: page.ogImage,
  })
}

/**
 * Privacy 页面
 * @returns 法律文档页面
 */
export default async function PrivacyPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getPrivacyPageView(locale)
  const hasHero = hasRenderableHeroContent(page.hero)
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.legal.privacyTitle, pathname: '/privacy/' },
  ], locale)

  return (
    <div className="page legal-page">
      <StructuredData data={breadcrumbJsonLd} />

      {hasHero ? (
        <section className="site-shell page__hero article">
          {page.hero.eyebrow ? <span className="page__eyebrow">{page.hero.eyebrow}</span> : null}
          {page.hero.title ? (
            <TypesetText as="h1" locale={locale} text={page.hero.title} variant="pageTitle">
              {page.hero.title}
            </TypesetText>
          ) : null}
          {page.hero.description ? (
            <TypesetText as="p" locale={locale} text={page.hero.description} variant="heroBody">
              {page.hero.description}
            </TypesetText>
          ) : null}
        </section>
      ) : null}

      <PageSections locale={locale} sections={page.sections} />
    </div>
  )
}
