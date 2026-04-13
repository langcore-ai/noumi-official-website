import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import {
  type CmsPageSectionView,
  getAboutPageView,
  getFaqItems,
  getFeaturePages,
  getHomePage,
  getUseCasePages,
} from '@/lib/site/cms'
import { createFaqJsonLd, createOrganizationJsonLd, createPageMetadata } from '@/lib/site/seo'

/** 首页固定槽位 key 列表 */
const HOME_FIXED_SECTION_SLOT_KEYS = [
  'home-problems',
  'home-feature-intro',
  'home-how-it-works',
  'home-final-cta',
] as const

/**
 * 提取首页中未被固定版位消费的通用分节
 * @param sections 首页完整分节列表
 * @returns 可交给通用分节组件渲染的剩余分节
 */
function getHomeAdditionalSections(sections: CmsPageSectionView[]): CmsPageSectionView[] {
  return sections.filter((section) => {
    // 没有槽位标识的分节默认按通用内容块渲染
    if (!section.slotKey) {
      return true
    }

    return !HOME_FIXED_SECTION_SLOT_KEYS.includes(section.slotKey as (typeof HOME_FIXED_SECTION_SLOT_KEYS)[number])
  })
}

/**
 * 首页 metadata
 */
export async function generateMetadata() {
  const locale = await getRequestLocale()
  const page = await getHomePage(locale)

  return createPageMetadata({
    locale,
    title: page.metaTitle || page.hero.title,
    description: page.metaDescription || page.hero.description || page.hero.supportingText,
    pathname: '/',
    image: page.ogImage,
  })
}

/**
 * 官网首页
 * @returns 首页内容
 */
export default async function HomePage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const [homePage, features, useCases, homeFaqItems, aboutPage] = await Promise.all([
    getHomePage(locale),
    getFeaturePages(locale),
    getUseCasePages(locale),
    getFaqItems(['home', 'faqs'], locale),
    getAboutPageView(locale),
  ])
  const organizationJsonLd = await createOrganizationJsonLd(locale)
  const aboutOverviewSection = aboutPage.sections.find((section) => section.type === 'cardGrid') ?? null
  const additionalSections = getHomeAdditionalSections(homePage.sections)

  return (
    <div className="page page--hero">
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}
      {homeFaqItems.length > 0 ? <StructuredData data={createFaqJsonLd(homeFaqItems)} /> : null}

      <section className="site-shell page__hero">
        {homePage.hero.eyebrow ? (
          <span className="page__eyebrow">{homePage.hero.eyebrow}</span>
        ) : null}
        {homePage.hero.title ? <h1>{homePage.hero.title}</h1> : null}
        {homePage.hero.description ? <p>{homePage.hero.description}</p> : null}
        {homePage.hero.supportingText ? (
          <p className="page__hero-support">{homePage.hero.supportingText}</p>
        ) : null}
        {homePage.hero.primaryCta || homePage.hero.secondaryCta ? (
          <div className="page__hero-actions">
            {homePage.hero.primaryCta ? (
              <Link className="button button--solid" href={homePage.hero.primaryCta.href}>
                {homePage.hero.primaryCta.label}
              </Link>
            ) : null}
            {homePage.hero.secondaryCta ? (
              <Link className="button button--ghost" href={homePage.hero.secondaryCta.href}>
                {homePage.hero.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        ) : null}
        {homePage.hero.footnote ? (
          <p className="page__hero-support">{homePage.hero.footnote}</p>
        ) : null}
      </section>

      {homePage.problemsSection && homePage.problemsSection.cards.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">
              {homePage.problemsSection.label || dictionary.home.problemEyebrow}
            </span>
            <h2>{homePage.problemsSection.title || dictionary.home.problemTitle}</h2>
            {homePage.problemsSection.description ? <p>{homePage.problemsSection.description}</p> : null}
          </div>
          <div className={`cards cards--${homePage.problemsSection.columns}`}>
            {homePage.problemsSection.cards.map((problem) => (
              <article key={problem.title} className="card">
                <h3>{problem.title}</h3>
                {(problem.body ? [problem.body] : []).concat(problem.paragraphs).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {features.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">
              {homePage.featureIntroSection?.label || dictionary.home.featuresEyebrow}
            </span>
            <h2>{homePage.featureIntroSection?.title || dictionary.home.featuresTitle}</h2>
            {homePage.featureIntroSection?.description ? <p>{homePage.featureIntroSection.description}</p> : null}
            {homePage.featureIntroSection?.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="cards cards--2">
            {features.map((feature) => (
              <article key={feature.slug} className="card card--feature feature-grid__card">
                {feature.hero.eyebrow ? (
                  <span className="feature-grid__card-number">{feature.hero.eyebrow}</span>
                ) : null}
                <h3>
                  {feature.hero.title}
                  {feature.hero.highlight ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{feature.hero.highlight}</span>
                    </>
                  ) : null}
                </h3>
                {feature.hero.description ? <p>{feature.hero.description}</p> : null}
                {feature.summaryItems.length > 0 ? (
                  <ul>
                    {feature.summaryItems.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                <Link className="feature-grid__link" href={`/features/${feature.slug}/`}>
                  {dictionary.home.exploreFeature}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {homePage.howItWorksSection && homePage.howItWorksSection.cards.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">
              {homePage.howItWorksSection.label || dictionary.home.howItWorksEyebrow}
            </span>
            <h2>{homePage.howItWorksSection.title || dictionary.home.howItWorksTitle}</h2>
            {homePage.howItWorksSection.description ? <p>{homePage.howItWorksSection.description}</p> : null}
          </div>
          <div className="cards cards--3 steps">
            {homePage.howItWorksSection.cards.map((step) => (
              <article key={step.title} className="card step">
                <h3>{step.title}</h3>
                <p>{step.body || step.paragraphs[0] || ''}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {useCases.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.useCasesEyebrow}</span>
            <h2>{dictionary.home.useCasesTitle}</h2>
          </div>
          <div className="cards cards--2">
            {useCases.map((page) => (
              <article key={page.slug} className="card">
                <h3>{page.hero.title}</h3>
                {page.hero.description ? <p>{page.hero.description}</p> : null}
                <Link className="feature-grid__link" href={`/use-cases/${page.slug}/`}>
                  {dictionary.home.viewUseCase}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {homeFaqItems.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.faqEyebrow}</span>
            <h2>{dictionary.home.faqTitle}</h2>
          </div>
          <div className="faq-list">
            {homeFaqItems.map((item) => (
              <details key={item.id}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {aboutPage.hero.description || aboutOverviewSection ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.aboutEyebrow}</span>
            <h2>{dictionary.home.aboutTitle}</h2>
            {aboutPage.hero.description ? <p>{aboutPage.hero.description}</p> : null}
          </div>
          <div className="cards cards--2">
            {(aboutOverviewSection?.cards ?? []).slice(0, 2).map((card, index) => (
              <article key={card.title} className="card">
                <h3>
                  {card.title ||
                    (index === 0 ? dictionary.home.missionTitle : dictionary.home.storyTitle)}
                </h3>
                {(card.body ? [card.body] : []).concat(card.paragraphs).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {index === 1 ? (
                  <Link className="feature-grid__link" href="/about/">
                    {dictionary.home.learnMore}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {additionalSections.length > 0 ? <PageSections sections={additionalSections} /> : null}

      {homePage.finalCtaSection ? (
        <PageSections
          sections={[
            {
              ...homePage.finalCtaSection,
              label: homePage.finalCtaSection.label || dictionary.home.nextStepEyebrow,
            },
          ]}
        />
      ) : null}
    </div>
  )
}
