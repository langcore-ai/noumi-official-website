import Link from 'next/link'

import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { OfficialHomeEffects } from '@/components/site/official/OfficialHomeEffects'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'

/**
 * 首页信任墙 Logo 配置。
 */
const TRUSTED_LOGOS = [
  ['microsoft.webp', 'Microsoft'],
  ['nvidia.webp', 'NVIDIA'],
  ['tencent.webp', 'Tencent'],
  ['siemens.webp', 'Siemens'],
  ['amd.webp', 'AMD'],
  ['dominos.webp', "Domino's"],
  ['alibaba-cloud.webp', 'Alibaba Cloud'],
  ['plug-and-play.webp', 'Plug and Play'],
  ['ascend.webp', 'Ascend'],
] as const

/**
 * 官网首页
 * @returns 首页内容
 */
export default async function HomePage() {
  const useCases = await getOfficialUseCaseNavItems()

  return (
    <div className="page-shell">
      <OfficialHomeEffects />
      <OfficialHomeHeader useCases={useCases} />

      <main id="top">
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__badge reveal is-visible">
              <span className="hero__badge-dot"></span>
              Don&apos;t teach your AI twice.
            </div>

            <h1 className="hero__title reveal is-visible">
              A self-refining <span>Digital Twin</span>
              <br />
              that does the work for you.
            </h1>

            <p className="hero__copy reveal is-visible">
              Noumi remembers everything and gets the work done.
              <br />
              For the heavy-context professionals — PMs, journalists, and solution experts.
              <br />
              And for anyone done starting over.
            </p>

            <div className="hero__actions reveal is-visible">
              <Link
                className="button button--dark button--large"
                data-analytics-cta-id="home_hero_try_free"
                data-analytics-event="official_cta_clicked"
                data-analytics-placement="hero"
                data-analytics-target-path="/invite"
                href="/invite"
              >
                Try Free
                <span aria-hidden="true">→</span>
              </Link>
              <a className="button button--ghost button--large" href="#features">
                See How It Works
              </a>
            </div>
          </div>

          <div className="hero-visual container">
            <div className="hero-visual__wrap hero-stage parallax" data-parallax="18">
              <img
                alt="Pixel cat on the left side of the hero visual"
                className="hero-stage__left"
                src="/assets/materials/cat-left.webp"
              />
              <img
                alt="Main workspace window illustration"
                className="hero-stage__window"
                src="/assets/materials/main-window.webp"
              />
              <img
                alt="Pixel cat on the right side of the hero visual"
                className="hero-stage__right"
                src="/assets/materials/cat-right.webp"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="trusted-title" className="trusted reveal">
          <div className="container trusted__inner">
            <h2 className="trusted__label" id="trusted-title">
              Trusted by people from
            </h2>
            <div className="trusted__track-wrapper">
              <div className="trusted__track">
                {TRUSTED_LOGOS.map(([logo, alt]) => (
                  <div className="trusted__item" key={logo}>
                    <img alt={alt} src={`/assets/logos/${logo}`} />
                  </div>
                ))}
                {TRUSTED_LOGOS.map(([logo]) => (
                  <div
                    aria-hidden="true"
                    className="trusted__item trusted__item--decorative"
                    key={`dup-${logo}`}
                  >
                    <span
                      className="trusted__logo-copy"
                      style={{ backgroundImage: `url(/assets/logos/${logo})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="features container" id="features">
          <div className="feature-row reveal">
            <div className="feature-copy">
              <p className="feature-copy__eyebrow">01 — Feature</p>
              <h2>Persistent Memory</h2>
              <p>
                Tell Noumi once. It remembers for every conversation after. Your projects,
                preferences, and rules — always present, never re-explained.
              </p>
            </div>
            <article aria-label="Persistent Memory demo" className="stacked-demo tilt-card">
              <div className="demo-window demo-window--back">
                <span aria-hidden="true" className="demo-window__ink"></span>
                <h3 className="demo-window__label">Last Session</h3>
                <div className="demo-window__bubble demo-window__bubble--user">
                  Always export your output in Markdown format.
                </div>
                <div className="demo-window__bubble demo-window__bubble--ai">
                  Got it — I&apos;ve saved that as a default rule. Every output from here on will
                  be in Markdown.
                </div>
              </div>
              <div className="demo-window demo-window--front">
                <span aria-hidden="true" className="demo-window__ink"></span>
                <h3 className="demo-window__label">New Conversation · 3 Days Later</h3>
                <div className="demo-window__status">
                  <span className="dot dot--green"></span>
                  3 memory cards loaded automatically
                </div>
                <div className="demo-window__chip">Project: Noumi Website — Sprint 4</div>
                <div className="demo-window__chip">Style: Concise, no buzzwords, Oxford comma</div>
                <div className="demo-window__chip">Rule: Export in Markdown format</div>
                <div className="demo-window__reply">
                  Back to the website copy — want me to pick up where we left off on the Features
                  section?
                </div>
              </div>
            </article>
          </div>

          <div className="feature-row feature-row--reverse reveal">
            <article
              aria-label="Self-Evolving Skills demo"
              className="stacked-demo stacked-demo--skills tilt-card"
            >
              <div className="demo-window demo-window--back">
                <span aria-hidden="true" className="demo-window__ink"></span>
                <h3 className="demo-window__label">AI Output · First Draft</h3>
                <div className="demo-window__strike">
                  Our platform leverages synergistic cross-functional touchpoints to drive scalable
                  value across enterprise ecosystems.
                </div>
              </div>
              <div className="demo-window demo-window--front">
                <span aria-hidden="true" className="demo-window__ink"></span>
                <h3 className="demo-window__label">After Your Correction</h3>
                <div className="demo-window__clean">
                  Our platform helps teams work better together — from first contact to signed
                  contract.
                </div>
                <div className="demo-window__rule">
                  Rule saved: avoid business jargon · always active
                </div>
              </div>
            </article>
            <div className="feature-copy">
              <p className="feature-copy__eyebrow">02 — Feature</p>
              <h2>Self-Evolving Skills</h2>
              <p>
                Every correction becomes a rule. Your preferences become its defaults. Noumi learns
                from how you work — and applies it every time after.
              </p>
            </div>
          </div>

          <div className="feature-row reveal">
            <div className="feature-copy">
              <p className="feature-copy__eyebrow">03 — Feature</p>
              <h2>Agentic Execution</h2>
              <p>
                Set the task. Walk away. Come back to finished work. Noumi breaks down complex jobs,
                uses the right tools, and delivers while you focus on what matters.
              </p>
            </div>
            <article
              aria-label="Agentic Execution demo"
              className="stacked-demo stacked-demo--execution tilt-card"
            >
              <div className="demo-window demo-window--back">
                <span aria-hidden="true" className="demo-window__ink"></span>
                <h3 className="demo-window__label">Your Instruction</h3>
                <p className="demo-window__prompt">
                  &quot;Prepare the Q3 competitor analysis and format it as a slide deck.&quot;
                </p>
              </div>
              <div className="demo-window demo-window--front">
                <span aria-hidden="true" className="demo-window__ink"></span>
                <h3 className="demo-window__label">Running Now · Step 4 of 5</h3>
                <ol className="progress-list progress-list--demo">
                  <li className="is-done">Research 5 competitors via web search</li>
                  <li className="is-done">Pull pricing data and feature comparison</li>
                  <li className="is-done">Apply your slide template and brand colors</li>
                  <li className="is-active">Generating executive summary slide...</li>
                  <li>Export and share to Google Drive</li>
                </ol>
                <div className="progress-footer">
                  <span>Step 4 of 5</span>
                  <div aria-hidden="true" className="progress-bar">
                    <span></span>
                  </div>
                  <span>Est. 2 min</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="home-cta-band">
          <div className="home-cta-band__inner container reveal">
            <h2>
              <span className="home-cta-band__line home-cta-band__line--first">
                The longer you use Noumi,
              </span>
              <span className="home-cta-band__line home-cta-band__line--second">
                the less you have to explain.
              </span>
            </h2>
            <p className="reveal d1">Free to start. No credit card required.</p>
            <Link
              className="button button--light button--large reveal d2"
              data-analytics-cta-id="home_band_try_free"
              data-analytics-event="official_cta_clicked"
              data-analytics-placement="cta_band"
              data-analytics-target-path="/invite"
              href="/invite"
            >
              Start building your AI today
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <span aria-hidden="true" className="home-cta-band__cat" />
        </section>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
