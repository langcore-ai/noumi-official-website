import type { ReactNode } from 'react'

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

/** 首页功能装饰图形变体 */
const FEATURE_ARTWORK_VARIANTS = ['layers', 'stream', 'network'] as const

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

    return !HOME_FIXED_SECTION_SLOT_KEYS.includes(
      section.slotKey as (typeof HOME_FIXED_SECTION_SLOT_KEYS)[number],
    )
  })
}

/**
 * 根据序号获取首页功能卡的装饰图形类型
 * @param index 卡片序号
 * @returns 装饰图形类型
 */
function getFeatureArtworkVariant(index: number): (typeof FEATURE_ARTWORK_VARIANTS)[number] {
  return FEATURE_ARTWORK_VARIANTS[index % FEATURE_ARTWORK_VARIANTS.length]
}

/**
 * 渲染首页功能卡顶部装饰图形
 * 这里不依赖真实图片素材，而是用纯 CSS 结构模拟 Next.js 官网的抽象产品插画。
 * @param variant 图形类型
 * @returns 装饰节点
 */
function renderFeatureArtwork(variant: (typeof FEATURE_ARTWORK_VARIANTS)[number]): ReactNode {
  switch (variant) {
    case 'layers':
      return (
        <div aria-hidden="true" className="showcase-visual showcase-visual--layers">
          <div className="showcase-visual__window showcase-visual__window--back" />
          <div className="showcase-visual__window showcase-visual__window--middle" />
          <div className="showcase-visual__window showcase-visual__window--front" />
          <span className="showcase-visual__label showcase-visual__label--back">Original</span>
          <span className="showcase-visual__label showcase-visual__label--middle">1440px</span>
          <span className="showcase-visual__label showcase-visual__label--front">375px</span>
        </div>
      )
    case 'stream':
      return (
        <div aria-hidden="true" className="showcase-visual showcase-visual--stream">
          <div className="showcase-visual__browser">
            <div className="showcase-visual__browser-top">
              <span />
              <span />
              <span />
            </div>
            <div className="showcase-visual__browser-lines">
              <span />
              <span />
              <span />
            </div>
            <div className="showcase-visual__browser-grid">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="showcase-visual__stream-line" />
        </div>
      )
    case 'network':
      return (
        <div aria-hidden="true" className="showcase-visual showcase-visual--network">
          <span className="showcase-visual__node showcase-visual__node--core" />
          <span className="showcase-visual__node showcase-visual__node--left" />
          <span className="showcase-visual__node showcase-visual__node--right" />
          <span className="showcase-visual__node showcase-visual__node--bottom-left" />
          <span className="showcase-visual__node showcase-visual__node--bottom" />
          <span className="showcase-visual__node showcase-visual__node--bottom-right" />
          <span className="showcase-visual__edge showcase-visual__edge--one" />
          <span className="showcase-visual__edge showcase-visual__edge--two" />
          <span className="showcase-visual__edge showcase-visual__edge--three" />
          <span className="showcase-visual__edge showcase-visual__edge--four" />
          <span className="showcase-visual__edge showcase-visual__edge--five" />
        </div>
      )
  }
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
  const aboutOverviewSection =
    aboutPage.sections.find((section) => section.type === 'cardGrid') ?? null
  const aboutCards = (aboutOverviewSection?.cards ?? []).slice(0, 3)
  const additionalSections = getHomeAdditionalSections(homePage.sections)
  return (
    <div className="page page--hero page--fullscreen">
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}
      {homeFaqItems.length > 0 ? <StructuredData data={createFaqJsonLd(homeFaqItems)} /> : null}

      <section className="site-shell page__hero home-hero">
        <div aria-hidden="true" className="home-hero__grid" />
        <div aria-hidden="true" className="home-hero__orbit home-hero__orbit--top-left" />
        <div aria-hidden="true" className="home-hero__orbit home-hero__orbit--bottom-right" />

        {homePage.hero.eyebrow ? (
          <span className="page__eyebrow">{homePage.hero.eyebrow}</span>
        ) : null}
        {homePage.hero.title ? (
          <TypesetText as="h1" locale={locale} text={homePage.hero.title} variant="heroTitle">
            {homePage.hero.title}
            {homePage.hero.highlight ? (
              <span className="hero-highlight home-hero__highlight">{homePage.hero.highlight}</span>
            ) : null}
          </TypesetText>
        ) : null}
        {homePage.hero.description ? (
          <TypesetText
            as="p"
            className="home-hero__lead"
            locale={locale}
            text={homePage.hero.description}
            variant="heroBody"
          >
            {homePage.hero.description}
          </TypesetText>
        ) : null}
        {homePage.hero.supportingText ? (
          <TypesetText
            as="p"
            className="page__hero-support home-hero__support"
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
          <p className="home-hero__command">
            <span>{homePage.hero.footnote}</span>
          </p>
        ) : null}
      </section>

      {homePage.problemsSection && homePage.problemsSection.cards.length > 0 ? (
        <section className="site-shell section section--screen home-section home-section--overview">
          <div className="section__header section__header--inline">
            <div>
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
            </div>
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
          <div className={`cards cards--${homePage.problemsSection.columns} overview-grid`}>
            {homePage.problemsSection.cards.map((problem, index) => (
              <article key={problem.title} className="card overview-card">
                <span className="overview-card__index">{String(index + 1).padStart(2, '0')}</span>
                <TypesetText as="h3" locale={locale} text={problem.title} variant="cardTitle">
                  {problem.title}
                </TypesetText>
                {(problem.body ? [problem.body] : [])
                  .concat(problem.paragraphs)
                  .map((paragraph) => (
                    <TypesetText
                      key={paragraph}
                      as="p"
                      locale={locale}
                      text={paragraph}
                      variant="body"
                    >
                      {paragraph}
                    </TypesetText>
                  ))}
                {problem.bullets.length > 0 ? (
                  <ul>
                    {problem.bullets.map((bullet) => (
                      <TypesetText
                        key={bullet}
                        as="li"
                        locale={locale}
                        text={bullet}
                        variant="listItem"
                      >
                        {bullet}
                      </TypesetText>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {features.length > 0 ? (
        <section className="site-shell section section--screen home-section home-section--features">
          <div className="section__header section__header--inline">
            <div>
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
            </div>
            <div>
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
                <TypesetText
                  key={paragraph}
                  as="p"
                  locale={locale}
                  text={paragraph}
                  variant="sectionBody"
                >
                  {paragraph}
                </TypesetText>
              ))}
            </div>
          </div>
          <div className="showcase-grid">
            {features.map((feature, index) => {
              const artworkVariant = getFeatureArtworkVariant(index)

              return (
                <article key={feature.slug} className="card showcase-card">
                  <div className="showcase-card__visual">
                    {renderFeatureArtwork(artworkVariant)}
                  </div>
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
                    <TypesetText
                      as="p"
                      locale={locale}
                      text={feature.hero.description}
                      variant="body"
                    >
                      {feature.hero.description}
                    </TypesetText>
                  ) : null}
                  {feature.summaryItems.length > 0 ? (
                    <ul>
                      {feature.summaryItems.map((bullet) => (
                        <TypesetText
                          key={bullet}
                          as="li"
                          locale={locale}
                          text={bullet}
                          variant="listItem"
                        >
                          {bullet}
                        </TypesetText>
                      ))}
                    </ul>
                  ) : null}
                  <Link className="feature-grid__link" href={`/features/${feature.slug}/`}>
                    {dictionary.home.exploreFeature}
                  </Link>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {homePage.howItWorksSection && homePage.howItWorksSection.cards.length > 0 ? (
        <section className="site-shell section section--screen home-foundation">
          <div className="section__header section__header--center">
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

          <div className="home-foundation__diagram">
            <div aria-hidden="true" className="home-foundation__beam home-foundation__beam--left" />
            <div
              aria-hidden="true"
              className="home-foundation__beam home-foundation__beam--center"
            />
            <div
              aria-hidden="true"
              className="home-foundation__beam home-foundation__beam--right"
            />
            <div className="home-foundation__core">
              {homePage.howItWorksSection.label || dictionary.home.howItWorksEyebrow}
            </div>
            <div className="cards cards--3 home-foundation__cards">
              {homePage.howItWorksSection.cards.map((step, index) => (
                <article key={step.title} className="card foundation-card">
                  <span className="foundation-card__badge">
                    {String(index + 1).padStart(2, '0')}
                  </span>
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
          </div>
        </section>
      ) : null}

      {useCases.length > 0 ? (
        <section className="site-shell section section--screen home-templates">
          <div className="home-templates__layout">
            <div className="home-templates__copy">
              <div className="section__header">
                <span className="page__eyebrow">{dictionary.home.useCasesEyebrow}</span>
                <TypesetText
                  as="h2"
                  locale={locale}
                  text={dictionary.home.useCasesTitle}
                  variant="sectionTitle"
                >
                  {dictionary.home.useCasesTitle}
                </TypesetText>
              </div>
              <div className="home-templates__chips">
                {useCases.map((page) => (
                  <span key={page.slug} className="home-chip">
                    {page.hero.eyebrow || page.hero.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="home-templates__stack">
              {useCases.slice(0, 3).map((page, index) => (
                <article
                  key={page.slug}
                  className={`card template-card template-card--${index + 1}`}
                >
                  <div className="template-card__screen" />
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
          </div>
        </section>
      ) : null}

      {homeFaqItems.length > 0 ? (
        <section className="site-shell section section--screen">
          <div className="section__header section__header--inline">
            <div>
              <span className="page__eyebrow">{dictionary.home.faqEyebrow}</span>
              <TypesetText
                as="h2"
                locale={locale}
                text={dictionary.home.faqTitle}
                variant="sectionTitle"
              >
                {dictionary.home.faqTitle}
              </TypesetText>
            </div>
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

      {aboutPage.hero.description || aboutCards.length > 0 ? (
        <section className="site-shell section section--screen home-proof">
          <div className="section__header section__header--inline">
            <div>
              <span className="page__eyebrow">{dictionary.home.aboutEyebrow}</span>
              <TypesetText
                as="h2"
                locale={locale}
                text={dictionary.home.aboutTitle}
                variant="sectionTitle"
              >
                {dictionary.home.aboutTitle}
              </TypesetText>
            </div>
            {aboutPage.hero.description ? (
              <TypesetText
                as="p"
                locale={locale}
                text={aboutPage.hero.description}
                variant="sectionBody"
              >
                {aboutPage.hero.description}
              </TypesetText>
            ) : null}
          </div>
          <div className="home-proof__grid">
            {aboutCards.map((card, index) => (
              <article key={card.title} className="card proof-card">
                <TypesetText
                  as="h3"
                  locale={locale}
                  text={
                    card.title ||
                    (index === 0 ? dictionary.home.missionTitle : dictionary.home.storyTitle)
                  }
                  variant="cardTitle"
                >
                  {card.title ||
                    (index === 0 ? dictionary.home.missionTitle : dictionary.home.storyTitle)}
                </TypesetText>
                {(card.body ? [card.body] : []).concat(card.paragraphs).map((paragraph) => (
                  <TypesetText
                    key={paragraph}
                    as="p"
                    locale={locale}
                    text={paragraph}
                    variant="body"
                  >
                    {paragraph}
                  </TypesetText>
                ))}
                {index === aboutCards.length - 1 ? (
                  <Link className="feature-grid__link" href="/about/">
                    {dictionary.home.learnMore}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {additionalSections.length > 0 ? (
        <PageSections fullScreen locale={locale} sections={additionalSections} />
      ) : null}

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
