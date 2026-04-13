import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { TypesetText } from '@/components/site/TypesetText'
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
    <div className="page page--hero page--fullscreen">
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}
      {homeFaqItems.length > 0 ? <StructuredData data={createFaqJsonLd(homeFaqItems)} /> : null}

      <section className="site-shell page__hero">
        {homePage.hero.eyebrow ? (
          <span className="page__eyebrow">{homePage.hero.eyebrow}</span>
        ) : null}
        {homePage.hero.title ? (
          <TypesetText as="h1" locale={locale} text={homePage.hero.title} variant="heroTitle">
            {homePage.hero.title}
          </TypesetText>
        ) : null}
        {homePage.hero.description ? (
          <TypesetText as="p" locale={locale} text={homePage.hero.description} variant="heroBody">
            {homePage.hero.description}
          </TypesetText>
        ) : null}
        {homePage.hero.supportingText ? (
          <TypesetText
            as="p"
            className="page__hero-support"
            locale={locale}
            text={homePage.hero.supportingText}
            variant="heroBody"
          >
            {homePage.hero.supportingText}
          </TypesetText>
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
          <TypesetText
            as="p"
            className="page__hero-support"
            locale={locale}
            text={homePage.hero.footnote}
            variant="body"
          >
            {homePage.hero.footnote}
          </TypesetText>
        ) : null}
      </section>

      {homePage.problemsSection && homePage.problemsSection.cards.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">
              {homePage.problemsSection.label || dictionary.home.problemEyebrow}
            </span>
            <TypesetText
              as="h2"
              locale={locale}
              text={homePage.problemsSection.title || dictionary.home.problemTitle}
              variant="sectionTitle"
            >
              {homePage.problemsSection.title || dictionary.home.problemTitle}
            </TypesetText>
            {homePage.problemsSection.description ? (
              <TypesetText
                as="p"
                locale={locale}
                text={homePage.problemsSection.description}
                variant="sectionBody"
              >
                {homePage.problemsSection.description}
              </TypesetText>
            ) : null}
          </div>
          <div className={`cards cards--${homePage.problemsSection.columns}`}>
            {homePage.problemsSection.cards.map((problem) => (
              <article key={problem.title} className="card">
                <TypesetText as="h3" locale={locale} text={problem.title} variant="cardTitle">
                  {problem.title}
                </TypesetText>
                {(problem.body ? [problem.body] : []).concat(problem.paragraphs).map((paragraph) => (
                  <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
                    {paragraph}
                  </TypesetText>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {features.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">
              {homePage.featureIntroSection?.label || dictionary.home.featuresEyebrow}
            </span>
            <TypesetText
              as="h2"
              locale={locale}
              text={homePage.featureIntroSection?.title || dictionary.home.featuresTitle}
              variant="sectionTitle"
            >
              {homePage.featureIntroSection?.title || dictionary.home.featuresTitle}
            </TypesetText>
            {homePage.featureIntroSection?.description ? (
              <TypesetText
                as="p"
                locale={locale}
                text={homePage.featureIntroSection.description}
                variant="sectionBody"
              >
                {homePage.featureIntroSection.description}
              </TypesetText>
            ) : null}
            {homePage.featureIntroSection?.paragraphs.map((paragraph) => (
              <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="sectionBody">
                {paragraph}
              </TypesetText>
            ))}
          </div>
          <div className="cards cards--2">
            {features.map((feature) => (
              <article key={feature.slug} className="card card--feature feature-grid__card">
                {feature.hero.eyebrow ? (
                  <span className="feature-grid__card-number">{feature.hero.eyebrow}</span>
                ) : null}
                <TypesetText
                  as="h3"
                  locale={locale}
                  text={`${feature.hero.title}${feature.hero.highlight ? ` ${feature.hero.highlight}` : ''}`}
                  variant="cardTitle"
                >
                  {feature.hero.title}
                  {feature.hero.highlight ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{feature.hero.highlight}</span>
                    </>
                  ) : null}
                </TypesetText>
                {feature.hero.description ? (
                  <TypesetText as="p" locale={locale} text={feature.hero.description} variant="body">
                    {feature.hero.description}
                  </TypesetText>
                ) : null}
                {feature.summaryItems.length > 0 ? (
                  <ul>
                    {feature.summaryItems.map((bullet) => (
                      <TypesetText key={bullet} as="li" locale={locale} text={bullet} variant="listItem">
                        {bullet}
                      </TypesetText>
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
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">
              {homePage.howItWorksSection.label || dictionary.home.howItWorksEyebrow}
            </span>
            <TypesetText
              as="h2"
              locale={locale}
              text={homePage.howItWorksSection.title || dictionary.home.howItWorksTitle}
              variant="sectionTitle"
            >
              {homePage.howItWorksSection.title || dictionary.home.howItWorksTitle}
            </TypesetText>
            {homePage.howItWorksSection.description ? (
              <TypesetText
                as="p"
                locale={locale}
                text={homePage.howItWorksSection.description}
                variant="sectionBody"
              >
                {homePage.howItWorksSection.description}
              </TypesetText>
            ) : null}
          </div>
          <div className="cards cards--3 steps">
            {homePage.howItWorksSection.cards.map((step) => (
              <article key={step.title} className="card step">
                <TypesetText as="h3" locale={locale} text={step.title} variant="cardTitle">
                  {step.title}
                </TypesetText>
                <TypesetText
                  as="p"
                  locale={locale}
                  text={step.body || step.paragraphs[0] || ''}
                  variant="body"
                >
                  {step.body || step.paragraphs[0] || ''}
                </TypesetText>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {useCases.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.useCasesEyebrow}</span>
            <TypesetText as="h2" locale={locale} text={dictionary.home.useCasesTitle} variant="sectionTitle">
              {dictionary.home.useCasesTitle}
            </TypesetText>
          </div>
          <div className="cards cards--2">
            {useCases.map((page) => (
              <article key={page.slug} className="card">
                <TypesetText as="h3" locale={locale} text={page.hero.title} variant="cardTitle">
                  {page.hero.title}
                </TypesetText>
                {page.hero.description ? (
                  <TypesetText as="p" locale={locale} text={page.hero.description} variant="body">
                    {page.hero.description}
                  </TypesetText>
                ) : null}
                <Link className="feature-grid__link" href={`/use-cases/${page.slug}/`}>
                  {dictionary.home.viewUseCase}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {homeFaqItems.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.faqEyebrow}</span>
            <TypesetText as="h2" locale={locale} text={dictionary.home.faqTitle} variant="sectionTitle">
              {dictionary.home.faqTitle}
            </TypesetText>
          </div>
          <div className="faq-list">
            {homeFaqItems.map((item) => (
              <details key={item.id}>
                <summary>{item.question}</summary>
                <TypesetText as="p" locale={locale} text={item.answer} variant="body">
                  {item.answer}
                </TypesetText>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {aboutPage.hero.description || aboutOverviewSection ? (
        <section className="site-shell section section--screen">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.aboutEyebrow}</span>
            <TypesetText as="h2" locale={locale} text={dictionary.home.aboutTitle} variant="sectionTitle">
              {dictionary.home.aboutTitle}
            </TypesetText>
            {aboutPage.hero.description ? (
              <TypesetText as="p" locale={locale} text={aboutPage.hero.description} variant="sectionBody">
                {aboutPage.hero.description}
              </TypesetText>
            ) : null}
          </div>
          <div className="cards cards--2">
            {(aboutOverviewSection?.cards ?? []).slice(0, 2).map((card, index) => (
              <article key={card.title} className="card">
                <TypesetText
                  as="h3"
                  locale={locale}
                  text={
                    card.title || (index === 0 ? dictionary.home.missionTitle : dictionary.home.storyTitle)
                  }
                  variant="cardTitle"
                >
                  {card.title ||
                    (index === 0 ? dictionary.home.missionTitle : dictionary.home.storyTitle)}
                </TypesetText>
                {(card.body ? [card.body] : []).concat(card.paragraphs).map((paragraph) => (
                  <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
                    {paragraph}
                  </TypesetText>
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

      {additionalSections.length > 0 ? <PageSections fullScreen locale={locale} sections={additionalSections} /> : null}

      {homePage.finalCtaSection ? (
        <PageSections
          fullScreen
          locale={locale}
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
