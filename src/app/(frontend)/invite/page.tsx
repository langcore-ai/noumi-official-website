import { createManagedMetadata } from '@/lib/site/managed-settings'
import { redirect } from 'next/navigation'

import {
  buildOfficialOutboundAttributionParams,
  type OfficialFirstTouch,
} from '@/lib/site/analytics'
import { OFFICIAL_PRODUCT_AUTH_URL } from '@/lib/site/official-site'

/**
 * Invite 页面 metadata
 */
export async function generateMetadata() {
  return createManagedMetadata({
    title: 'Request Early Access to Noumi — Join the First Wave',
    description:
      'Get early access to Noumi — the AI assistant that remembers your context and gets work done autonomously. Opening in waves. Leave your email to claim your spot.',
    pathname: '/invite',
  })
}

/**
 * Invite 页面
 * waitlist 暂时下线，保留路由并临时导流到产品登录/注册页。
 *
 * 邮件与私信里的链接多数直接落到这条重定向，因此必须在这里把 UTM 透传给
 * `/auth`，否则产品侧永远看不到官网渠道（断点清单 W7）。
 *
 * @param props 请求查询参数
 */
export default async function InvitePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    const singleValue = Array.isArray(value) ? value[0] : value
    if (typeof singleValue === 'string' && singleValue) {
      search.set(key, singleValue)
    }
  }

  const url = new URL(OFFICIAL_PRODUCT_AUTH_URL)
  const attribution = buildOfficialOutboundAttributionParams({
    // 服务端不知道 consent，也不应伪造匿名身份；只透传渠道信息。
    anonymousDistinctId: null,
    baseUrl: url.origin,
    ctaId: 'invite_redirect',
    firstTouch: buildInviteFirstTouch(search),
    visitorId: undefined,
  })
  for (const [key, value] of attribution) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value)
    }
  }

  redirect(url.toString())
}

/**
 * 把链接里的 UTM 转成服务端可见的首触快照。
 *
 * @param search 当前查询参数
 * @returns 首触快照；没有 UTM 时返回 null
 */
function buildInviteFirstTouch(search: URLSearchParams): OfficialFirstTouch | null {
  const utmSource = search.get('utm_source')?.trim()
  const utmMedium = search.get('utm_medium')?.trim()
  const utmCampaign = search.get('utm_campaign')?.trim()
  const utmContent = search.get('utm_content')?.trim()
  if (!utmSource && !utmMedium && !utmCampaign && !utmContent) {
    return null
  }

  return {
    captured_at: new Date().toISOString(),
    landing_page: '/invite',
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(utmContent ? { utm_content: utmContent } : {}),
    ...(utmMedium ? { utm_medium: utmMedium } : {}),
    ...(utmSource ? { utm_source: utmSource } : {}),
  }
}
