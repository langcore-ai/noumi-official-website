import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { OfficialInviteRequestForm } from '@/components/site/official/OfficialInviteRequestForm'
import { getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './invite.module.css'

/**
 * 构建产品注册入口地址。
 * 官网 invite 页仅提供已有邀请码用户的直达入口，不参与邀请码校验。
 *
 * @returns 产品侧登录/注册页地址
 */
function getProductAuthUrl() {
  const productUrl = process.env.NOUMI_PRODUCT_API_URL?.trim() || 'https://www.noumi.ai'

  return new URL('/auth', productUrl).toString()
}

/**
 * Invite 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Request Early Access to Noumi — Join the First Wave',
    description:
      'Get early access to Noumi — the AI assistant that remembers your context and gets work done autonomously. Opening in waves. Leave your email to claim your spot.',
    pathname: '/invite',
  })
}

/**
 * Invite 页面
 * @returns Invite 页面
 */
export default async function InvitePage() {
  const useCases = await getOfficialUseCaseNavItems()
  const productAuthUrl = getProductAuthUrl()

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <main>
        <div className={styles.inviteWrap}>
          <div className={styles.inviteInner}>
            <div className={`${styles.inviteBadge} reveal`}>
              <i></i>
              Early Access
            </div>

            <h1 className="reveal d1">
              Be among the
              <br />
              first to use <em>Noumi.</em>
            </h1>
            <h2 className={styles.screenReaderOnly}>Request your invite</h2>
            <h3 className={styles.screenReaderOnly}>No spam, no credit card required</h3>

            <p className="reveal d2">
              We&apos;re opening access in waves. Leave your email and we&apos;ll send you an invite
              code when your spot is ready.
            </p>

            <OfficialInviteRequestForm />

            <p className={`${styles.inviteRegisterPrompt} reveal d3`}>
              Already have an invite code? <a href={productAuthUrl}>Register</a>
            </p>
          </div>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
