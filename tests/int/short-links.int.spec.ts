import { describe, expect, it } from 'vitest'

import { GET } from '@/app/(frontend)/go/[slug]/route'
import { OFFICIAL_PRODUCT_AUTH_URL, OFFICIAL_SITE_URL } from '@/lib/site/official-site'

const siteOrigin = new URL(OFFICIAL_SITE_URL).origin
const authOrigin = new URL(OFFICIAL_PRODUCT_AUTH_URL).origin

/**
 * 调用短链路由。
 * @param slug 短链 slug
 * @returns 路由响应
 */
async function callGoRoute(slug: string): Promise<Response> {
  return GET(new Request(`https://noumi.test/go/${slug}`), {
    params: Promise.resolve({ slug }),
  })
}

describe('official short links /go/[slug]', () => {
  it('redirects UTM-07 hook_usecase to /use-cases with full UTM', async () => {
    const response = await callGoRoute('usecases')
    expect(response.status).toBe(302)
    const target = new URL(response.headers.get('location')!)
    expect(target.origin).toBe(siteOrigin)
    expect(target.pathname).toBe('/use-cases')
    expect(target.searchParams.get('utm_source')).toBe('linkedin')
    expect(target.searchParams.get('utm_medium')).toBe('outbound')
    expect(target.searchParams.get('utm_campaign')).toBe('se_outreach')
    expect(target.searchParams.get('utm_content')).toBe('hook_usecase')
  })

  it('redirects UTM-08 get-started to the product auth URL', async () => {
    const response = await callGoRoute('get-started')
    expect(response.status).toBe(302)
    const target = new URL(response.headers.get('location')!)
    expect(target.origin).toBe(authOrigin)
    expect(target.pathname).toBe('/auth')
    expect(target.searchParams.get('utm_campaign')).toBe('se_outreach')
    expect(target.searchParams.get('utm_content')).toBe('trial_invitation_signup')
  })

  it('maps every email follow-up slug from the UTM rule table', async () => {
    const expected = [
      ['try-noumi', 'trial_invitation', 'trial_invitation_signup'],
      ['see-how-it-works', 'trial_invitation', 'trial_invitation_usecase'],
      ['continue', 'trial_followup', 'trial_followup_1_signup'],
      ['explore-more', 'trial_followup', 'trial_followup_1_usecase'],
      ['next-step', 'trial_followup', 'trial_followup_2_signup'],
      ['learn-more', 'trial_followup', 'trial_followup_2_usecase'],
    ] as const

    for (const [slug, campaign, content] of expected) {
      const response = await callGoRoute(slug)
      expect(response.status, slug).toBe(302)
      const target = new URL(response.headers.get('location')!)
      expect(target.searchParams.get('utm_source'), slug).toBe('email')
      expect(target.searchParams.get('utm_medium'), slug).toBe('email')
      expect(target.searchParams.get('utm_campaign'), slug).toBe(campaign)
      expect(target.searchParams.get('utm_content'), slug).toBe(content)
    }
  })

  it('covers the remaining rule table slugs', async () => {
    for (const slug of ['explore', 'start-here', 'discover']) {
      const response = await callGoRoute(slug)
      expect(response.status, slug).toBe(302)
      expect(response.headers.get('location'), slug).toBeTruthy()
    }
  })

  it('normalizes case and surrounding whitespace in the slug', async () => {
    const response = await callGoRoute('  UseCases ')
    expect(response.status).toBe(302)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/use-cases')
  })

  it('returns 404 without a Location header for unknown slugs', async () => {
    for (const slug of ['nonexistent', 'use-cases', 'usecases?x=1']) {
      const response = await callGoRoute(slug)
      expect(response.status, slug).toBe(404)
      expect(response.headers.get('location'), slug).toBeNull()
    }
  })

  it('marks responses noindex and uncacheable', async () => {
    const response = await callGoRoute('usecases')
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
    expect(response.headers.get('cache-control')).toContain('no-store')
  })
})
