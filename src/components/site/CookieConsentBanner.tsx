'use client'

import { useEffect, useState } from 'react'

import {
  COOKIE_CONSENT_ACCEPT_ALL,
  COOKIE_CONSENT_NECESSARY_ONLY,
  readStoredConsent,
  writeStoredConsent,
  type CookieConsentChoice,
} from '@/lib/site/consent'

/** 横幅收起动画时长，需与 CSS transition 保持一致。 */
const COOKIE_CONSENT_EXIT_MS = 240

/**
 * Cookie 管理底部横幅。
 * @returns 未确认时展示的全站 cookie 偏好管理 UI
 */
export function CookieConsentBanner() {
  const [isReady, setIsReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const storedConsent = readStoredConsent()

    if (!storedConsent) {
      setIsVisible(true)
      setIsReady(true)
      return
    }

    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isLeaving) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false)
      setIsLeaving(false)
    }, COOKIE_CONSENT_EXIT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isLeaving])

  /**
   * 保存当前偏好并关闭横幅。
   * @param consent 用户选择的 cookie 偏好
   */
  function commitConsent(consent: CookieConsentChoice) {
    writeStoredConsent(consent.locale, consent.productLogin, consent.analytics)
    setIsLeaving(true)
  }

  if (!isReady || !isVisible) {
    return null
  }

  return (
    <section
      aria-label="Cookie preferences"
      className="cookie-consent"
      data-state={isLeaving ? 'leaving' : 'entering'}
    >
      <div className="cookie-consent__panel">
        <div className="cookie-consent__copy">
          <p className="cookie-consent__eyebrow">Cookie preferences</p>
          <h2>Choose how Noumi stores site cookies.</h2>
          <p>
            We use essential cookies for core site functions. Choose Agree to allow preference and
            analytics cookies, or Necessary only to keep optional cookies off.
          </p>
        </div>

        <div className="cookie-consent__actions">
          <button
            className="cookie-consent__button cookie-consent__button--ghost"
            onClick={() => commitConsent(COOKIE_CONSENT_NECESSARY_ONLY)}
            type="button"
          >
            Necessary only
          </button>
          <button
            className="cookie-consent__button cookie-consent__button--solid"
            onClick={() => commitConsent(COOKIE_CONSENT_ACCEPT_ALL)}
            type="button"
          >
            Agree
          </button>
        </div>
      </div>
    </section>
  )
}
