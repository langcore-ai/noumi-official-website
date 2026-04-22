import Link from 'next/link'

import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * Pricing 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Noumi Pricing — Start Free, Upgrade When Ready',
    description:
      'Simple, transparent pricing for Noumi. Try the Starter plan free for a month — no credit card required. Upgrade to Pro when Noumi earns it.',
    pathname: '/pricing/',
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

      <style>{`
        .pricing-hero { text-align: center; max-width: var(--max-w); margin: 0 auto; padding: 96px 48px 64px; }
        .pricing-hero h1 { font-family: var(--ff-display); font-size: clamp(40px, 5vw, 64px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; color: var(--ink); margin-bottom: 18px; }
        .pricing-hero p { font-size: 17px; font-weight: 300; color: var(--ink-soft); margin-bottom: 36px; }
        .plan-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 10px; }
        .plan-amount-strike { font-family: var(--ff-display); font-size: 48px; font-weight: 700; letter-spacing: -0.04em; color: var(--ink-muted); text-decoration: line-through; text-decoration-color: rgba(28,27,46,0.35); }
        .plan-trial-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(75,75,232,0.10); color: var(--accent); font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 100px; margin-bottom: 8px; }
        .plan-trial-badge::before { content: '✦'; font-size: 9px; }
        .plan-grid { max-width: 1160px; margin: 0 auto; padding: 0 48px 96px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        .plan-card { background: var(--cream-mid); border: 1px solid var(--border-med); border-radius: 18px; padding: 40px 36px; transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease, border-color 0.28s ease; will-change: transform; }
        .plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 56px rgba(28,27,46,0.11); border-color: rgba(75,75,232,0.22); }
        .plan-card.featured { background: var(--ink); border-color: transparent; position: relative; transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease; }
        .plan-card.featured:hover { transform: translateY(-6px); box-shadow: 0 24px 64px rgba(28,27,46,0.22); border-color: transparent; }
        .plan-badge { display: inline-block; font-size: 10.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.10em; background: rgba(75,75,232,0.18); color: var(--accent-soft); padding: 4px 12px; border-radius: 100px; margin-bottom: 20px; }
        .plan-name { font-family: var(--ff-display); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 8px; }
        .plan-card.featured .plan-name { color: var(--cream); }
        .plan-desc { font-size: 14px; font-weight: 300; color: var(--ink-muted); margin-bottom: 28px; line-height: 1.55; }
        .plan-card.featured .plan-desc { color: rgba(245,240,232,0.50); }
        .plan-price { margin-bottom: 32px; }
        .plan-amount { font-family: var(--ff-display); font-size: 48px; font-weight: 700; letter-spacing: -0.04em; color: var(--ink); }
        .plan-card.featured .plan-amount { color: var(--cream); }
        .plan-period { font-size: 14px; color: var(--ink-muted); margin-left: 4px; }
        .plan-card.featured .plan-period { color: rgba(245,240,232,0.40); }
        .plan-cta { display: block; text-align: center; padding: 13px; border-radius: 9px; font-size: 14.5px; font-weight: 500; margin-bottom: 32px; transition: background 0.2s, transform 0.15s; }
        .plan-card:not(.featured) .plan-cta { background: var(--ink); color: var(--cream); }
        .plan-card:not(.featured) .plan-cta:hover { background: var(--ink-soft); transform: translateY(-1px); }
        .plan-card.featured .plan-cta { background: var(--cream); color: var(--ink); }
        .plan-card.featured .plan-cta:hover { background: var(--cream-mid); transform: translateY(-1px); }
        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .plan-features li { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; }
        .plan-card.featured .plan-features li { color: rgba(245,240,232,0.65); }
        .plan-features li::before { content: '✓'; color: var(--accent); font-size: 12px; font-weight: 600; flex-shrink: 0; margin-top: 1px; }
        .plan-card.featured .plan-features li::before { color: var(--accent-soft); }
        .plan-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0; }
        .plan-card:not(.featured) .plan-divider { border-color: var(--border); }
        .pricing-faq { max-width: 640px; margin: 0 auto; padding: 0 48px 96px; }
        .pricing-faq h3 { font-family: var(--ff-display); font-size: 24px; font-weight: 700; color: var(--ink); margin-bottom: 32px; letter-spacing: -0.02em; }
        .pfaq-item { border-bottom: 1px solid var(--border); padding: 20px 0; }
        .pfaq-q { font-size: 15px; font-weight: 500; color: var(--ink); margin-bottom: 10px; }
        .pfaq-a { font-size: 14.5px; font-weight: 300; color: var(--ink-soft); line-height: 1.72; }
        .pfaq-a a { color: var(--accent); }
        .pricing-cta { text-align: center; padding-bottom: 96px; }
        .pricing-cta h2 { font-size: clamp(22px, 3vw, 44px) !important; max-width: 760px !important; }
        .pricing-cta h2 em { white-space: nowrap; }
        @media (max-width: 960px) { .plan-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 720px) { .plan-grid { grid-template-columns: 1fr; padding: 0 24px 72px; } .pricing-hero { padding: 72px 24px 48px; } .pricing-faq, .pricing-cta { padding-left: 24px; padding-right: 24px; } }
      `}</style>

      <section className="pricing-hero">
        <h1 className="reveal">Simple, transparent pricing.</h1>
        <p className="reveal d1">Start free. Upgrade when Noumi earns it.</p>
      </section>

      <section className="plan-grid">
        <article className="plan-card reveal">
          <h2 className="plan-name">Starter</h2>
          <p className="plan-desc">
            Enough to build real habits — memory, skills, and a light system to manage the work
            that repeats.
          </p>
          <div className="plan-price">
            <div className="plan-price-row">
              <span className="plan-amount-strike">$20</span>
              <span className="plan-period">/ month</span>
            </div>
            <div className="plan-trial-badge">Free for 1 month</div>
          </div>
          <Link className="plan-cta" href="/invite/">Start free →</Link>
          <ul className="plan-features">
            <li>1,200 points / month</li>
            <li>Claude Sonnet model</li>
            <li>1 Light System</li>
            <li>Built-in skills (standard set)</li>
            <li>Persistent Memory</li>
            <li>Community support</li>
          </ul>
        </article>

        <article className="plan-card featured reveal d1">
          <span className="plan-badge">Full power</span>
          <h2 className="plan-name">Pro</h2>
          <p className="plan-desc">
            For those who rely on Noumi daily — more capacity, smarter models, and skills tuned to
            your actual workflow.
          </p>
          <div className="plan-price">
            <span className="plan-amount">$100</span>
            <span className="plan-period">/ month</span>
          </div>
          <Link className="plan-cta" href="/invite/">Get started →</Link>
          <ul className="plan-features">
            <li>6,000 points / month</li>
            <li>Claude Sonnet + Opus models</li>
            <li>5 Light Systems</li>
            <li>Business scenario skills</li>
            <li>Persistent Memory (unlimited)</li>
            <li>Self-Evolving Skills</li>
            <li>Agentic task execution</li>
            <li>Conversation history (unlimited)</li>
            <hr className="plan-divider" />
            <li>Priority support</li>
            <li>Early access to new features</li>
          </ul>
        </article>

        <article
          className="plan-card reveal d2"
          style={{ borderColor: 'rgba(75,75,232,0.28)', background: 'var(--cream)' }}
        >
          <span
            className="plan-badge"
            style={{ background: 'rgba(75,75,232,0.10)', color: 'var(--accent)' }}
          >
            For teams
          </span>
          <h2 className="plan-name">Team</h2>
          <p className="plan-desc">
            Shared memory, collective skills, and a workspace your whole team can build on —
            together.
          </p>
          <div className="plan-price" style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Custom pricing
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 300 }}>
              Based on team size &amp; usage
            </div>
          </div>
          <a
            className="plan-cta"
            href="mailto:sales@noumi.ai"
            style={{ background: 'var(--accent)', color: '#fff', cursor: 'pointer', lineHeight: 1.4 }}
          >
            <div style={{ fontWeight: 500, fontSize: 14.5 }}>Contact Sales</div>
            <div style={{ fontSize: 12.5, opacity: 0.82, marginTop: 2 }}>sales@noumi.ai</div>
          </a>
          <ul className="plan-features">
            <li>Everything in Pro</li>
            <li>Multiple seats &amp; shared workspace</li>
            <li>Shared team memory &amp; skills</li>
            <li>Admin dashboard &amp; access controls</li>
            <li>Onboarding &amp; setup support</li>
            <hr className="plan-divider" style={{ borderColor: 'var(--border)' }} />
            <li>Dedicated account manager</li>
            <li>SLA &amp; priority response</li>
          </ul>
        </article>
      </section>

      <section className="pricing-faq reveal">
        <h3>Common questions</h3>

        <div className="pfaq-item">
          <h3 className="pfaq-q">Is the trial really free?</h3>
          <p className="pfaq-a">
            Yes, completely. We&apos;re currently inviting early users to try Noumi for a full
            month — no credit card, no catch. We&apos;d love to hear what you think.
          </p>
        </div>

        <div className="pfaq-item">
          <h3 className="pfaq-q">Can I cancel anytime?</h3>
          <p className="pfaq-a">
            Yes. Cancel from Account Settings before your next billing date and you won&apos;t be
            charged again. Your workspace and memory are preserved until the end of the paid
            period.
          </p>
        </div>

        <div className="pfaq-item">
          <h3 className="pfaq-q">What happens to my data if I downgrade?</h3>
          <p className="pfaq-a">
            Your memory and workspace files are preserved. If you exceed the free plan&apos;s
            limits, you&apos;ll need to upgrade again to access the excess items — but nothing is
            deleted automatically.
          </p>
        </div>
      </section>

      <section className="pricing-cta cta-band" aria-labelledby="pricing-cta">
        <h2 className="reveal" id="pricing-cta">
          Every session makes
          <br />
          Noumi <em>more yours.</em>
        </h2>
        <p className="reveal d1">Start free. Your first session is already a head start.</p>
        <Link className="btn-cream reveal d2" href="/invite/">
          Try Noumi Free →
        </Link>
      </section>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
