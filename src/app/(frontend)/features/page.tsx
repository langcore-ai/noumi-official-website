import Link from 'next/link'

import { StructuredData } from '@/components/site/StructuredData'
import {
  OfficialHomeFooter,
  OfficialHomeHeader,
} from '@/components/site/official/OfficialHomeChrome'
import {
  getOfficialFeaturesPage,
  getOfficialUseCaseNavItems,
  type OfficialFeatureCardTone,
  type OfficialUseCasesCardTone,
} from '@/lib/site/official-cms'
import {
  FEATURES_FAQ_JSON_LD,
  FEATURES_PAGE_JSON_LD,
  OFFICIAL_JSON_LD_PAGE_META,
} from '@/lib/site/json-ld'
import { createOfficialMetadata } from '@/lib/site/official-site'

import { FeaturesFaq } from './FeaturesFaq'
import styles from './features.module.css'

/** 第三屏固定步骤，按迁移要求不进入 CMS。 */
const HOW_STEPS = [
  {
    number: '01',
    title: 'Describe what you need',
    description:
      'Type your task in plain language — no special commands, no structured input. Include context, files, and any preferences directly in the message.',
    example:
      '"Write a Q2 SaaS market analysis. Use this file for context. Save it in the Q2 folder."',
  },
  {
    number: '02',
    title: 'Noumi plans and executes',
    description:
      'It builds a step-by-step plan, confirms intent, then works through each step — searching, reading, generating, saving — while you focus on something else.',
    boxLabel: "Noumi's to do list",
    rows: [
      'Search web: Q2 SaaS market reports (2024–2025)',
      'Read and cross-reference context file',
      'Draft executive summary + analysis sections',
      'Save as "Q2-SaaS-Report.md" → /Q2 folder',
    ],
  },
  {
    number: '03',
    title: 'Every task makes the next one smarter',
    description:
      'Noumi records what you corrected, what worked, and what you preferred — building a persistent profile that already knows how you operate before you even start.',
    boxLabel: 'Captured from this task',
    checks: [
      'Always lead reports with executive summary',
      'Save output to /Q2 folder automatically',
      'Preferred tone: concise, data-led',
    ],
  },
] as const

/** 首屏功能卡样式映射。 */
const FEATURE_CARD_CLASS_BY_TONE: Record<OfficialFeatureCardTone, string> = {
  execution: styles.featCardExecution,
  memory: styles.featCardMemory,
  skills: styles.featCardSkills,
}

/** Use Case 卡片样式映射。 */
const ROLE_CARD_CLASS_BY_TONE: Record<OfficialUseCasesCardTone, string> = {
  journalist: styles.ucCardJournalist,
  pm: styles.ucCardPm,
  solutions: styles.ucCardSolutions,
}

/** Use Case 头像样式映射。 */
const ROLE_AVATAR_CLASS_BY_TONE: Record<OfficialUseCasesCardTone, string> = {
  journalist: styles.ucAvatarJournalist,
  pm: styles.ucAvatarPm,
  solutions: styles.ucAvatarSolutions,
}

/**
 * Features 页面 metadata
 */
export async function generateMetadata() {
  const page = await getOfficialFeaturesPage()
  const meta = OFFICIAL_JSON_LD_PAGE_META.features

  return createOfficialMetadata({
    title: meta.title,
    description: meta.description,
    image: page.ogImage?.url,
    pathname: meta.pathname,
  })
}

/**
 * Features 页面
 * @returns Features 页面内容
 */
export default async function FeaturesPage() {
  const [page, useCases] = await Promise.all([
    getOfficialFeaturesPage(),
    getOfficialUseCaseNavItems(),
  ])

  return (
    <div className="page-body">
      <StructuredData data={FEATURES_PAGE_JSON_LD} />
      <StructuredData data={FEATURES_FAQ_JSON_LD} />
      <OfficialHomeHeader useCases={useCases} />

      <main className={styles.featuresPage}>
        <section aria-label="Core features" className={`${styles.sec} ${styles.secFeatures}`}>
          <div className={styles.secInner}>
            <div className={`${styles.secHead} ${styles.secHeadHero} reveal`}>
              <div className={styles.heroCat}>
                <img alt="" aria-hidden="true" src="/assets/features/title-cat.webp" />
              </div>
              <span className="sec-label">Everything Noumi Can Do</span>
              <h1>
                The AI that remembers, executes, <em>evolves</em>.
              </h1>
              <p>
                Three systems working as one — context that never disappears, tasks that run
                end-to-end, and skills that build with every use.
              </p>
            </div>

            <div className={styles.featGrid}>
              {page.featureCards.map((card, index) => (
                <article
                  className={`${styles.featCard} ${FEATURE_CARD_CLASS_BY_TONE[card.tone]} reveal d${Math.min(index + 1, 4)}`}
                  key={card.id}
                >
                  <div className={styles.featCardTop} />
                  <div className={styles.featCardBody}>
                    <h3>{card.title}</h3>
                    <p className={styles.featCardDesc}>{card.description}</p>
                    <ul className={styles.featCardList}>
                      {card.supportedFeatures.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <Link className={styles.featCardCta} href={card.cta.href}>
                      {card.cta.label}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Capabilities" className={`${styles.sec} ${styles.secAbilities}`}>
          <div className={styles.secInner}>
            <div className={`${styles.secHead} reveal`}>
              <span className="sec-label">What You Can Do</span>
              <h2>From raw inputs to finished work.</h2>
              <p>Research, writing, documents, and automation — all handled.</p>
            </div>

            <div className={styles.abilityGrid}>
              {page.abilityCards.map((card, index) => (
                <article
                  className={`${styles.abilityCard} reveal d${Math.min((index % 4) + 1, 4)}`}
                  key={card.id}
                >
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className={styles.abilityTags}>
                    {card.tags.map((tag) => (
                      <span className={styles.abilityTag} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="How it works" className={`${styles.sec} ${styles.secHow}`}>
          <div className={styles.secInner}>
            <div className={`${styles.secHead} reveal`}>
              <span className="sec-label">How It Works</span>
              <h2>Set the task. Come back to finished work.</h2>
              <p>No prompts to engineer. No steps to manage.</p>
            </div>

            <div className={styles.howSteps}>
              {HOW_STEPS.map((step, index) => (
                <div className={`${styles.howStep} reveal d${index + 1}`} key={step.number}>
                  <div className={styles.howNum}>{step.number}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    {'example' in step ? (
                      <em className={styles.howStepExample}>{step.example}</em>
                    ) : null}
                    {'rows' in step ? (
                      <div className={styles.howStepBox}>
                        <span className={styles.howBoxLabel}>{step.boxLabel}</span>
                        {step.rows.map((row, rowIndex) => (
                          <div className={styles.howBoxRow} key={row}>
                            <span className={styles.howBoxNumber}>{rowIndex + 1}.</span>
                            {row}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {'checks' in step ? (
                      <div className={styles.howStepBox}>
                        <span className={styles.howBoxLabel}>{step.boxLabel}</span>
                        {step.checks.map((row) => (
                          <div className={styles.howBoxRow} key={row}>
                            <span className={styles.howBoxCheck}>✓</span>
                            {row}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Built for your role" className={`${styles.sec} ${styles.secRoles}`}>
          <div className={styles.secInner}>
            <div className={`${styles.secHead} reveal`}>
              <span className="sec-label">Built for Your Role</span>
              <h2>The same capabilities, applied to real work.</h2>
              <p>See how Noumi fits the way you already operate.</p>
            </div>

            <div className={styles.ucGrid}>
              {page.roleCards.map((card, index) => (
                <Link
                  className={`${styles.ucCard} ${ROLE_CARD_CLASS_BY_TONE[card.tone]} reveal d${Math.min(index + 1, 4)}`}
                  href={card.href}
                  key={card.id}
                >
                  <div className={styles.ucCardBody}>
                    <div
                      aria-hidden="true"
                      className={`${styles.ucAvatar} ${ROLE_AVATAR_CLASS_BY_TONE[card.tone]}`}
                    >
                      <img alt="" src={card.avatarSrc} />
                    </div>
                    <div className={styles.ucCardText}>
                      <h2 className={styles.ucCardTitle}>{card.title}</h2>
                      <p className={styles.ucCardDesc}>{card.description}</p>
                      <div className={styles.ucCardCta}>{card.ctaLabel}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className={`${styles.ucAllLink} reveal`}>
              <Link href="/use-cases">See all use cases →</Link>
            </div>
          </div>
        </section>

        <section aria-label="FAQ" className={`${styles.sec} ${styles.secFaq}`}>
          <div className={styles.secInner}>
            <div className={`${styles.secHead} reveal`}>
              <span className="sec-label">FAQ</span>
              <h2>Things you might want to know.</h2>
              <p>Everything you wanted to know before getting started with Noumi.</p>
            </div>

            <FeaturesFaq items={page.faqItems} />
          </div>
        </section>
      </main>

      <section aria-label="Call to action" className={styles.ctaBand}>
        <img
          alt=""
          aria-hidden="true"
          className={styles.ctaBandImg}
          src="/assets/use-cases/use-cases.webp"
        />
        <h2>
          Your AI work colleague.
          <br />
          <em>Start building it today.</em>
        </h2>
        <p>Free to start. No credit card required.</p>
        <Link className={`btn-cream ${styles.ctaBandBtn}`} href="/invite">
          Start building your AI today →
        </Link>
      </section>

      <OfficialHomeFooter
        features={page.featureCards.map((card) => ({
          label: card.title,
          href: card.cta.href,
        }))}
        useCases={useCases}
      />
    </div>
  )
}
