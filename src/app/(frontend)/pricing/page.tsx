import Link from 'next/link'

import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './pricing.module.css'

/**
 * Pricing 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Noumi Pricing — Start Free, Upgrade When Ready',
    description:
      'Simple, transparent pricing for Noumi. Try the Starter plan free for a month — no credit card required. Upgrade to Pro when Noumi earns it.',
    pathname: '/pricing',
  })
}

/**
 * Pricing 页面
 * @returns Pricing 内容
 */
export default async function PricingPage() {
  const useCases = await getOfficialUseCaseNavItems()

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <section className={styles.pricingHero}>
        <h1 className="reveal">Simple, transparent pricing.</h1>
        <p className="reveal d1">Start free. Upgrade when Noumi earns it.</p>
      </section>

      <section className={styles.planGrid}>
        <article className={`${styles.planCard} reveal`}>
          <h2 className={styles.planName}>Starter</h2>
          <p className={styles.planDesc}>
            Enough to build real habits — memory, skills, and a light system to manage the work
            that repeats.
          </p>
          <div className={styles.planPrice}>
            <div className={styles.priceRow}>
              <span className={styles.amountStrike}>$20</span>
              <span className={styles.period}>/ month</span>
            </div>
            <div className={styles.trialBadge}>Free for 1 month</div>
          </div>
          <Link className={styles.planCta} href="/invite">Start free →</Link>
          <ul className={styles.planFeatures}>
            <li>1,200 points / month</li>
            <li>Claude Sonnet model</li>
            <li>1 Light System</li>
            <li>Built-in skills (standard set)</li>
            <li>Persistent Memory</li>
            <li>Community support</li>
          </ul>
        </article>

        <article className={`${styles.planCard} ${styles.featured} reveal d1`}>
          <span className={styles.planBadge}>Full power</span>
          <h2 className={styles.planName}>Pro</h2>
          <p className={styles.planDesc}>
            For those who rely on Noumi daily — more capacity, smarter models, and skills tuned to
            your actual workflow.
          </p>
          <div className={styles.planPrice}>
            <span className={styles.amount}>$100</span>
            <span className={styles.period}>/ month</span>
          </div>
          <Link className={styles.planCta} href="/invite">Get started →</Link>
          <ul className={styles.planFeatures}>
            <li>6,000 points / month</li>
            <li>Claude Sonnet + Opus models</li>
            <li>5 Light Systems</li>
            <li>Business scenario skills</li>
            <li>Persistent Memory (unlimited)</li>
            <li>Self-Evolving Skills</li>
            <li>Agentic task execution</li>
            <li>Conversation history (unlimited)</li>
            <hr className={styles.planDivider} />
            <li>Priority support</li>
            <li>Early access to new features</li>
          </ul>
        </article>

        <article className={`${styles.planCard} ${styles.teamCard} reveal d2`}>
          <span className={`${styles.planBadge} ${styles.teamBadge}`}>
            For teams
          </span>
          <h2 className={styles.planName}>Team</h2>
          <p className={styles.planDesc}>
            Shared memory, collective skills, and a workspace your whole team can build on —
            together.
          </p>
          <div className={styles.planPrice}>
            <div className={styles.customPrice}>
              Custom pricing
            </div>
            <div className={styles.customPriceNote}>
              Based on team size &amp; usage
            </div>
          </div>
          <a
            className={`${styles.planCta} ${styles.salesCta}`}
            href="mailto:sales@noumi.ai"
          >
            <div className={styles.salesCtaTitle}>Contact Sales</div>
            <div className={styles.salesCtaEmail}>sales@noumi.ai</div>
          </a>
          <ul className={styles.planFeatures}>
            <li>Everything in Pro</li>
            <li>Multiple seats &amp; shared workspace</li>
            <li>Shared team memory &amp; skills</li>
            <li>Admin dashboard &amp; access controls</li>
            <li>Onboarding &amp; setup support</li>
            <hr className={`${styles.planDivider} ${styles.teamDivider}`} />
            <li>Dedicated account manager</li>
            <li>SLA &amp; priority response</li>
          </ul>
        </article>
      </section>

      <section className={`${styles.pricingFaq} reveal`}>
        <h3>Common questions</h3>

        <div className={styles.faqItem}>
          <h3 className={styles.faqQuestion}>Is the trial really free?</h3>
          <p className={styles.faqAnswer}>
            Yes, completely. We&apos;re currently inviting early users to try Noumi for a full
            month — no credit card, no catch. We&apos;d love to hear what you think.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.faqQuestion}>Can I cancel anytime?</h3>
          <p className={styles.faqAnswer}>
            Yes. Cancel from Account Settings before your next billing date and you won&apos;t be
            charged again. Your workspace and memory are preserved until the end of the paid
            period.
          </p>
        </div>

        <div className={styles.faqItem}>
          <h3 className={styles.faqQuestion}>What happens to my data if I downgrade?</h3>
          <p className={styles.faqAnswer}>
            Your memory and workspace files are preserved. If you exceed the free plan&apos;s
            limits, you&apos;ll need to upgrade again to access the excess items — but nothing is
            deleted automatically.
          </p>
        </div>
      </section>

      <section className={`${styles.pricingCta} cta-band`} aria-labelledby="pricing-cta">
        <h2 className="reveal" id="pricing-cta">
          Every session makes
          <br />
          Noumi <em>more yours.</em>
        </h2>
        <p className="reveal d1">Start free. Your first session is already a head start.</p>
        <Link className="btn-cream reveal d2" href="/invite">
          Try Noumi Free →
        </Link>
      </section>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
