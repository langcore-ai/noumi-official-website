import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialPrivacyPage } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * Privacy 页面 metadata
 */
export async function generateMetadata() {
  const page = await getOfficialPrivacyPage()

  return createOfficialMetadata({
    title: page.metaTitle || page.heroTitle || 'Privacy Policy',
    description: page.metaDescription || page.heroDescription || 'Privacy Policy',
    image: page.ogImage?.url,
    pathname: '/privacy',
  })
}

/**
 * Privacy 页面
 * @returns 法律文档页面
 */
export default async function PrivacyPage() {
  const page = await getOfficialPrivacyPage()

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
        <h1>{page.heroTitle || 'Privacy Policy'}</h1>
        {page.heroDescription ? <p className="legal-meta">{page.heroDescription}</p> : null}
      </header>
      <OfficialContentSections sections={page.sections} />
    </div>
  )
}
