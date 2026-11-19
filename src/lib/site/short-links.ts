import { OFFICIAL_PRODUCT_AUTH_URL, OFFICIAL_SITE_URL } from '@/lib/site/official-site'

/**
 * 官网营销短链映射（飞书 UTM 规则表，编号 UTM-07~16、UTM-20）。
 *
 * 私信/邮件里只发 `noumi.ai/go/<slug>`，服务端 302 到带完整 UTM 的落地页；
 * 落地后的 UTM 采集由 OfficialAnalyticsProvider 现有链路完成，短链本身不进 PostHog。
 *
 * slug 是对外发布承诺，一旦投放不可改名；新增条目按规则表追加。
 */
const SHORT_LINK_TARGETS = {
  usecases: {
    pathname: '/use-cases',
    utmSource: 'linkedin',
    utmMedium: 'outbound',
    utmCampaign: 'se_outreach',
    utmContent: 'hook_usecase',
  },
  'get-started': {
    pathname: OFFICIAL_PRODUCT_AUTH_URL,
    utmSource: 'linkedin',
    utmMedium: 'outbound',
    utmCampaign: 'se_outreach',
    utmContent: 'trial_invitation_signup',
  },
  explore: {
    pathname: '/use-cases',
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'email_outreach',
    utmContent: 'cold_usecase',
  },
  'start-here': {
    pathname: OFFICIAL_PRODUCT_AUTH_URL,
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'email_outreach',
    utmContent: 'cold_signup',
  },
  'try-noumi': {
    pathname: OFFICIAL_PRODUCT_AUTH_URL,
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'trial_invitation',
    utmContent: 'trial_invitation_signup',
  },
  'see-how-it-works': {
    pathname: '/use-cases',
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'trial_invitation',
    utmContent: 'trial_invitation_usecase',
  },
  continue: {
    pathname: OFFICIAL_PRODUCT_AUTH_URL,
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'trial_followup',
    utmContent: 'trial_followup_1_signup',
  },
  'explore-more': {
    pathname: '/use-cases',
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'trial_followup',
    utmContent: 'trial_followup_1_usecase',
  },
  'next-step': {
    pathname: OFFICIAL_PRODUCT_AUTH_URL,
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'trial_followup',
    utmContent: 'trial_followup_2_signup',
  },
  'learn-more': {
    pathname: '/use-cases',
    utmSource: 'email',
    utmMedium: 'email',
    utmCampaign: 'trial_followup',
    utmContent: 'trial_followup_2_usecase',
  },
  discover: {
    pathname: '/use-cases',
    utmSource: 'linkedin',
    utmMedium: 'outbound',
    utmCampaign: 'se_outreach',
    utmContent: 'video_hook',
  },
} as const satisfies Record<
  string,
  {
    pathname: string
    utmSource: string
    utmMedium: string
    utmCampaign: string
    utmContent: string
  }
>

/**
 * 构造短链的最终落地地址（含完整 UTM 查询参数）。
 *
 * @param slug 短链 slug
 * @returns 绝对目标地址；未知 slug 返回 null
 */
export function resolveOfficialShortLink(slug: string): string | null {
  const target = SHORT_LINK_TARGETS[slug.trim().toLowerCase() as keyof typeof SHORT_LINK_TARGETS]
  if (!target) {
    return null
  }

  const url = new URL(target.pathname, OFFICIAL_SITE_URL)
  url.searchParams.set('utm_source', target.utmSource)
  url.searchParams.set('utm_medium', target.utmMedium)
  url.searchParams.set('utm_campaign', target.utmCampaign)
  url.searchParams.set('utm_content', target.utmContent)
  return url.toString()
}
