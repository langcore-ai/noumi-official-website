import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

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

      <style>{`
        .contact-wrap { min-height: calc(100vh - 64px - 280px); display: flex; align-items: center; justify-content: center; padding: 96px 48px; }
        .contact-inner { max-width: 600px; text-align: center; }
        .contact-inner h1 { font-family: var(--ff-display); font-size: clamp(36px, 5vw, 64px); font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 28px; }
        .contact-inner p { font-size: 18px; font-weight: 300; color: var(--ink-soft); line-height: 1.75; margin-bottom: 48px; }
        .contact-email { display: inline-flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 500; color: var(--ink); background: var(--cream-mid); border: 1px solid var(--border-med); border-radius: 10px; padding: 16px 28px; transition: background 0.2s, transform 0.15s; }
        .contact-email:hover { background: var(--cream-dark); transform: translateY(-2px); }
        .contact-email::before { content: '✉'; font-size: 18px; }
        .contact-divider { margin: 72px 0 40px; border: none; border-top: 1px solid var(--border); }
        .contact-alt { font-size: 14px; color: var(--ink-muted); margin-bottom: 16px; }
        .contact-alt a { color: var(--accent); }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (max-width: 600px) { .contact-wrap { padding: 64px 24px; } }
      `}</style>

      <main>
        <div className="contact-wrap">
          <div className="contact-inner">
            <h1 className="reveal">
              We&apos;d love to hear
              <br />
              from you.
            </h1>
            <h2 className="sr-only">Send us a message</h2>
            <p className="reveal d1">
              Questions, feedback, or just want to say hi — drop us a line. We read every message.
            </p>
            <a className="contact-email reveal d2" href="mailto:official@noumi.ai">
              official@noumi.ai
            </a>

            <hr className="contact-divider" />

            <h2 className="sr-only">Other ways to reach us</h2>
            <h3 className="sr-only">Join our team</h3>
            <p className="contact-alt reveal">
              Looking to join the team? Reach out at <a href="mailto:hr@noumi.ai">hr@noumi.ai</a>
            </p>
            <h3 className="sr-only">Legal and privacy</h3>
            <p className="contact-alt reveal">
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
