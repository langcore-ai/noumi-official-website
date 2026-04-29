import { beforeEach, describe, expect, it } from 'vitest'

import { COOKIE_CONSENT_STORAGE_KEY, readStoredConsent, writeStoredConsent } from '@/lib/site/consent'

describe('cookie consent storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('writes and reads the latest consent format', () => {
    writeStoredConsent(true, false, true)

    expect(readStoredConsent()).toMatchObject({
      analytics: true,
      locale: true,
      productLogin: false,
      updatedAt: expect.any(String),
      version: 3,
    })
  })

  it('migrates v2 consent to v3 and keeps analytics disabled', () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        locale: false,
        productLogin: true,
        updatedAt: '2026-04-24T07:00:00.000Z',
        version: 2,
      }),
    )

    expect(readStoredConsent()).toEqual({
      analytics: false,
      locale: false,
      productLogin: true,
      updatedAt: '2026-04-24T07:00:00.000Z',
      version: 3,
    })

    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || '{}')).toEqual({
      analytics: false,
      locale: false,
      productLogin: true,
      updatedAt: '2026-04-24T07:00:00.000Z',
      version: 3,
    })
  })
})
