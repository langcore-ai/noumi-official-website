import { describe, expect, it } from 'vitest'
import { runInNewContext } from 'node:vm'

import {
  buildOfficialGoogleTagBootstrapScript,
  buildOfficialGoogleTagConsentPayload,
  buildOfficialGoogleTagPageViewPayload,
  buildOfficialLandingSourceProperties,
  buildOfficialOutboundAttributionParams,
  buildPublicOfficialAnalyticsConfig,
  normalizeOfficialPagePath,
  officialPageGroup,
  OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG,
  OFFICIAL_GOOGLE_TAG_ID,
  sanitizeOfficialAnalyticsProperties,
} from '@/lib/site/analytics'

describe('official analytics helpers', () => {
  it('initializes consent before starting GTM and preserves the shared data layer', () => {
    const existingEvent = { event: 'existing' }
    const browser = { dataLayer: [existingEvent] as unknown[] }
    runInNewContext(buildOfficialGoogleTagBootstrapScript(), { window: browser })
    expect(browser.dataLayer[0]).toBe(existingEvent)
    const commands = browser.dataLayer
      .slice(1, 4)
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
    expect(commands[0]).toMatchObject(['consent', 'default', { analytics_storage: 'denied' }])
    expect(commands[1][0]).toBe('js')
    expect(browser.dataLayer[4]).toMatchObject({ event: 'gtm.js', 'gtm.start': expect.any(Number) })
  })

  it('uses the official GA4 measurement id', () => {
    expect(OFFICIAL_GOOGLE_TAG_ID).toBe('G-TJBXDRBMVM')
  })

  it('builds the GA4 bootstrap script with initialization commands', () => {
    const script = buildOfficialGoogleTagBootstrapScript()

    expect(script).toContain('window.dataLayer = window.dataLayer || []')
    expect(script).toContain('window.gtag = window.gtag || function gtag()')
    expect(script).toContain("window.gtag('js', new Date())")
    expect(script).toContain(`window.gtag('config', "${OFFICIAL_GOOGLE_TAG_ID}"`)
    expect(script).toContain('send_page_view: false')
    expect(script).toContain(OFFICIAL_GOOGLE_TAG_BOOTSTRAP_FLAG)
  })

  it('exposes only the enabled flag to the browser', () => {
    expect(
      buildPublicOfficialAnalyticsConfig({ enabledEnv: 'true', projectKey: 'phc_test_key' }),
    ).toEqual({ enabled: true })
    expect(
      buildPublicOfficialAnalyticsConfig({ enabledEnv: 'false', projectKey: 'phc_test_key' }),
    ).toEqual({ enabled: false })
    expect(buildPublicOfficialAnalyticsConfig({ enabledEnv: 'true', projectKey: '  ' })).toEqual({
      enabled: false,
    })
  })

  it('normalizes official page paths and rejects private routes', () => {
    expect(normalizeOfficialPagePath('/pricing/?utm_source=x#top')).toBe('/pricing')
    expect(normalizeOfficialPagePath('/blog/some-post')).toBe('/blog/some-post')
    expect(normalizeOfficialPagePath('//features//')).toBe('/features')
    expect(normalizeOfficialPagePath('/admin')).toBe('/other')
    expect(normalizeOfficialPagePath('/blog/../../etc')).toBe('/other')
    expect(normalizeOfficialPagePath('/blog/Some_Post')).toBe('/other')
    expect(officialPageGroup('/privacy')).toBe('legal')
    expect(officialPageGroup('/use-cases/foo')).toBe('use-cases')
    expect(officialPageGroup('/')).toBe('home')
  })

  it('drops unsafe properties and keeps only the allowlist', () => {
    expect(
      sanitizeOfficialAnalyticsProperties(
        {
          cta_id: ' home_hero_try_free ',
          email: 'user@example.com',
          page_path: '/invite/?utm_source=ad#top',
          prompt: 'do not send',
          referrer_origin: 'https://example.com/search?q=noumi',
          target_path: 'https://www.noumi.ai/auth?invite=1',
        },
        'https://www.noumi.ai',
      ),
    ).toEqual({
      cta_id: 'home_hero_try_free',
      page_path: '/invite',
      referrer_origin: 'https://example.com',
      target_path: '/auth',
    })
  })

  it('builds privacy-safe GA4 page view payloads', () => {
    expect(
      buildOfficialGoogleTagPageViewPayload({
        baseUrl: 'https://www.noumi.ai',
        pathname: '/invite/?email=user@example.com#top',
        search: '?utm_source=newsletter&utm_medium=email&email=user@example.com',
        title: ' Invite Noumi ',
      }),
    ).toEqual({
      page_location: 'https://www.noumi.ai/invite?utm_source=newsletter&utm_medium=email',
      page_path: '/invite',
      page_title: 'Invite Noumi',
    })
  })

  it('builds GA4 consent mode payloads from cookie choices', () => {
    expect(buildOfficialGoogleTagConsentPayload(false)).toEqual({
      ad_personalization: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'denied',
    })

    expect(buildOfficialGoogleTagConsentPayload(true)).toMatchObject({
      ad_personalization: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      analytics_storage: 'granted',
    })
  })

  it('extracts only allowed landing source parameters', () => {
    expect(
      buildOfficialLandingSourceProperties({
        baseUrl: 'https://www.noumi.ai',
        referrer: 'https://google.com/search?q=noumi',
        search:
          '?utm_source=newsletter&utm_medium=email&utm_campaign=spring&utm_term=ai&utm_content=hero&foo=bar',
      }),
    ).toEqual({
      referrer_origin: 'https://google.com',
      utm_campaign: 'spring',
      utm_content: 'hero',
      utm_medium: 'email',
      utm_source: 'newsletter',
      utm_term: 'ai',
    })
  })

  it('builds safe outbound attribution params for product redirects', () => {
    expect(
      Object.fromEntries(
        buildOfficialOutboundAttributionParams({
          anonymousDistinctId: ' 0193f5e0-visitor ',
          baseUrl: 'https://www.noumi.ai',
          ctaId: ' invite_register_link ',
          landingPage: '/invite?email=user@example.com',
          referrer: 'https://google.com/search?q=noumi',
          search: '?utm_source=newsletter&utm_medium=email&utm_campaign=spring&token=secret',
        }),
      ),
    ).toEqual({
      first_touch_campaign: 'spring',
      first_touch_landing_page: '/invite',
      first_touch_medium: 'email',
      first_touch_referrer_origin: 'https://google.com',
      first_touch_source: 'newsletter',
      official_cta_id: 'invite_register_link',
      posthog_anonymous_distinct_id: '0193f5e0-visitor',
      source_surface: 'official',
    })
  })
})
