import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { OfficialInviteRequestForm } from '@/components/site/official/OfficialInviteRequestForm'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * Invite 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Request Early Access to Noumi — Join the First Wave',
    description:
      'Get early access to Noumi — the AI assistant that remembers your context and gets work done autonomously. Opening in waves. Leave your email to claim your spot.',
    pathname: '/invite/',
  })
}

/**
 * Invite 页面
 * @returns Invite 页面
 */
export default async function InvitePage() {
  const useCases = await getOfficialUseCaseNavItems()

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <style>{`
        .invite-wrap { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 80px 48px; }
        .invite-inner { max-width: 540px; width: 100%; text-align: center; }
        .invite-badge { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border-med); border-radius: 100px; padding: 6px 18px; font-size: 12px; font-weight: 500; color: var(--ink-soft); letter-spacing: 0.025em; margin-bottom: 32px; }
        .invite-badge i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: block; flex-shrink: 0; }
        .invite-inner h1 { font-family: var(--ff-display); font-size: clamp(36px, 5vw, 58px); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 20px; }
        .invite-inner h1 em { font-style: italic; color: var(--accent); }
        .invite-inner p { font-size: 17px; font-weight: 300; color: var(--ink-soft); line-height: 1.72; margin-bottom: 44px; }
        .invite-form { display: flex; gap: 10px; margin-bottom: 16px; }
        .invite-input { flex: 1; padding: 15px 18px; border-radius: 9px; border: 1px solid var(--border-med); background: var(--cream-mid); font-family: var(--ff-body); font-size: 15px; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .invite-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(75,75,232,0.10); }
        .invite-input::placeholder { color: var(--ink-muted); }
        .invite-submit { padding: 15px 28px; background: var(--ink); color: var(--cream); border: none; border-radius: 9px; font-family: var(--ff-body); font-size: 15px; font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.15s; white-space: nowrap; }
        .invite-submit:hover { background: var(--ink-soft); transform: translateY(-1px); }
        .invite-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .invite-note { font-size: 13px; color: var(--ink-muted); }
        .invite-success { display: none; padding: 20px 24px; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.22); border-radius: 12px; margin-bottom: 16px; }
        .invite-success p { font-size: 15px; color: var(--ink); font-weight: 400; margin: 0; line-height: 1.5; }
        .invite-success p strong { color: #16a34a; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (max-width: 600px) { .invite-wrap { padding: 56px 20px; } .invite-form { flex-direction: column; } }
      `}</style>

      <main>
        <div className="invite-wrap">
          <div className="invite-inner">
            <div className="invite-badge reveal">
              <i></i>
              Early Access
            </div>

            <h1 className="reveal d1">
              Be among the
              <br />
              first to use <em>Noumi.</em>
            </h1>
            <h2 className="sr-only">Request your invite</h2>
            <h3 className="sr-only">No spam, no credit card required</h3>

            <p className="reveal d2">
              We&apos;re opening access in waves. Leave your email and we&apos;ll send you an invite
              code when your spot is ready.
            </p>

            <OfficialInviteRequestForm />

            <p className="invite-note reveal d3">No spam. No credit card. Just your spot in line.</p>
          </div>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
