import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
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
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.legal.privacyTitle, pathname: '/privacy/' },
  ], locale)

  return (
    <div className="page legal-page">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero article">
        <span className="page__eyebrow">{page.hero.eyebrow || dictionary.legal.eyebrow}</span>
        <h1>{page.hero.title || dictionary.legal.privacyTitle}</h1>
        {page.hero.description ? <p>{page.hero.description}</p> : null}
      </section>

      <PageSections sections={page.sections} />
    </div>
  )
}
