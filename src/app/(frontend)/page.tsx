import Link from 'next/link'

import { OfficialHomeEffects } from '@/components/site/official/OfficialHomeEffects'
import { OfficialUseCasesShowcase } from '@/components/site/official/OfficialUseCasesShowcase'
import { StructuredData } from '@/components/site/StructuredData'
import { HOME_JSON_LD } from '@/lib/site/json-ld'
import {
  OFFICIAL_PRODUCT_AUTH_TARGET_PATH,
  OFFICIAL_PRODUCT_AUTH_URL,
} from '@/lib/site/official-site'

const HOME_FEATURES = [
  {
    title: 'Specialist Level Expertise',
    description:
      'Meeting notes become agency-grade flowcharts and Gantt charts, dropped into pixel-matched PowerPoint, Word, and Excel templates, with no junior-analyst placeholder work.\n\nA PRD, Figma, or Axure file becomes a clickable prototype in one step.',
    image: '/assets/redesign/feature-expertise.jpg',
  },
  {
    title: 'Full Project Fluency',
    description:
      'Every document, recording, and email, pulled from your drives and CRM.\n\nAn AI CRM and PMS that works from full project context, not just stores it, writing grounded materials, keeping documents in sync, in a workspace shared with your team and agents.',
    image: '/assets/redesign/feature-context.jpg',
  },
  {
    title: 'Signature-Level Fluency',
    description:
      'It picks up the judgment and taste behind your work, how you structure a deliverable and the business behind it, so every solution reads like you.\n\nRepeated routines become dedicated agents, handling high-volume work reliably.',
    image: '/assets/redesign/feature-fluency.png',
  },
] as const

/** Noumi 官网首页。 */
export default function HomePage() {
  return (
    <>
      <StructuredData data={HOME_JSON_LD} />
      <OfficialHomeEffects />
      <main className="redesign-home" id="top">
        <section className="redesign-hero">
          <div className="redesign-shell">
            <div className="redesign-hero__media">
              <video
                autoPlay
                className="redesign-hero__video"
                loop
                muted
                playsInline
                poster="/assets/redesign/hero-loop-poster.jpg"
              >
                <source src="/assets/redesign/hero-loop.mp4" type="video/mp4" />
              </video>
              <div className="redesign-hero__content">
                <h1>
                  <span className="redesign-hero__title-main">
                    Effortless,
                    <br />
                    Trustworthy
                    <br />
                    Deliverables
                  </span>
                  <span className="redesign-hero__title-small">In Your Noumi Workspace</span>
                </h1>
                <p className="redesign-hero__copy">
                  Claude alternative designed for business and
                  <br />
                  solution professionals
                </p>
                <Link
                  className="redesign-button redesign-button--dark redesign-button--animated"
                  data-analytics-cta-id="home_hero_try_free"
                  data-analytics-event="official_cta_clicked"
                  data-analytics-placement="hero"
                  data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
                  href={OFFICIAL_PRODUCT_AUTH_URL}
                >
                  <span>Join Waitlist</span>
                  <span aria-hidden="true" className="redesign-button__arrows">
                    <img alt="" src="/assets/redesign/arrow.svg" />
                    <img alt="" src="/assets/redesign/arrow.svg" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="redesign-features" id="features">
          <div className="redesign-shell redesign-section-heading reveal">
            <p className="redesign-kicker redesign-kicker--dark">
              <span
                aria-hidden="true"
                className="redesign-kicker__mark redesign-kicker__mark--left"
              />
              <span>What is Noumi</span>
              <span
                aria-hidden="true"
                className="redesign-kicker__mark redesign-kicker__mark--right"
              />
            </p>
            <h2>
              Noumi Handles The Rest.
              <br />
              Only The Irreplaceable You Remains.
            </h2>
          </div>
          <div className="redesign-shell redesign-feature-stack">
            {HOME_FEATURES.map((feature, index) => (
              <article
                className={`redesign-feature${index === 0 ? ' is-active' : ''}`}
                key={feature.title}
              >
                <div className="redesign-feature__copy">
                  <div className="redesign-feature__title-wrap">
                    <h3>{feature.title}</h3>
                    <span aria-hidden="true" className="redesign-feature__arrow" />
                  </div>
                  <p>{feature.description}</p>
                </div>
                <div className="redesign-feature__visual">
                  <img alt="" src={feature.image} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="redesign-use-cases" id="use-cases">
          <div className="redesign-shell redesign-use-cases__header">
            <p className="redesign-kicker redesign-kicker--dark">
              <span
                aria-hidden="true"
                className="redesign-kicker__mark redesign-kicker__mark--left"
              />
              <span>Use Cases</span>
              <span
                aria-hidden="true"
                className="redesign-kicker__mark redesign-kicker__mark--right"
              />
            </p>
            <h2>Built for the way you work</h2>
          </div>
          <div className="redesign-shell">
            <OfficialUseCasesShowcase />
          </div>
        </section>

        <section className="redesign-final-cta">
          <div className="redesign-shell redesign-final-cta__card">
            <div>
              <h2>Get Started Today</h2>
              <p>Get to know me. I’ll get to know you.</p>
            </div>
            <Link
              className="redesign-button redesign-button--dark redesign-button--animated"
              data-analytics-cta-id="home_band_try_free"
              data-analytics-event="official_cta_clicked"
              data-analytics-placement="cta_band"
              data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
              href={OFFICIAL_PRODUCT_AUTH_URL}
            >
              Join Waitlist
              <span aria-hidden="true" className="redesign-button__arrows">
                <img alt="" src="/assets/redesign/arrow.svg" />
                <img alt="" src="/assets/redesign/arrow.svg" />
              </span>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
