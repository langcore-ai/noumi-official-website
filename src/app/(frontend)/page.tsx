import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { getSiteDictionary } from '@/lib/site/i18n'
import { getRequestLocale } from '@/lib/site/i18n.server'
import {
  getAboutPage,
  getFaqItems,
  getFeaturePages,
  getSiteSettings,
  getUseCasePages,
  mapHomeHowItWorks,
  mapHomeProblems,
} from '@/lib/site/cms'
import { createFaqJsonLd, createOrganizationJsonLd } from '@/lib/site/seo'

/**
 * 官网首页
 * @returns 首页内容
 */
export default async function HomePage() {
  const locale = await getRequestLocale()
  const dictionary = getSiteDictionary(locale)
  const [siteSettings, features, useCases, homeFaqItems, aboutPage] = await Promise.all([
    getSiteSettings(locale),
    getFeaturePages(locale),
    getUseCasePages(locale),
    getFaqItems(['home', 'faqs'], locale),
    getAboutPage(locale),
  ])

  const homeProblems = mapHomeProblems(siteSettings)
  const howItWorks = mapHomeHowItWorks(siteSettings)
  const organizationJsonLd = await createOrganizationJsonLd(locale)

  return (
    <div className="page page--hero">
      {organizationJsonLd ? <StructuredData data={organizationJsonLd} /> : null}
      {homeFaqItems.length > 0 ? <StructuredData data={createFaqJsonLd(homeFaqItems)} /> : null}

      <section className="site-shell page__hero">
        {siteSettings.homeHero?.label ? (
          <span className="page__eyebrow">{siteSettings.homeHero.label}</span>
        ) : null}
        {siteSettings.homeHero?.title ? <h1>{siteSettings.homeHero.title}</h1> : null}
        {siteSettings.homeHero?.subtitle ? <p>{siteSettings.homeHero.subtitle}</p> : null}
        {siteSettings.homeHero?.intro ? (
          <p className="page__hero-support">{siteSettings.homeHero.intro}</p>
        ) : null}
        {(siteSettings.homeHero?.primaryCtaHref && siteSettings.homeHero?.primaryCtaLabel) ||
        (siteSettings.homeHero?.secondaryCtaHref && siteSettings.homeHero?.secondaryCtaLabel) ? (
          <div className="page__hero-actions">
            {siteSettings.homeHero?.primaryCtaHref && siteSettings.homeHero?.primaryCtaLabel ? (
              <Link className="button button--solid" href={siteSettings.homeHero.primaryCtaHref}>
                {siteSettings.homeHero.primaryCtaLabel}
              </Link>
            ) : null}
            {siteSettings.homeHero?.secondaryCtaHref && siteSettings.homeHero?.secondaryCtaLabel ? (
              <Link className="button button--ghost" href={siteSettings.homeHero.secondaryCtaHref}>
                {siteSettings.homeHero.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
        {siteSettings.homeHero?.roles ? (
          <p className="page__hero-support">{siteSettings.homeHero.roles}</p>
        ) : null}
      </section>

      {homeProblems.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.problemEyebrow}</span>
            <h2>{dictionary.home.problemTitle}</h2>
          </div>
          <div className="cards cards--4">
            {homeProblems.map((problem) => (
              <article key={problem.title} className="card">
                <h3>{problem.title}</h3>
                {problem.paragraphs.map((paragraph) => (
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
            <span className="page__eyebrow">{dictionary.home.featuresEyebrow}</span>
            <h2>{dictionary.home.featuresTitle}</h2>
            {siteSettings.homeFeatureIntro ? <p>{siteSettings.homeFeatureIntro}</p> : null}
          </div>
          <div className="cards cards--2">
            {features.map((feature) => (
              <article key={feature.slug} className="card card--feature feature-grid__card">
                {feature.heroLabel ? (
                  <span className="feature-grid__card-number">{feature.heroLabel}</span>
                ) : null}
                <h3>
                  {feature.heroTitle}
                  {feature.heroEmphasis ? (
                    <>
                      {' '}
                      <span className="hero-highlight">{feature.heroEmphasis}</span>
                    </>
                  ) : null}
                </h3>
                {feature.heroLead ? <p>{feature.heroLead}</p> : null}
                {(feature.summaryBullets ?? []).length > 0 ? (
                  <ul>
                    {(feature.summaryBullets ?? []).map((bullet) =>
                      bullet?.text ? <li key={bullet.id ?? bullet.text}>{bullet.text}</li> : null,
                    )}
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

      {howItWorks.length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.howItWorksEyebrow}</span>
            <h2>{dictionary.home.howItWorksTitle}</h2>
          </div>
          <div className="cards cards--3 steps">
            {howItWorks.map((step) => (
              <article key={step.title} className="card step">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
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
                <h3>{page.heroTitle}</h3>
                {page.heroLead ? <p>{page.heroLead}</p> : null}
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

      {aboutPage.intro ||
      (aboutPage.missionParagraphs ?? []).length > 0 ||
      (aboutPage.storyParagraphs ?? []).length > 0 ? (
        <section className="site-shell section">
          <div className="section__header">
            <span className="page__eyebrow">{dictionary.home.aboutEyebrow}</span>
            <h2>{dictionary.home.aboutTitle}</h2>
            {aboutPage.intro ? <p>{aboutPage.intro}</p> : null}
          </div>
          <div className="cards cards--2">
            {(aboutPage.missionParagraphs ?? []).length > 0 ? (
              <article className="card">
                <h3>{dictionary.home.missionTitle}</h3>
                {(aboutPage.missionParagraphs ?? []).map((paragraph) =>
                  paragraph?.text ? <p key={paragraph.id ?? paragraph.text}>{paragraph.text}</p> : null,
                )}
              </article>
            ) : null}
            {(aboutPage.storyParagraphs ?? []).length > 0 ? (
              <article className="card">
                <h3>{dictionary.home.storyTitle}</h3>
                {(aboutPage.storyParagraphs ?? []).map((paragraph) =>
                  paragraph?.text ? <p key={paragraph.id ?? paragraph.text}>{paragraph.text}</p> : null,
                )}
                <Link className="feature-grid__link" href="/about/">
                  {dictionary.home.learnMore}
                </Link>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      {siteSettings.homeFinalCta?.title ||
      siteSettings.homeFinalCta?.description ||
      (siteSettings.homeFinalCta?.primaryCtaHref && siteSettings.homeFinalCta?.primaryCtaLabel) ||
      (siteSettings.homeFinalCta?.secondaryCtaHref && siteSettings.homeFinalCta?.secondaryCtaLabel) ? (
        <section className="site-shell section">
          <div className="feature-detail__summary">
            <span className="page__eyebrow">{dictionary.home.nextStepEyebrow}</span>
            {siteSettings.homeFinalCta?.title ? <h2>{siteSettings.homeFinalCta.title}</h2> : null}
            {siteSettings.homeFinalCta?.description ? (
              <p>{siteSettings.homeFinalCta.description}</p>
            ) : null}
            {(siteSettings.homeFinalCta?.primaryCtaHref && siteSettings.homeFinalCta?.primaryCtaLabel) ||
            (siteSettings.homeFinalCta?.secondaryCtaHref &&
              siteSettings.homeFinalCta?.secondaryCtaLabel) ? (
              <div className="page__hero-actions">
                {siteSettings.homeFinalCta?.primaryCtaHref &&
                siteSettings.homeFinalCta?.primaryCtaLabel ? (
                  <Link
                    className="button button--solid"
                    href={siteSettings.homeFinalCta.primaryCtaHref}
                  >
                    {siteSettings.homeFinalCta.primaryCtaLabel}
                  </Link>
                ) : null}
                {siteSettings.homeFinalCta?.secondaryCtaHref &&
                siteSettings.homeFinalCta?.secondaryCtaLabel ? (
                  <Link
                    className="button button--ghost"
                    href={siteSettings.homeFinalCta.secondaryCtaHref}
                  >
                    {siteSettings.homeFinalCta.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
