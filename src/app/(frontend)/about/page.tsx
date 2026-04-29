import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './about.module.css'

/**
 * About 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'About Noumi — We Believe AI Should Know You Better Over Time',
    description:
      'We believe your AI should get smarter every time you use it — not reset. Learn why we built Noumi and what it means to have an AI that truly learns how you work.',
    pathname: '/about',
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

      <section aria-labelledby="belief-h1" className={styles.belief}>
        <h1 className="reveal" id="belief-h1">
          We believe your AI should get
          <br />
          <em>smarter</em> every time you use it.
        </h1>
        <p className="reveal d1">Not reset. Not forget. Not make you explain yourself again.</p>
      </section>

      <section aria-labelledby="origin-h2" className={`${styles.aboutSection} reveal`}>
        <h2 id="origin-h2">Why we built Noumi</h2>
        <h3 className={styles.screenReaderOnly}>The problem with AI today</h3>
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

      <hr className={styles.aboutDivider} />

      <section aria-labelledby="team-h2" className={`${styles.aboutSection} reveal`}>
        <h2 id="team-h2">Who we are</h2>
        <h3 className={styles.screenReaderOnly}>The team behind Noumi</h3>
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

      <section aria-labelledby="about-cta" className={`${styles.aboutCta} cta-band`}>
        <h2 className="reveal" id="about-cta">
          The longer you use Noumi,
          <br />
          the <em>less you have to explain.</em>
        </h2>
        <p className="reveal d1">Free to start. No credit card required.</p>
        <a
          className="btn-cream reveal d2"
          data-analytics-cta-id="about_band_try_free"
          data-analytics-event="official_cta_clicked"
          data-analytics-placement="cta_band"
          data-analytics-target-path="/invite"
          href="/invite"
        >
          Start building your AI today →
        </a>
      </section>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
