import { createManagedMetadata, getManagedJsonLd } from '@/lib/site/managed-settings'
import { StructuredData } from '@/components/site/StructuredData'
import { ABOUT_PAGE_JSON_LD } from '@/lib/site/json-ld'
import { AboutFaq } from './AboutFaq'
import content from './prototype-content.json'
import styles from './about.module.css'

const title = 'We build tools for the people who know their Craft'

export function generateMetadata() {
  return createManagedMetadata({
    title: title + ' - Noumi',
    description: content.intro[0],
    pathname: '/about',
  })
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="redesign-kicker redesign-kicker--dark">
      <span aria-hidden="true" className="redesign-kicker__mark redesign-kicker__mark--left" />
      <span>{children}</span>
      <span aria-hidden="true" className="redesign-kicker__mark redesign-kicker__mark--right" />
    </p>
  )
}

/** Content snapshot deliberately follows about.html; legacy CMS records remain untouched. */
export default async function AboutPage() {
  return (
    <div className="page-body">
      <StructuredData
        data={await getManagedJsonLd('/about', {
          ...ABOUT_PAGE_JSON_LD,
          '@graph': ABOUT_PAGE_JSON_LD['@graph'].map((node) =>
            node['@type'] === 'AboutPage'
              ? { ...node, name: title, description: content.intro[0] }
              : node,
          ),
        })}
      />
      <main className={styles.page} data-about-prototype>
        <section className={styles.hero} data-about-motion="hero">
          <Kicker>Company Info</Kicker>
          <h1>
            We build tools for the people who know their <em>Craft</em>
          </h1>
        </section>
        <section className={styles.intro} data-about-motion="intro" aria-label="Our approach">
          {content.intro.map((paragraph, index) => {
            const emphasized = "the people who've spent years earning their judgment."
            return (
              <p key={paragraph}>
                {index === 0 && paragraph.endsWith(emphasized) ? (
                  <>
                    {paragraph.slice(0, -emphasized.length)}
                    <u>{emphasized}</u>
                  </>
                ) : (
                  paragraph
                )}
              </p>
            )
          })}
        </section>
        <section className={styles.team} id="team" aria-label="Core Crew">
          <div className={styles.teamHeading} data-about-motion="crew">
            <Kicker>Core Crew</Kicker>
          </div>
          <div className={styles.teamGrid} data-about-team>
            {content.team.map((member) => {
              const body = (
                <>
                  <div className={styles.portrait}>
                    <div data-about-motion="portrait">
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        width={500}
                        height={500}
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className={styles.overlay}
                      data-about-motion="overlay"
                    />
                  </div>
                  <div className={styles.memberCaption}>
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </>
              )
              return (
                <article className={styles.member} key={member.name}>
                  {member.href === '#' ? (
                    body
                  ) : (
                    <a href={member.href} target="_blank" rel="noopener noreferrer">
                      {body}
                    </a>
                  )}
                </article>
              )
            })}
          </div>
          <section className={styles.recruitment} aria-labelledby="join-h2">
            <div>
              <h2 id="join-h2" data-about-motion="join-title">
                Build the AI that actually works.
              </h2>
              <div
                className={styles.recruitmentCopy}
                data-about-motion="join-copy"
                dangerouslySetInnerHTML={{ __html: content.recruitment }}
              />
              <div className={styles.email} data-about-motion="email">
                <h3>Email :</h3>
                <a href="mailto:official@noumi.ai">official@noumi.ai</a>
              </div>
            </div>
            <img
              className={styles.teamPhoto}
              src="/assets/about/team.jpg"
              alt="Noumi team working together"
              loading="lazy"
            />
          </section>
        </section>
        <section className={styles.faqSection} aria-labelledby="about-faq-title">
          <div className={styles.faqHeading} data-about-motion="faq-heading">
            <Kicker>FAQ</Kicker>
            <h2 id="about-faq-title">Frequently Asked Questions</h2>
          </div>
          <AboutFaq />
        </section>
      </main>
    </div>
  )
}
