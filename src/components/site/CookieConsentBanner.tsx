'use client'

import { useEffect, useMemo, useState } from 'react'

/** Cookie 偏好本地存储键；避免为记录 consent 再新增 cookie。 */
const COOKIE_CONSENT_STORAGE_KEY = 'noumi-cookie-consent'

/** 当前 cookie 偏好结构版本，用于后续新增类别时兼容旧数据。 */
const COOKIE_CONSENT_VERSION = 2
/** 横幅收起动画时长，需与 CSS transition 保持一致。 */
const COOKIE_CONSENT_EXIT_MS = 240

/** 可由用户管理的 cookie 类别。 */
type CookieCategoryId = 'locale' | 'productLogin'

/** Cookie 类别配置。 */
type CookieCategory = {
  /** 类别 ID */
  id: CookieCategoryId
  /** 类别名称 */
  title: string
  /** 类别说明 */
  description: string
}

/** 用户 cookie 偏好。 */
type CookieConsentState = {
  /** 存储结构版本 */
  version: number
  /** 用户是否允许国际化语言 cookie */
  locale: boolean
  /** 用户是否允许产品登录相关 cookie */
  productLogin: boolean
  /** 用户确认偏好的 ISO 时间 */
  updatedAt: string
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
]

/**
 * 读取已经保存的 cookie 偏好。
 * @returns 用户偏好；不存在或格式不兼容时返回 null
 */
function readStoredConsent(): CookieConsentState | null {
  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as Partial<CookieConsentState>

    if (parsedValue.version !== COOKIE_CONSENT_VERSION) {
      return null
    }

    return {
      version: COOKIE_CONSENT_VERSION,
      locale: parsedValue.locale === true,
      productLogin: parsedValue.productLogin === true,
      updatedAt: typeof parsedValue.updatedAt === 'string' ? parsedValue.updatedAt : '',
    }
  } catch {
    return null
  }
}

/**
 * 持久化 cookie 偏好。
 * @param locale 是否允许国际化语言 cookie
 * @param productLogin 是否允许产品登录相关 cookie
 */
function writeStoredConsent(locale: boolean, productLogin: boolean) {
  const consent: CookieConsentState = {
    version: COOKIE_CONSENT_VERSION,
    locale,
    productLogin,
    updatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent))
}

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

  const categoryStatus = useMemo(
    () => ({
      locale: allowLocale,
      productLogin: allowProductLogin,
    }),
    [allowLocale, allowProductLogin],
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
   */
  function commitConsent(locale: boolean, productLogin: boolean) {
    writeStoredConsent(locale, productLogin)
    setAllowLocale(locale)
    setAllowProductLogin(productLogin)
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
            We use cookies for internationalization and for the invited-user product login handoff.
            You can accept, reject, or fine-tune each category. This does not describe Payload admin
            cookies.
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

                    setAllowProductLogin(event.target.checked)
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
            onClick={() => commitConsent(false, false)}
            type="button"
          >
            Reject all
          </button>
          <button
            className="cookie-consent__button cookie-consent__button--solid"
            onClick={() => commitConsent(true, true)}
            type="button"
          >
            Accept all
          </button>
          {isManaging ? (
            <button
              className="cookie-consent__button cookie-consent__button--solid"
              onClick={() => commitConsent(allowLocale, allowProductLogin)}
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
