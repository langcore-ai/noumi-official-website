import { notFound } from 'next/navigation'

import { OfficialContentSections } from '@/components/site/official/OfficialContentSections'
import {
  OfficialHomeFooter,
  OfficialUseCaseHeader,
} from '@/components/site/official/OfficialHomeChrome'
import { OfficialRawHtml } from '@/components/site/official/OfficialRawHtml'
import { OfficialUseCaseWorkflow } from '@/components/site/official/OfficialUseCaseWorkflow'
import { getOfficialUseCaseNavItems, getOfficialUseCasePage } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './use-case.module.css'

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
export async function generateMetadata(props: UseCasePageProps) {
  const { slug } = await props.params
  const page = await getOfficialUseCasePage(slug)

  if (!page) {
    return {}
  }

  return createOfficialMetadata({
    title: page.metaTitle || page.heroTitle || page.navigationLabel,
    description: page.metaDescription || page.heroDescription || '',
    image: page.ogImage?.url,
    pathname: `/use-cases/${page.slug}`,
  })
}

/**
 * Use case 页面
 * @param props 路由参数
 * @returns 页面内容
 */
export default async function UseCaseDetailPage(props: UseCasePageProps) {
  const { slug } = await props.params
  const [page, useCases] = await Promise.all([
    getOfficialUseCasePage(slug),
    getOfficialUseCaseNavItems(),
  ])

  if (!page) {
    notFound()
  }

  if (page.renderMode === 'html') {
    return (
      <div className="page-body">
        <OfficialUseCaseHeader activeSlug={page.slug} useCases={useCases} />
        <OfficialRawHtml html={page.htmlContent || ''} />
        <OfficialHomeFooter useCases={useCases} />
      </div>
    )
  }

  return (
    <div className={`${styles.useCasePage} page-body`}>
      <OfficialUseCaseHeader activeSlug={page.slug} useCases={useCases} />

      <section aria-labelledby={`${page.slug}-h1`} className={styles.roleHero}>
        <div className={`${styles.roleHeroText} reveal`}>
          {page.heroEyebrow ? <span className="sec-label">{page.heroEyebrow}</span> : null}
          {page.heroTitle ? <h1 id={`${page.slug}-h1`}>{page.heroTitle}</h1> : null}
          {page.heroDescription ? <p className={styles.roleAdvantage}>{page.heroDescription}</p> : null}
          {page.painPoints.length > 0 ? (
            <ul className={styles.painList}>
              {page.painPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          {page.heroPrimaryCta ? <a className="btn-fill" href={page.heroPrimaryCta.href}>{page.heroPrimaryCta.label}</a> : null}
        </div>
        <div aria-label={`${page.navigationLabel} preview`} className={`${styles.roleHeroVisual} reveal d2`} role="img">
          <div className={`${styles.roleWindow} ${styles.windowBack}`}>
            <div className={styles.windowLabel}>Captured context</div>
            {page.painPoints.slice(0, 3).map((point) => (
              <div className={styles.rawItem} key={point}>{point}</div>
            ))}
          </div>
          <div className={`${styles.roleWindow} ${styles.windowFront}`}>
            <div className={styles.windowLabel}>Noumi workspace</div>
            <div className={styles.rawItem}>{page.heroLead || page.workflowDescription || page.heroDescription || ''}</div>
            {page.workflowSteps.slice(0, 2).map((step) => (
              <div className={styles.rawItem} key={step.title}>{step.title}</div>
            ))}
          </div>
        </div>
      </section>

      {page.workflowSteps.length > 0 ? (
        <section aria-labelledby={`${page.slug}-workflow-h2`} className={styles.workflowSection}>
          <div className={styles.workflowInner}>
            <div className={`${styles.workflowTitle} reveal`}>
              {page.workflowEyebrow ? <span className="sec-label">{page.workflowEyebrow}</span> : null}
              {page.workflowTitle ? <h2 id={`${page.slug}-workflow-h2`}>{page.workflowTitle}</h2> : null}
              {page.workflowDescription ? <p>{page.workflowDescription}</p> : null}
            </div>
            <OfficialUseCaseWorkflow steps={page.workflowSteps} />
          </div>
        </section>
      ) : null}

      {page.testimonials.length > 0 ? (
        <section aria-labelledby={`${page.slug}-testimonials-h`} className={styles.testimonials}>
          <div className={styles.testimonialsInner}>
            <div className={`${styles.testimonialsHead} reveal`}>
              {page.testimonialsEyebrow ? <span className="sec-label">{page.testimonialsEyebrow}</span> : null}
              {page.testimonialsTitle ? <h2 id={`${page.slug}-testimonials-h`}>{page.testimonialsTitle}</h2> : null}
              {page.testimonialsDescription ? <p>{page.testimonialsDescription}</p> : null}
            </div>
            <div className={styles.testimonialsGrid}>
              {page.testimonials.map((item) => (
                <article className={styles.testimonialCard} key={`${item.name}-${item.role}`}>
                  <div className={styles.stars}>★★★★★</div>
                  <p className={styles.quote}>{item.quote}</p>
                  <div className={styles.author}>
                    <div className={styles.avatar}>
                      {item.avatar?.url ? <img alt={item.name} src={item.avatar.url} /> : null}
                    </div>
                    <div>
                      <div className={styles.name}>{item.name}</div>
                      <div className={styles.role}>{item.role}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <OfficialContentSections sections={page.sections} />

      {page.ctaButton && page.ctaTitle ? (
        <section aria-labelledby={`${page.slug}-cta`} className="cta-band">
          {page.ctaEyebrow ? <span className="sec-label reveal">{page.ctaEyebrow}</span> : null}
          <h2 className="reveal" id={`${page.slug}-cta`}>{page.ctaTitle}</h2>
          {page.ctaDescription ? <p className="reveal d1">{page.ctaDescription}</p> : null}
          <a className="btn-cream reveal d2" href={page.ctaButton.href}>{page.ctaButton.label}</a>
        </section>
      ) : null}

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
