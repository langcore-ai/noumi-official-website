import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialTermsPage } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * Terms 页面 metadata
 */
export async function generateMetadata() {
  const page = await getOfficialTermsPage()

  return createOfficialMetadata({
    title: page.metaTitle || page.heroTitle || 'Terms of Service',
    description: page.metaDescription || page.heroDescription || 'Terms of Service',
    image: page.ogImage?.url,
    pathname: '/terms',
  })
}

/**
 * Terms 页面
 * @returns 法律文档页面
 */
export default async function TermsPage() {
  const page = await getOfficialTermsPage()

  if (page.renderMode === 'html') {
    return (
      <div className="page-body">
        <OfficialRawHtml html={page.htmlContent || ''} />
      </div>
    )
  }

  return (
    <div className="page-body">
      <header className="legal-header">
        <h1>{page.heroTitle || 'Terms of Service'}</h1>
        {page.heroDescription ? <p className="legal-meta">{page.heroDescription}</p> : null}
      </header>
      <OfficialContentSections sections={page.sections} />
    </div>
  )
}
