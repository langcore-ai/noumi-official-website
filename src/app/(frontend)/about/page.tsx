import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getAboutPage } from '@/lib/site/cms'
import { createBreadcrumbJsonLd, createOrganizationJsonLd, createPageMetadata } from '@/lib/site/seo'

/**
 * About 页面 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)

  return createPageMetadata({
    locale,
    title: dictionary.about.metadataTitle,
    description: dictionary.about.metadataDescription,
    pathname: '/about/',
  })
}

/**
 * About 页面
 * @returns About 内容
 */
export default async function AboutPage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const page = await getAboutPage(locale)
  const [breadcrumbJsonLd, organizationJsonLd] = await Promise.all([
    createBreadcrumbJsonLd([
      { name: dictionary.common.brandName, pathname: '/' },
      { name: dictionary.about.breadcrumb, pathname: '/about/' },
    ], locale),
    createOrganizationJsonLd(locale),
  ])

  return (
    <div className="page">
      <StructuredData data={breadcrumbJsonLd} />
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}

      <section className="site-shell page__hero">
        <span className="page__eyebrow">{dictionary.about.eyebrow}</span>
        <h1>{dictionary.about.title}</h1>
        {page.intro ? <p>{page.intro}</p> : null}
      </section>

      {(page.missionParagraphs ?? []).length > 0 || (page.storyParagraphs ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="cards cards--2">
            {(page.missionParagraphs ?? []).length > 0 ? (
              <article className="card">
                <h3>{dictionary.about.missionTitle}</h3>
                {(page.missionParagraphs ?? []).map((paragraph) =>
                  paragraph?.text ? <p key={paragraph.id ?? paragraph.text}>{paragraph.text}</p> : null,
                )}
              </article>
            ) : null}
            {(page.storyParagraphs ?? []).length > 0 ? (
              <article className="card">
                <h3>{dictionary.about.storyTitle}</h3>
                {(page.storyParagraphs ?? []).map((paragraph) =>
                  paragraph?.text ? <p key={paragraph.id ?? paragraph.text}>{paragraph.text}</p> : null,
                )}
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      {(page.stats ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.about.statsEyebrow}</span>
            <h2>{dictionary.about.statsTitle}</h2>
          </div>
          <div className="stats">
            {(page.stats ?? []).map((stat) =>
              stat?.label && stat.value ? (
                <article key={stat.id ?? stat.label} className="stat">
                  <div className="stat__value">{stat.value}</div>
                  <div className="stat__label">{stat.label}</div>
                </article>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      {(page.recognition ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.about.recognitionEyebrow}</span>
            <h2>{dictionary.about.recognitionTitle}</h2>
          </div>
          <div className="panel">
            <ul>
              {(page.recognition ?? []).map((item) =>
                item?.item ? <li key={item.id ?? item.item}>{item.item}</li> : null,
              )}
            </ul>
          </div>
        </section>
      ) : null}

      {page.contactTitle || page.contactBody || page.contactEmail ? (
        <section className="site-shell section">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.about.contactEyebrow}</span>
            {page.contactTitle ? <h2>{page.contactTitle}</h2> : null}
            {page.contactBody ? <p>{page.contactBody}</p> : null}
            <div className="page__hero-actions">
              {page.contactEmail ? (
                <a className="button button--solid" href={`mailto:${page.contactEmail}`}>
                  {page.contactEmail}
                </a>
              ) : null}
              <Link className="button button--ghost" href="/pricing/">
                {dictionary.about.viewPricing}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
