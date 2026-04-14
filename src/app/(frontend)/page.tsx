import Link from 'next/link'

import { PageSections } from '@/components/site/PageSections'
import { StructuredData } from '@/components/site/StructuredData'
import { TypewriterText } from '@/components/site/TypewriterText'
import { TypesetText } from '@/components/site/TypesetText'
import { getRequestLocale } from '@/lib/site/i18n.server'
import { getAboutPageView, getFaqItems, getHomePage } from '@/lib/site/cms'
import { createFaqJsonLd, createOrganizationJsonLd, createPageMetadata } from '@/lib/site/seo'

/** 首页固定槽位 key 列表 */
const HOME_FIXED_SECTION_SLOT_KEYS = [
  'home-problems',
  'home-features',
  'home-how-it-works',
  'home-use-cases',
  'home-skills',
  'home-memory',
  'home-faq-intro',
  'home-final-cta',
] as const

/**
 * 判断首页是否已经切换到固定版位结构
 * @param sections 首页完整分节列表
 * @returns 是否存在任一固定槽位
 */
function hasHomeFixedSections(sections: Awaited<ReturnType<typeof getHomePage>>['sections']): boolean {
  return sections.some((section) =>
    HOME_FIXED_SECTION_SLOT_KEYS.includes(section.slotKey as (typeof HOME_FIXED_SECTION_SLOT_KEYS)[number]),
  )
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
  const [homePage, aboutPage, homeFaqItems] = await Promise.all([
    getHomePage(locale),
    getAboutPageView(locale),
    getFaqItems(['home', 'faqs'], locale),
  ])
  const organizationJsonLd = await createOrganizationJsonLd(locale)
  const aboutOverviewSection =
    aboutPage.sections.find((section) => section.type === 'companyOverview') ?? null
  const shouldRenderLegacySections = !hasHomeFixedSections(homePage.sections)

  return (
    <div className="page page--home">
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}
      {homeFaqItems.length > 0 ? <StructuredData data={createFaqJsonLd(homeFaqItems)} /> : null}

      <section className="hero" id="home">
        <div className="wrap hero__content">
          {homePage.hero.eyebrow ? (
            <div className="hero__label">
              <span className="hero__dot" />
              {homePage.hero.eyebrow}
            </div>
          ) : null}

          {homePage.hero.title ? (
            <TypewriterText className="grad-text" text={homePage.hero.title} />
          ) : null}

          {homePage.hero.description ? (
            <TypesetText as="p" className="hero__sub" locale={locale} text={homePage.hero.description} variant="heroBody">
              {homePage.hero.description}
            </TypesetText>
          ) : null}

          {homePage.hero.primaryCta || homePage.hero.secondaryCta ? (
            <div className="hero__actions">
              {homePage.hero.primaryCta ? (
                <Link href={homePage.hero.primaryCta.href} className="btn-primary" id="get-started">
                  {homePage.hero.primaryCta.label}
                </Link>
              ) : null}
              {homePage.hero.secondaryCta ? (
                <Link href={homePage.hero.secondaryCta.href} className="btn-ghost">
                  {homePage.hero.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}

          {homePage.hero.footnote ? (
            <TypesetText as="p" className="hero__roles" locale={locale} text={homePage.hero.footnote} variant="body">
              {homePage.hero.footnote}
            </TypesetText>
          ) : null}
        </div>
      </section>

      <hr className="divider" />

      {homePage.problemsSection && homePage.problemsSection.cards.length > 0 ? (
        <>
          <section className="section" id="problem">
            <div className="wrap">
              <div className="section__head">
                {homePage.problemsSection.label ? <span className="label">{homePage.problemsSection.label}</span> : null}
                {homePage.problemsSection.title ? (
                  <TypesetText as="h2" locale={locale} text={homePage.problemsSection.title} variant="sectionTitle">
                    {homePage.problemsSection.title}
                  </TypesetText>
                ) : null}
                {homePage.problemsSection.description ? (
                  <TypesetText as="p" className="wide" locale={locale} text={homePage.problemsSection.description} variant="sectionBody">
                    {homePage.problemsSection.description}
                  </TypesetText>
                ) : null}
              </div>
              <div className="problem__grid">
                {homePage.problemsSection.cards.map((card, index) => (
                  <article key={`${card.title}-${index}`} className="problem-card">
                    <p className="problem-card__num">{card.eyebrow || String(index + 1).padStart(2, '0')}</p>
                    <TypesetText as="h3" locale={locale} text={card.title} variant="cardTitle">
                      {card.title}
                    </TypesetText>
                    {card.body ? (
                      <TypesetText as="p" locale={locale} text={card.body} variant="body">
                        {card.body}
                      </TypesetText>
                    ) : null}
                    {card.paragraphs.map((paragraph) => (
                      <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
                        {paragraph}
                      </TypesetText>
                    ))}
                  </article>
                ))}
              </div>
            </div>
          </section>
          <hr className="divider" />
        </>
      ) : null}

      {homePage.featureShowcaseSection ? (
        <>
          <PageSections locale={locale} sections={[homePage.featureShowcaseSection]} />
          <hr className="divider" />
        </>
      ) : null}

      {homePage.howItWorksSection ? (
        <>
          <PageSections locale={locale} sections={[homePage.howItWorksSection]} />
          <hr className="divider" />
        </>
      ) : null}

      {homePage.useCaseGridSection ? (
        <>
          <PageSections locale={locale} sections={[homePage.useCaseGridSection]} />
          <hr className="divider" />
        </>
      ) : null}

      {homePage.skillsSection ? (
        <>
          <PageSections locale={locale} sections={[homePage.skillsSection]} />
          <hr className="divider" />
        </>
      ) : null}

      {homePage.memorySection ? (
        <>
          <PageSections locale={locale} sections={[homePage.memorySection]} />
          <hr className="divider" />
        </>
      ) : null}

      {homeFaqItems.length > 0 ? (
        <>
          <section className="section" id="faq">
            <div className="wrap">
              <div className="section__head">
                {homePage.faqIntroSection?.label ? <span className="label">{homePage.faqIntroSection.label}</span> : null}
                {homePage.faqIntroSection?.title ? (
                  <TypesetText as="h2" locale={locale} text={homePage.faqIntroSection.title} variant="sectionTitle">
                    {homePage.faqIntroSection.title}
                  </TypesetText>
                ) : null}
                {homePage.faqIntroSection?.description ? (
                  <TypesetText as="p" locale={locale} text={homePage.faqIntroSection.description} variant="sectionBody">
                    {homePage.faqIntroSection.description}
                  </TypesetText>
                ) : null}
              </div>

              <div className="faq__list">
                {homeFaqItems.map((item) => (
                  <details key={item.id}>
                    <summary>{item.question}</summary>
                    <div className="faq__answer">{item.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>
          <hr className="divider" />
        </>
      ) : null}

      {aboutOverviewSection ? (
        <>
          <PageSections locale={locale} sections={[aboutOverviewSection]} />
          <hr className="divider" />
        </>
      ) : null}

      {shouldRenderLegacySections ? <PageSections locale={locale} sections={homePage.sections} /> : null}

      {homePage.finalCtaSection ? <PageSections locale={locale} sections={[homePage.finalCtaSection]} /> : null}
    </div>
  )
}
