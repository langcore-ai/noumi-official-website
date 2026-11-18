import { SecurityContents } from './SecurityContents'
import { createManagedMetadata } from '@/lib/site/managed-settings'
import content from './content.json'
import styles from './security.module.css'

export function generateMetadata() {
  return createManagedMetadata({
    title: 'Security & Compliance — Noumi',
    description:
      'How Noumi protects user data: infrastructure, isolation, encryption, and compliance.',
    pathname: '/security',
  })
}

export default function SecurityPage() {
  return (
    <div className="page-body">
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="security-title">
          <svg className={styles.lock} viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect
              x="15"
              y="27"
              width="34"
              height="29"
              rx="7"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M22 27V19a10 10 0 0 1 20 0v8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="40" r="3" fill="currentColor" />
            <path d="M32 43v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p className={styles.kicker}>{content.eyebrow}</p>
          <h1 id="security-title">{content.title}</h1>
          <p className={styles.intro}>{content.intro}</p>
        </section>
        <div className={styles.layout}>
          <SecurityContents groups={content.groups} />
          <div className={styles.sections}>
            {content.groups.map((group) => (
              <section className={styles.card} key={group.id} aria-labelledby={group.id}>
                <div className={styles.sectionHeading}>
                  <h2 id={group.id}>{group.title}</h2>
                </div>
                {group.items.map((item) => (
                  <div className={styles.topic} key={item.id}>
                    <h3 id={item.id}>{item.title}</h3>
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ))}
              </section>
            ))}
            <aside className={styles.contact} aria-label="Request security documentation">
              <p>
                {content.contactText} <a href={`mailto:${content.email}`}>{content.email}</a>.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
