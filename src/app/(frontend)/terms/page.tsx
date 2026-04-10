import { MarkdownContent } from '@/components/site/MarkdownContent'
import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getLegalPages } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * Terms 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)

  return createPageMetadata({
    locale,
    title: dictionary.legal.termsMetadataTitle,
    description: dictionary.legal.termsMetadataDescription,
    pathname: '/terms/',
  })
}

/**
 * Terms 页面
 * @returns 法律文档页面
 */
export default async function TermsPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const legalPages = await getLegalPages(locale)
  const markdown = legalPages.termsOfServiceMarkdown?.trim() || ''
  const breadcrumbJsonLd = await createBreadcrumbJsonLd([
    { name: dictionary.common.brandName, pathname: '/' },
    { name: dictionary.legal.termsTitle, pathname: '/terms/' },
  ], locale)

  return (
    <div className="page legal-page">
      <StructuredData data={breadcrumbJsonLd} />

      <section className="site-shell page__hero article">
        <span className="page__eyebrow">{dictionary.legal.eyebrow}</span>
        <h1>{dictionary.legal.termsTitle}</h1>
      </section>

      {markdown ? (
        <section className="site-shell section article">
          <div className="panel">
            <MarkdownContent markdown={markdown} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
