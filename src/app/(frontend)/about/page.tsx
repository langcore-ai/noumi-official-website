import { StructuredData } from '@/components/site/StructuredData'
import {
  OfficialHomeFooter,
  OfficialHomeHeader,
} from '@/components/site/official/OfficialHomeChrome'
import { getOfficialAboutPage, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { ABOUT_PAGE_JSON_LD, OFFICIAL_JSON_LD_PAGE_META } from '@/lib/site/json-ld'
import {
  createOfficialMetadata,
  OFFICIAL_PRODUCT_AUTH_TARGET_PATH,
  OFFICIAL_PRODUCT_AUTH_URL,
} from '@/lib/site/official-site'

import { AboutFaq, AboutTeamCarousel } from './AboutInteractiveSections'
import styles from './about.module.css'

/**
 * About 页面 metadata。
 */
export async function generateMetadata() {
  const meta = OFFICIAL_JSON_LD_PAGE_META.about

  return createOfficialMetadata({
    title: meta.title,
    description: meta.description,
    pathname: meta.pathname,
  })
}

/**
 * 判断 FAQ 区块是否有可渲染内容。
 * @param page About 页面 CMS 视图
 * @returns 是否展示 FAQ 区块
 */
function hasFaqSection(page: Awaited<ReturnType<typeof getOfficialAboutPage>>): boolean {
  return Boolean(
    page.faqEyebrow || page.faqTitle || page.faqDescription || page.faqItems.length > 0,
  )
}

/**
 * About 页面。
 * @returns About 页面
 */
export default async function AboutPage() {
  const [page, useCases] = await Promise.all([getOfficialAboutPage(), getOfficialUseCaseNavItems()])
  const showTeam = page.teamMembers.length > 0
  const showFaq = hasFaqSection(page)
  const showFaqHeader = Boolean(page.faqEyebrow || page.faqTitle || page.faqDescription)

  return (
    <div className="page-body">
      <StructuredData data={ABOUT_PAGE_JSON_LD} />
      <OfficialHomeHeader useCases={useCases} />

      <main className={styles.aboutPage}>
        <section aria-labelledby="belief-h1" className={styles.belief}>
          <span className={`${styles.beliefLabel} sec-label reveal`}>Our Story</span>
          <h1 className="reveal d1" id="belief-h1">
            We believe your AI should get
            <br />
            <em>smarter</em> every time you use it.
          </h1>
          <p className="reveal d2">Not reset. Not forget. Not make you explain yourself again.</p>
        </section>

        <section aria-labelledby="origin-h2" className={`${styles.origin} reveal`}>
          <span className="sec-label">Why we built Noumi</span>
          <h2 id="origin-h2">The problem no one was solving.</h2>
          <h3 className={styles.screenReaderOnly}>The problem with AI today</h3>
          <p>Most AI tools treat every conversation like the first one.</p>
          <p>
            You paste the same context. You correct the same mistakes. You explain the same
            preferences. Again, and again, and again.
          </p>
          <p>
            We built Noumi because the real problem isn&apos;t intelligence — it&apos;s memory. An
            AI that can&apos;t remember who you are can&apos;t actually work for you.
          </p>
          <p>
            Every interaction with Noumi is an investment. The longer you use it, the more it knows
            your work, your rules, and your standards. That&apos;s not a feature. That&apos;s the
            point.
          </p>
        </section>

        <hr className={styles.divider} />

        {showTeam ? (
          <>
            <section aria-labelledby="team-h2" className={styles.teamSection}>
              <div className={styles.teamHeader}>
                <span className="sec-label reveal">Who we are</span>
                <h2 className="reveal d1" id="team-h2">
                  Meet Our Founders<em>.</em>
                </h2>
                <p className="reveal d2">
                  Operators, researchers, and AI obsessives building the future of how humans and AI
                  work together.
                </p>
              </div>

              <AboutTeamCarousel members={page.teamMembers} />
            </section>

            <hr className={styles.divider} />
          </>
        ) : null}

        <section aria-labelledby="join-h2" className={`${styles.joinSection} reveal`}>
          <span className="sec-label">Join us</span>
          <h2 id="join-h2">
            Build the AI that <em>actually works.</em>
          </h2>
          <p>
            We&apos;re a small team of operators, researchers, and AI obsessives — most of us have
            built and scaled products before. We move fast, care deeply about craft, and believe
            we&apos;re working on one of the most interesting problems in AI right now.
          </p>
          <p>
            We&apos;re always looking for people who want to help define what an AI colleague
            actually looks like. What matters to us isn&apos;t credentials — it&apos;s conviction,
            judgment, and a drive to build things that genuinely work.
          </p>
          <p>
            If you see something we&apos;re missing, or just want to be part of what we&apos;re
            building, write to us. Tell us what you&apos;d bring and why it matters to you. We read
            everything.
          </p>
          <div className={styles.joinCta}>
            <a className={styles.joinMailto} href="mailto:official@noumi.ai">
              <span className={styles.joinMailtoLabel}>Join us</span>
              <span className={styles.joinMailtoAddr}>official@noumi.ai →</span>
            </a>
          </div>
        </section>

        {showFaq ? (
          <>
            <hr className={styles.divider} />

            <section
              aria-label={page.faqTitle ? undefined : 'FAQ'}
              aria-labelledby={page.faqTitle ? 'faq-h2' : undefined}
              className={styles.faqSection}
            >
              <div className={styles.faqInner}>
                {showFaqHeader ? (
                  <div className={styles.faqHeader}>
                    {page.faqEyebrow ? (
                      <span className="sec-label reveal">{page.faqEyebrow}</span>
                    ) : null}
                    {page.faqTitle ? (
                      <h2 className="reveal d1" id="faq-h2">
                        {page.faqTitle}
                      </h2>
                    ) : null}
                    {page.faqDescription ? (
                      <p className="reveal d2">{page.faqDescription}</p>
                    ) : null}
                  </div>
                ) : null}

                {page.faqItems.length > 0 ? <AboutFaq items={page.faqItems} /> : null}
              </div>
            </section>
          </>
        ) : null}

        <section
          aria-labelledby="about-cta"
          className={`${styles.aboutCta} cta-band official-cta-band`}
        >
          <h2 className="reveal" id="about-cta">
            The longer you use Noumi,
            <br />
            the <em>less you have to explain.</em>
          </h2>
          <p className="reveal d1">Free to start. No credit card required.</p>
          <a
            className="btn-cream official-cta-button reveal d2"
            data-analytics-cta-id="about_band_try_free"
            data-analytics-event="official_cta_clicked"
            data-analytics-placement="cta_band"
            data-analytics-target-path={OFFICIAL_PRODUCT_AUTH_TARGET_PATH}
            href={OFFICIAL_PRODUCT_AUTH_URL}
          >
            Start building your AI today →
          </a>
        </section>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
