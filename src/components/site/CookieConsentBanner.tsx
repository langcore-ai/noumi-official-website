'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  readStoredConsent,
  writeStoredConsent,
  type CookieCategoryId,
} from '@/lib/site/consent'

/** 横幅收起动画时长，需与 CSS transition 保持一致。 */
const COOKIE_CONSENT_EXIT_MS = 240

/** 可由用户管理的 cookie 类别。 */
type CookieCategory = {
  /** 类别 ID */
  id: CookieCategoryId
  /** 类别名称 */
  title: string
  /** 类别说明 */
  description: string
}

/** 官网当前说明的 cookie 类别。 */
const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'locale',
    title: 'Internationalization',
    description:
      'Keeps your language choice for the official website so pages can stay in the locale you selected.',
  },
  {
    id: 'productLogin',
    title: 'Product login',
    description:
      'Supports the login handoff after an invited user continues from the official website to the Noumi product.',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description:
      'Helps us measure anonymous website visits and invite conversion without collecting prompts, email addresses, or file contents.',
  },
]

/**
 * Cookie 管理底部横幅。
 * @returns 未确认时展示的全站 cookie 偏好管理 UI
 */
export function CookieConsentBanner() {
  const [isReady, setIsReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [allowLocale, setAllowLocale] = useState(true)
  const [allowProductLogin, setAllowProductLogin] = useState(true)
  const [allowAnalytics, setAllowAnalytics] = useState(true)

  const categoryStatus = useMemo(
    () => ({
      analytics: allowAnalytics,
      locale: allowLocale,
      productLogin: allowProductLogin,
    }),
    [allowAnalytics, allowLocale, allowProductLogin],
  )

  useEffect(() => {
    const storedConsent = readStoredConsent()

    if (!storedConsent) {
      setIsVisible(true)
      setIsReady(true)
      return
    }

    setAllowLocale(storedConsent.locale)
    setAllowProductLogin(storedConsent.productLogin)
    setAllowAnalytics(storedConsent.analytics)
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
   * @param locale 是否允许国际化语言 cookie
   * @param productLogin 是否允许产品登录相关 cookie
   * @param analytics 是否允许匿名官网分析
   */
  function commitConsent(locale: boolean, productLogin: boolean, analytics: boolean) {
    writeStoredConsent(locale, productLogin, analytics)
    setAllowLocale(locale)
    setAllowProductLogin(productLogin)
    setAllowAnalytics(analytics)
    setIsLeaving(true)
  }

  if (!isReady || !isVisible) {
    return null
  }

  return (
    <section
      aria-label="Cookie preferences"
      className="cookie-consent"
      data-managing={isManaging ? 'true' : 'false'}
      data-state={isLeaving ? 'leaving' : 'entering'}
    >
      <div className="cookie-consent__panel">
        <div className="cookie-consent__copy">
          <p className="cookie-consent__eyebrow">Cookie preferences</p>
          <h2>Choose how Noumi stores site cookies.</h2>
          <p>
            We use cookies for internationalization, for the invited-user product login handoff,
            and for anonymous website analytics. You can accept, reject, or fine-tune each
            category. This does not describe Payload admin cookies.
          </p>
        </div>

        {isManaging ? (
          <div className="cookie-consent__categories">
            {COOKIE_CATEGORIES.map((category) => (
              <label className="cookie-consent__category" key={category.id}>
                <span>
                  <strong>{category.title}</strong>
                  <small>{category.description}</small>
                </span>
                <input
                  checked={categoryStatus[category.id]}
                  onChange={(event) => {
                    if (category.id === 'locale') {
                      setAllowLocale(event.target.checked)
                      return
                    }

                    if (category.id === 'productLogin') {
                      setAllowProductLogin(event.target.checked)
                      return
                    }

                    setAllowAnalytics(event.target.checked)
                  }}
                  type="checkbox"
                />
              </label>
            ))}
          </div>
        ) : null}

        <div className="cookie-consent__actions">
          <button
            className="cookie-consent__button cookie-consent__button--ghost"
            onClick={() => setIsManaging((currentValue) => !currentValue)}
            type="button"
          >
            {isManaging ? 'Hide details' : 'Manage'}
          </button>
          <button
            className="cookie-consent__button cookie-consent__button--ghost"
            onClick={() => commitConsent(false, false, false)}
            type="button"
          >
            Reject all
          </button>
          <button
            className="cookie-consent__button cookie-consent__button--solid"
            onClick={() => commitConsent(true, true, true)}
            type="button"
          >
            Accept all
          </button>
          {isManaging ? (
            <button
              className="cookie-consent__button cookie-consent__button--solid"
              onClick={() => commitConsent(allowLocale, allowProductLogin, allowAnalytics)}
              type="button"
            >
              Save choices
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
