import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './contact.module.css'

/**
 * Contact 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: "Contact Noumi — We'd Love to Hear from You",
    description:
      "Questions, feedback, or just want to say hi — reach us at official@noumi.ai. We read every message. For hiring inquiries or legal questions, we're here too.",
    pathname: '/contact/',
  })
}

/**
 * Contact 页面
 * @returns Contact 页面
 */
export default async function ContactPage() {
  const useCases = await getOfficialUseCaseNavItems()

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <main>
        <div className={styles.contactWrap}>
          <div className={styles.contactInner}>
            <h1 className="reveal">
              We&apos;d love to hear
              <br />
              from you.
            </h1>
            <h2 className={styles.screenReaderOnly}>Send us a message</h2>
            <p className="reveal d1">
              Questions, feedback, or just want to say hi — drop us a line. We read every message.
            </p>
            <a className={`${styles.contactEmail} reveal d2`} href="mailto:official@noumi.ai">
              official@noumi.ai
            </a>

            <hr className={styles.contactDivider} />

            <h2 className={styles.screenReaderOnly}>Other ways to reach us</h2>
            <h3 className={styles.screenReaderOnly}>Join our team</h3>
            <p className={`${styles.contactAlt} reveal`}>
              Looking to join the team? Reach out at <a href="mailto:hr@noumi.ai">hr@noumi.ai</a>
            </p>
            <h3 className={styles.screenReaderOnly}>Legal and privacy</h3>
            <p className={`${styles.contactAlt} reveal`}>
              Legal or privacy inquiries? See our <a href="/privacy/">Privacy Policy</a> or{' '}
              <a href="/terms/">Terms of Service</a>
            </p>
          </div>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
