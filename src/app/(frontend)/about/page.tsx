import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * About 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'About Noumi — We Believe AI Should Know You Better Over Time',
    description:
      'We believe your AI should get smarter every time you use it — not reset. Learn why we built Noumi and what it means to have an AI that truly learns how you work.',
    pathname: '/about/',
  })
}

/**
 * About 页面
 * @returns About 页面
 */
export default async function AboutPage() {
  const useCases = await getOfficialUseCaseNavItems()

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <style>{`
        .about-belief { background: var(--ink); padding: 160px 48px 128px; text-align: center; }
        .about-belief h1 { font-family: var(--ff-display); font-size: clamp(26px, 3.2vw, 46px); font-weight: 700; line-height: 1.15; letter-spacing: -0.03em; color: var(--cream); max-width: 960px; margin: 0 auto 24px; }
        .about-belief h1 em { font-style: italic; color: var(--accent-soft); }
        .about-belief p { font-size: 18px; color: rgba(245,240,232,0.48); font-weight: 300; }
        .about-section { max-width: 720px; margin: 0 auto; padding: 96px 48px; }
        .about-section h2 { font-family: var(--ff-display); font-size: clamp(26px, 3vw, 42px); font-weight: 700; letter-spacing: -0.025em; line-height: 1.15; color: var(--ink); margin-bottom: 40px; }
        .about-section p { font-size: 17px; font-weight: 300; color: var(--ink-soft); line-height: 1.88; margin-bottom: 22px; }
        .about-section p:last-child { margin-bottom: 0; }
        .about-section a { color: var(--accent); }
        .about-divider { border: none; border-top: 1px solid var(--border); max-width: 720px; margin: 0 auto; padding: 0 48px; }
        .cta-band h2 { font-size: clamp(22px, 3vw, 44px) !important; max-width: 760px !important; }
        .cta-band h2 em { white-space: nowrap; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (max-width: 960px) { .about-belief { padding: 120px 24px 96px; } .about-section { padding: 72px 24px; } }
        @media (max-width: 600px) { .about-belief { padding: 100px 20px 72px; } .about-section { padding: 56px 20px; } }
      `}</style>

      <section aria-labelledby="belief-h1" className="about-belief">
        <h1 className="reveal" id="belief-h1">
          We believe your AI should get
          <br />
          <em>smarter</em> every time you use it.
        </h1>
        <p className="reveal d1">Not reset. Not forget. Not make you explain yourself again.</p>
      </section>

      <section aria-labelledby="origin-h2" className="about-section reveal">
        <h2 id="origin-h2">Why we built Noumi</h2>
        <h3 className="sr-only">The problem with AI today</h3>
        <p>Most AI tools treat every conversation like the first one.</p>
        <p>
          You paste the same context. You correct the same mistakes. You explain the same
          preferences. Again, and again, and again.
        </p>
        <p>
          We built Noumi because the real problem isn&apos;t intelligence — it&apos;s memory. An AI
          that can&apos;t remember who you are can&apos;t actually work for you.
        </p>
        <p>
          Every interaction with Noumi is an investment. The longer you use it, the more it knows
          your work, your rules, and your standards. That&apos;s not a feature. That&apos;s the point.
        </p>
      </section>

      <hr className="about-divider" />

      <section aria-labelledby="team-h2" className="about-section reveal">
        <h2 id="team-h2">Who we are</h2>
        <h3 className="sr-only">The team behind Noumi</h3>
        <p>
          Noumi is built by a small startup. Our team is made up of engineers, researchers, and
          builders who think deeply about how AI can actually fit into the way people work — not
          just how it looks in a demo.
        </p>
        <p>
          If you&apos;re the kind of person who&apos;d rather build the future than watch it happen,
          reach out at <a href="mailto:hr@noumi.ai">hr@noumi.ai</a>.
        </p>
      </section>

      <section aria-labelledby="about-cta" className="cta-band">
        <h2 className="reveal" id="about-cta">
          The longer you use Noumi,
          <br />
          the <em>less you have to explain.</em>
        </h2>
        <p className="reveal d1">Free to start. No credit card required.</p>
        <a className="btn-cream reveal d2" href="/invite/">
          Start building your AI today →
        </a>
      </section>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
