import { createManagedMetadata, getManagedJsonLd } from '@/lib/site/managed-settings'
import Link from 'next/link'

import { OfficialDeliverableShowcase } from '@/components/site/official/OfficialDeliverableShowcase'
import { OfficialHeroVideo } from '@/components/site/official/OfficialHeroVideo'
import { OfficialIntroVideo } from '@/components/site/official/OfficialIntroVideo'
import { OfficialSecurityVisual } from '@/components/site/official/OfficialSecurityVisual'
import { OfficialUseCasesShowcase } from '@/components/site/official/OfficialUseCasesShowcase'
import { StructuredData } from '@/components/site/StructuredData'
import { HOME_ASSETS } from '@/lib/site/homepage-assets'
import { HOME_JSON_LD } from '@/lib/site/json-ld'
import {
  OFFICIAL_PRODUCT_AUTH_TARGET_PATH,
  OFFICIAL_PRODUCT_AUTH_URL,
} from '@/lib/site/official-site'
import './homepage.css'

function HomeCTA({ placement }: { placement: 'hero' | 'cta_band' }) {
  return (
    <Link
      className="noumi-modern-cta"
      href={OFFICIAL_PRODUCT_AUTH_URL}
      data-analytics-cta-id={placement === 'hero' ? 'home_hero_try_free' : 'home_band_try_free'}
      data-analytics-event="official_cta_clicked"
      data-analytics-placement={placement}
      data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
    >
      Try Noumi Free
    </Link>
  )
}

/** Homepage based on the approved design; only interactive islands hydrate. */
export default async function HomePage() {
  return (
    <>
      <StructuredData data={await getManagedJsonLd('/', HOME_JSON_LD)} />
      <link rel="preload" as="image" href={HOME_ASSETS.poster} fetchPriority="high" />
      <main className="redesign-home" id="top">
        <section className="redesign-hero">
          <div className="redesign-shell">
            <div className="redesign-hero__media">
              <OfficialHeroVideo />
              <div className="redesign-hero__content">
                <h1>
                  <span className="redesign-hero__title-main">
                    Trustworthy
                    <br />
                    Deliverables
                  </span>
                  <span className="redesign-hero__title-small">
                    <span className="hero-security-emphasis">Securely</span> in Your Noumi
                    Workspace.
                  </span>
                </h1>
                <p className="redesign-hero__copy">
                  Claude alternative designed for business and
                  <br />
                  solution professionals
                </p>
                <HomeCTA placement="hero" />
              </div>
            </div>
          </div>
        </section>
        <OfficialIntroVideo />
        <section className="redesign-features" id="features">
          <div className="redesign-shell redesign-section-heading redesign-section-heading--tagline">
            <p className="noumi-workspace-description home-key-message">
              It helps you turn requirements into a more compelling solution,
              <br />
              with less rework and fewer gaps
            </p>
          </div>
          <div className="redesign-shell redesign-feature-stack">
            <article className="redesign-feature expertise-showcase" id="expertise">
              <div className="redesign-feature__copy">
                <h3>
                  Specialist-Level
                  <br />
                  Expertise
                </h3>
                <p>
                  An AI agent with specialist skills for complex Solutions Engineering and Business
                  Analysis work.
                </p>
              </div>
              <OfficialDeliverableShowcase />
            </article>
            <article className="redesign-feature">
              <div className="redesign-feature__copy">
                <h3>
                  Full Project
                  <br />
                  Knowledge
                </h3>
                <p>
                  An AI agent that organizes your files, recordings, emails, and CRM into a complete
                  picture of every project, then searches your company knowledge to create
                  customer-ready materials grounded in facts.
                </p>
              </div>
              <div className="redesign-feature__visual">
                <img
                  src={HOME_ASSETS.knowledge}
                  srcSet={`${HOME_ASSETS.knowledgeMobile} 800w, ${HOME_ASSETS.knowledge} 1600w`}
                  sizes="(max-width: 900px) calc(100vw - 72px), (max-width: 1504px) 63vw, 940px"
                  alt="Noumi Agent Training: connect your tools and equip your agent with project knowledge"
                  width={1600}
                  height={916}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </article>
            <article className="redesign-feature security-feature" id="security">
              <div className="redesign-feature__copy">
                <h3 className="home-key-message">
                  At Noumi,
                  <br />
                  <span className="security-title-line">
                    privacy and <span className="security-title-accent">security</span>
                  </span>
                  <br />
                  are in our DNA.
                </h3>
                <p>
                  With end-to-end encryption in Noumi, your files and tasks are secured with an
                  isolated container.
                  <br />
                  Only you and the person you shared with can have access to them, and no one else,
                  not even Noumi.
                </p>
              </div>
              <OfficialSecurityVisual />
            </article>
          </div>
        </section>
        <section className="redesign-use-cases" id="use-cases" aria-label="Use cases">
          <div className="redesign-shell">
            <OfficialUseCasesShowcase />
          </div>
        </section>
        <section className="redesign-final-cta" id="final-cta">
          <div className="redesign-shell redesign-final-cta__card">
            <div>
              <h2>Complex requirements? Deliver with Noumi.</h2>
              <p>Turn complex project work into deliverables you can confidently share.</p>
            </div>
            <div className="redesign-final-cta__button">
              <HomeCTA placement="cta_band" />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export function generateMetadata() {
  return createManagedMetadata({
    pathname: '/',
    title: 'Personal AI workspace built for Business & Solutions professionals | Noumi.ai',
    description:
      'Noumi works like a real colleague — understanding context, managing tasks, and delivering results without constant prompting.',
  })
}
