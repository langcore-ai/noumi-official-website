import { describe, expect, it } from 'vitest'

import {
  buildOfficialGoogleTagPageViewPayload,
  buildOfficialLandingSourceProperties,
  buildOfficialOutboundAttributionParams,
  buildPublicOfficialAnalyticsConfig,
  OFFICIAL_GOOGLE_TAG_ID,
  sanitizeOfficialBrowserEventProperties,
  sanitizeOfficialAnalyticsProperties,
} from '@/lib/site/analytics'

describe('official analytics helpers', () => {
  it('uses the official GA4 measurement id', () => {
    expect(OFFICIAL_GOOGLE_TAG_ID).toBe('G-TJBXDRBMVM')
  })

  it('normalizes public config with bare hosts and defaults', () => {
    expect(
      buildPublicOfficialAnalyticsConfig({
        apiHost: 'e.noumi.ai',
        enabledEnv: 'true',
        projectKey: 'phc_test_key',
        uiHost: 'https://us.posthog.com/dashboard/',
      }),
    ).toEqual({
      apiHost: 'https://e.noumi.ai',
      enabled: true,
      projectKey: 'phc_test_key',
      uiHost: 'https://us.posthog.com',
    })
  })

  it('returns a disabled config when analytics is off', () => {
    expect(
      buildPublicOfficialAnalyticsConfig({
        enabledEnv: 'false',
        projectKey: 'phc_test_key',
      }),
    ).toEqual({
      apiHost: null,
      enabled: false,
      projectKey: null,
      uiHost: null,
    })
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

  it('keeps PostHog SDK required fields when sanitizing browser payloads', () => {
    expect(
      sanitizeOfficialBrowserEventProperties(
        {
          $browser: 'Firefox',
          $current_url: 'https://www.noumi.ai/invite?email=user@example.com#top',
          $initial_referrer: 'https://google.com/search?q=noumi',
          $lib: 'web',
          distinct_id: 'visitor-123',
          email: 'user@example.com',
          page_path: '/invite?token=secret',
          token: 'phc_test_key',
        },
        'https://www.noumi.ai',
      ),
    ).toEqual({
      $browser: 'Firefox',
      $current_url: 'https://www.noumi.ai/invite',
      $initial_referrer: 'https://google.com/search',
      $lib: 'web',
      distinct_id: 'visitor-123',
      page_path: '/invite',
      token: 'phc_test_key',
    })
  })

  it('builds privacy-safe GA4 page view payloads', () => {
    expect(
      buildOfficialGoogleTagPageViewPayload({
        baseUrl: 'https://www.noumi.ai',
        pathname: '/invite/?email=user@example.com#top',
        title: ' Invite Noumi ',
      }),
    ).toEqual({
      page_location: 'https://www.noumi.ai/invite',
      page_path: '/invite',
      page_title: 'Invite Noumi',
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
