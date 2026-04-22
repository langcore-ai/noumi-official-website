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
    pathname: `/use-cases/${page.slug}/`,
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
    <div className="page-body">
      <OfficialUseCaseHeader activeSlug={page.slug} useCases={useCases} />

      <style>{`
        .role-hero { max-width: var(--max-w); margin: 0 auto; padding: 72px 48px 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .role-hero-text h1 { font-family: var(--ff-display); font-size: clamp(38px, 5vw, 64px); font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 20px; }
        .role-hero-text .role-advantage { font-size: 17px; font-weight: 300; color: var(--ink-soft); line-height: 1.75; margin-bottom: 32px; }
        .pain-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 36px; }
        .pain-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14.5px; color: var(--ink-soft); font-weight: 300; line-height: 1.55; }
        .pain-list li::before { content: '·'; font-size: 22px; color: var(--ink-muted); flex-shrink: 0; line-height: 1.2; }
        .role-hero-visual { position: relative; overflow: visible; padding-top: 24px; }
        .rh-window { background: #FDFAF4; border: 1px solid rgba(28,27,46,0.10); border-radius: 14px; padding: 20px 22px; position: relative; }
        .rh-window-back { z-index: 1; transform: rotate(-2.5deg); transform-origin: center top; box-shadow: 0 6px 22px rgba(28,27,46,0.07); margin-bottom: -68px; transition: transform 0.44s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.3s ease; }
        .rh-window-front { z-index: 2; transform: rotate(1.2deg); transform-origin: center top; box-shadow: 0 20px 56px rgba(28,27,46,0.13); transition: transform 0.44s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.3s ease; }
        .role-hero-visual:hover .rh-window-back { transform: rotate(-5.5deg) translate(-22px,-14px); z-index: 3; }
        .role-hero-visual:hover .rh-window-front { transform: rotate(3deg) translate(16px,14px); }
        .rhw-label { font-size: 9.5px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.13em; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
        .rhw-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .rhw-item-raw { font-size: 11px; color: var(--ink-muted); padding: 7px 11px; background: rgba(28,27,46,0.03); border: 1px solid var(--border); border-radius: 7px; margin-bottom: 7px; line-height: 1.5; }
        .workflow-section { background: var(--cream-mid); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 48px 0; }
        .workflow-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 48px; }
        .workflow-title { text-align: center; margin-bottom: 28px; }
        .workflow-title h2 { font-family: var(--ff-display); font-size: clamp(24px, 3vw, 38px); font-weight: 700; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 8px; }
        .workflow-title p { font-size: 15px; font-weight: 300; color: var(--ink-muted); }
        .testimonials { padding: 80px 0 72px; border-top: 1px solid var(--border); }
        .testimonials-inner { max-width: var(--max-w); margin: 0 auto; padding: 0 48px; }
        .testimonials-head { text-align: center; margin-bottom: 48px; }
        .testimonials-head .sec-label { display: block; margin-bottom: 10px; }
        .testimonials-head h2 { font-family: var(--ff-display); font-size: clamp(24px, 3vw, 38px); font-weight: 700; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 10px; }
        .testimonials-head p { font-size: 15px; font-weight: 300; color: var(--ink-muted); }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .tcard { background: var(--cream); border: 1px solid var(--border-med); border-radius: 16px; padding: 26px 22px 22px; display: flex; flex-direction: column; gap: 16px; }
        .tcard-stars { display: flex; gap: 2px; font-size: 14px; color: #F59E0B; line-height: 1; }
        .tcard-quote { font-size: 14px; font-weight: 300; color: var(--ink-soft); line-height: 1.72; flex: 1; }
        .tcard-author { display: flex; align-items: center; gap: 11px; padding-top: 14px; border-top: 1px solid var(--border); }
        .tcard-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; overflow: hidden; background: var(--cream-mid); }
        .tcard-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .tcard-name { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.35; }
        .tcard-role { font-size: 11.5px; color: var(--ink-muted); line-height: 1.3; }
        .official-workflow-markdown .markdown-content p, .official-workflow-markdown .markdown-content li, .official-workflow-markdown .markdown-content td { font-size: 12px; color: var(--ink-soft); line-height: 1.7; font-weight: 300; }
        .official-workflow-markdown .markdown-content h2, .official-workflow-markdown .markdown-content h3 { font-family: var(--ff-display); font-size: 16px; color: var(--ink); margin: 0 0 8px; }
        .official-section-title { font-family: var(--ff-display); color: var(--ink); }
        .official-richtext-panel p, .official-richtext-panel li, .markdown-content p, .markdown-content li, .markdown-content td { font-size: 15.5px; color: var(--ink-soft); line-height: 1.8; font-weight: 300; }
        @media (max-width: 960px) { .role-hero { grid-template-columns: 1fr; gap: 48px; padding: 56px 24px 48px; } .workflow-inner, .testimonials-inner { padding: 0 24px; } .testimonials-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section aria-labelledby={`${page.slug}-h1`} className="role-hero">
        <div className="role-hero-text reveal">
          {page.heroEyebrow ? <span className="sec-label">{page.heroEyebrow}</span> : null}
          {page.heroTitle ? <h1 id={`${page.slug}-h1`}>{page.heroTitle}</h1> : null}
          {page.heroDescription ? <p className="role-advantage">{page.heroDescription}</p> : null}
          {page.painPoints.length > 0 ? (
            <ul className="pain-list">
              {page.painPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          {page.heroPrimaryCta ? <a className="btn-fill" href={page.heroPrimaryCta.href}>{page.heroPrimaryCta.label}</a> : null}
        </div>
        <div aria-label={`${page.navigationLabel} preview`} className="role-hero-visual reveal d2" role="img">
          <div className="rh-window rh-window-back">
            <div className="rhw-label">Captured context</div>
            {page.painPoints.slice(0, 3).map((point) => (
              <div className="rhw-item-raw" key={point}>{point}</div>
            ))}
          </div>
          <div className="rh-window rh-window-front">
            <div className="rhw-label">Noumi workspace</div>
            <div className="rhw-item-raw">{page.heroLead || page.workflowDescription || page.heroDescription || ''}</div>
            {page.workflowSteps.slice(0, 2).map((step) => (
              <div className="rhw-item-raw" key={step.title}>{step.title}</div>
            ))}
          </div>
        </div>
      </section>

      {page.workflowSteps.length > 0 ? (
        <section aria-labelledby={`${page.slug}-workflow-h2`} className="workflow-section">
          <div className="workflow-inner">
            <div className="workflow-title reveal">
              {page.workflowEyebrow ? <span className="sec-label">{page.workflowEyebrow}</span> : null}
              {page.workflowTitle ? <h2 id={`${page.slug}-workflow-h2`}>{page.workflowTitle}</h2> : null}
              {page.workflowDescription ? <p>{page.workflowDescription}</p> : null}
            </div>
            <OfficialUseCaseWorkflow steps={page.workflowSteps} />
          </div>
        </section>
      ) : null}

      {page.testimonials.length > 0 ? (
        <section aria-labelledby={`${page.slug}-testimonials-h`} className="testimonials">
          <div className="testimonials-inner">
            <div className="testimonials-head reveal">
              {page.testimonialsEyebrow ? <span className="sec-label">{page.testimonialsEyebrow}</span> : null}
              {page.testimonialsTitle ? <h2 id={`${page.slug}-testimonials-h`}>{page.testimonialsTitle}</h2> : null}
              {page.testimonialsDescription ? <p>{page.testimonialsDescription}</p> : null}
            </div>
            <div className="testimonials-grid">
              {page.testimonials.map((item) => (
                <article className="tcard" key={`${item.name}-${item.role}`}>
                  <div className="tcard-stars">★★★★★</div>
                  <p className="tcard-quote">{item.quote}</p>
                  <div className="tcard-author">
                    <div className="tcard-avatar">
                      {item.avatar?.url ? <img alt={item.name} src={item.avatar.url} /> : null}
                    </div>
                    <div>
                      <div className="tcard-name">{item.name}</div>
                      <div className="tcard-role">{item.role}</div>
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
