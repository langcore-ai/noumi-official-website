import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getTermsPageView } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Terms 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getTermsPageView(locale)

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title || dictionary.legal.termsMetadataTitle,
    description: page.metaDescription || page.hero.description || dictionary.legal.termsMetadataDescription,
    pathname: '/terms/',
    image: page.ogImage,
  })
}

/**
 * Terms 页面
 * @returns 法律文档页面
 */
export default async function TermsPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getTermsPageView(locale)
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.legal.termsTitle, pathname: '/terms/' },
  ], locale)

  return (
    <div className="page legal-page">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero article">
        <span className="page__eyebrow">{page.hero.eyebrow || dictionary.legal.eyebrow}</span>
        <h1>{page.hero.title || dictionary.legal.termsTitle}</h1>
        {page.hero.description ? <p>{page.hero.description}</p> : null}
      </section>

      <PageSections sections={page.sections} />
    </div>
  )
}
