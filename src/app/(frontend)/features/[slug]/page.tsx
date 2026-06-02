import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { getOfficialFeaturePage } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './feature-page.module.css'

/**
 * Feature 子页 props
 */
type FeaturePageProps = {
  /** 路由参数 */
  params: Promise<{ slug: string }>
}

/**
 * 生成 Feature 子页 metadata
 * @param props 路由参数
 * @returns metadata
 */
export async function generateMetadata(props: FeaturePageProps) {
  const { slug } = await props.params
  const page = await getOfficialFeaturePage(slug)

  if (!page) {
    return {}
  }

  return createOfficialMetadata({
    title: page.metaTitle || page.heroTitle || page.navigationLabel,
    description: page.metaDescription || page.heroDescription || page.summary || '',
    image: page.ogImage?.url,
    pathname: `/features/${page.slug}`,
  })
}

/**
 * Feature 子页
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function FeatureDetailPage(props: FeaturePageProps) {
  const { slug } = await props.params
  const page = await getOfficialFeaturePage(slug)

  if (!page) {
    notFound()
  }

  if (page.renderMode === 'html') {
    return (
      <div className="page-body">
        <OfficialRawHtml html={page.htmlContent || ''} />
      </div>
    )
  }

  return (
    <div className={`${styles.featurePage} page-body`}>
      <main>
        <section aria-labelledby={`${page.slug}-h1`} className={styles.hero}>
          <div className={`${styles.heroCopy} reveal`}>
            <Link className={styles.backLink} href="/features">
              ← Back to Features
            </Link>
            {page.heroEyebrow ? <span className="sec-label">{page.heroEyebrow}</span> : null}
            {page.heroTitle ? <h1 id={`${page.slug}-h1`}>{page.heroTitle}</h1> : null}
            {page.heroDescription ? (
              <p className={styles.heroDescription}>{page.heroDescription}</p>
            ) : null}
            {page.summary ? <p className={styles.summary}>{page.summary}</p> : null}
            {page.heroPrimaryCta ? (
              <Link className="btn-fill" href={page.heroPrimaryCta.href}>
                {page.heroPrimaryCta.label}
              </Link>
            ) : null}
          </div>

          <div aria-hidden="true" className={`${styles.heroVisual} reveal d2`}>
            <div className={styles.visualCard}>
              <span className={styles.visualLabel}>Noumi Feature</span>
              <h2>{page.navigationLabel}</h2>
              <div className={styles.visualLines}>
                {(page.sections.length > 0
                  ? page.sections.slice(0, 3).map((section) => section.title)
                  : [page.heroDescription, page.summary, page.ctaTitle]
                )
                  .filter((item): item is string => Boolean(item))
                  .map((item) => (
                    <span key={item}>{item}</span>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {page.sections.length > 0 ? (
          <section aria-label={`${page.navigationLabel} details`} className={styles.sections}>
            {page.sections.map((section, index) => (
              <article
                className={`${styles.sectionCard} reveal d${Math.min(index + 1, 4)}`}
                key={section.id}
              >
                {section.label ? <span className="sec-label">{section.label}</span> : null}
                <h2>{section.title}</h2>
                {section.description ? <p>{section.description}</p> : null}
                {section.bullets.length > 0 ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}

        {page.ctaButton && page.ctaTitle ? (
          <section aria-labelledby={`${page.slug}-cta`} className="cta-band official-cta-band">
            <h2 className="reveal" id={`${page.slug}-cta`}>
              {page.ctaTitle}
            </h2>
            {page.ctaDescription ? <p className="reveal d1">{page.ctaDescription}</p> : null}
            <Link className="btn-cream official-cta-button reveal d2" href={page.ctaButton.href}>
              {page.ctaButton.label}
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  )
}
