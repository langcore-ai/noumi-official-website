import { redirect } from 'next/navigation'

import { createOfficialMetadata, OFFICIAL_PRODUCT_AUTH_URL } from '@/lib/site/official-site'

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
 * waitlist 暂时下线，保留路由并临时导流到产品登录/注册页。
 */
export default async function InvitePage() {
  redirect(OFFICIAL_PRODUCT_AUTH_URL)
}
