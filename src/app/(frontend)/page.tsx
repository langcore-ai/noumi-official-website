import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import { HOME_JSON_LD } from '@/lib/site/json-ld'
import {
  OFFICIAL_PRODUCT_AUTH_TARGET_PATH,
  OFFICIAL_PRODUCT_AUTH_URL,
} from '@/lib/site/official-site'

const HOME_FEATURES = [
  {
    index: '01',
    title: 'Specialist Level Expertise',
    description:
      'Domain-specific expertise, ready when you are. Noumi brings the depth of a specialist to every project without the overhead of building a team.',
    href: '/features',
    image: '/assets/redesign/feature-expertise.jpg',
  },
  {
    index: '02',
    title: 'Full Project Fluency',
    description:
      'Noumi understands your goals, files, decisions, and working context — then carries that understanding across every stage of the project.',
    href: '/features',
    image: '/assets/redesign/feature-context.jpg',
  },
  {
    index: '03',
    title: 'Signature-Level Fluency',
    description:
      'Your standards become the default. Noumi learns how you think, write, and deliver so every result feels unmistakably yours.',
    href: '/features',
    image: '/assets/redesign/feature-fluency.png',
  },
] as const

const HOME_USE_CASES = [
  {
    title: 'Solutions Engineer',
    description:
      'Turn discovery notes and technical context into tailored, client-ready solutions.',
    href: '/use-cases/solutions-engineer',
    className: 'redesign-use-case--blue',
  },
  {
    title: 'Product Manager',
    description: 'Move from scattered research to clear requirements, decisions, and plans.',
    href: '/use-cases/product-manager',
    className: 'redesign-use-case--sand',
  },
  {
    title: 'Journalist',
    description:
      'Organize sources, discover angles, and shape reporting without losing your voice.',
    href: '/use-cases/journalist',
    className: 'redesign-use-case--slate',
  },
] as const

/** Noumi 官网首页。 */
export default function HomePage() {
  return (
    <>
      <StructuredData data={HOME_JSON_LD} />
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
              <div className="redesign-hero__shade" />
              <div className="redesign-hero__content">
                <p className="redesign-kicker">Your AI workspace</p>
                <h1>
                  Effortless, trustworthy deliverables
                  <br />
                  in your Noumi workspace
                </h1>
                <p className="redesign-hero__copy">
                  Claude alternative designed for business and solution professionals.
                </p>
                <Link
                  className="redesign-button redesign-button--light"
                  data-analytics-cta-id="home_hero_try_free"
                  data-analytics-event="official_cta_clicked"
                  data-analytics-placement="hero"
                  data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
                  href={OFFICIAL_PRODUCT_AUTH_URL}
                >
                  Join Waitlist <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="redesign-features" id="features">
          <div className="redesign-shell redesign-section-heading">
            <p className="redesign-kicker redesign-kicker--dark">What makes Noumi different</p>
            <h2>Noumi handles the rest. Only the irreplaceable you remains.</h2>
          </div>
          <div className="redesign-shell redesign-feature-stack">
            {HOME_FEATURES.map((feature) => (
              <article className="redesign-feature" key={feature.title}>
                <div className="redesign-feature__copy">
                  <span className="redesign-feature__index">{feature.index}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <Link className="redesign-text-link" href={feature.href}>
                    Explore the capability <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <div className="redesign-feature__visual">
                  <img alt="" src={feature.image} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="redesign-use-cases">
          <div className="redesign-shell redesign-use-cases__header">
            <div>
              <p className="redesign-kicker redesign-kicker--dark">Use cases</p>
              <h2>Built for the way you work</h2>
            </div>
            <Link className="redesign-text-link" href="/use-cases">
              View all use cases <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="redesign-shell redesign-use-cases__grid">
            {HOME_USE_CASES.map((useCase, index) => (
              <Link
                className={`redesign-use-case ${useCase.className}`}
                href={useCase.href}
                key={useCase.title}
              >
                <span className="redesign-use-case__number">0{index + 1}</span>
                <div>
                  <h3>{useCase.title}</h3>
                  <p>{useCase.description}</p>
                </div>
                <span className="redesign-use-case__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="redesign-final-cta">
          <div className="redesign-shell redesign-final-cta__card">
            <div>
              <p className="redesign-kicker">Get started today</p>
              <h2>Get to know me. I’ll get to know you.</h2>
            </div>
            <Link
              className="redesign-button redesign-button--light"
              data-analytics-cta-id="home_band_try_free"
              data-analytics-event="official_cta_clicked"
              data-analytics-placement="cta_band"
              data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
              href={OFFICIAL_PRODUCT_AUTH_URL}
            >
              Join Waitlist <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
