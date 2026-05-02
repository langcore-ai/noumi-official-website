'use client'

/** 官网 cookie 偏好本地存储键。 */
export const COOKIE_CONSENT_STORAGE_KEY = 'noumi-cookie-consent'

/** 当前 cookie 偏好存储版本。 */
export const COOKIE_CONSENT_VERSION = 3

/** cookie 偏好变更事件名。 */
export const COOKIE_CONSENT_CHANGE_EVENT = 'noumi-cookie-consent-changed'

/** 可管理的 cookie 类别。 */
export type CookieCategoryId = 'locale' | 'productLogin' | 'analytics'

/** 官网 cookie 偏好。 */
export type CookieConsentState = {
  /** 存储结构版本。 */
  version: number
  /** 是否允许语言偏好 cookie。 */
  locale: boolean
  /** 是否允许产品登录相关 cookie。 */
  productLogin: boolean
  /** 是否允许匿名官网分析。 */
  analytics: boolean
  /** 偏好更新时间。 */
  updatedAt: string
}

/** 可被 cookie 面板直接写入的偏好字段。 */
export type CookieConsentChoice = Pick<CookieConsentState, 'analytics' | 'locale' | 'productLogin'>

/** 用户同意全部可选 cookie。 */
export const COOKIE_CONSENT_ACCEPT_ALL: CookieConsentChoice = {
  analytics: true,
  locale: true,
  productLogin: true,
}

/** 用户仅保留必要能力；关闭偏好 cookie 与匿名站点分析。 */
export const COOKIE_CONSENT_NECESSARY_ONLY: CookieConsentChoice = {
  analytics: false,
  locale: false,
  productLogin: true,
}

type StoredCookieConsentState = Partial<CookieConsentState> & {
  version?: number
}

/**
 * 持久化当前 cookie 偏好到 localStorage。
 * @param consent 当前偏好
 */
function persistStoredConsent(consent: CookieConsentState) {
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent))
}

/**
 * 通知同页的监听方 cookie 偏好已经变更。
 */
export function dispatchConsentChanged() {
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
}

/**
 * 读取已经保存的 cookie 偏好。
 * 兼容旧版 v2 存储结构；第一次读到旧结构时会顺手升级为 v3。
 *
 * @returns 用户偏好；不存在或格式不兼容时返回 null
 */
export function readStoredConsent(): CookieConsentState | null {
  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as StoredCookieConsentState

    if (parsedValue.version === COOKIE_CONSENT_VERSION) {
      return {
        version: COOKIE_CONSENT_VERSION,
        locale: parsedValue.locale === true,
        productLogin: parsedValue.productLogin === true,
        analytics: parsedValue.analytics === true,
        updatedAt: typeof parsedValue.updatedAt === 'string' ? parsedValue.updatedAt : '',
      }
    }

    if (parsedValue.version === 2) {
      const migratedConsent: CookieConsentState = {
        version: COOKIE_CONSENT_VERSION,
        locale: parsedValue.locale === true,
        productLogin: parsedValue.productLogin === true,
        analytics: false,
        updatedAt: typeof parsedValue.updatedAt === 'string' ? parsedValue.updatedAt : '',
      }

      persistStoredConsent(migratedConsent)
      return migratedConsent
    }

    return null
  } catch {
    return null
  }
}

/**
 * 持久化 cookie 偏好并通知监听方更新。
 * @param locale 是否允许语言偏好 cookie
 * @param productLogin 是否允许产品登录相关 cookie
 * @param analytics 是否允许匿名官网分析
 */
export function writeStoredConsent(locale: boolean, productLogin: boolean, analytics: boolean) {
  const consent: CookieConsentState = {
    version: COOKIE_CONSENT_VERSION,
    locale,
    productLogin,
    analytics,
    updatedAt: new Date().toISOString(),
  }

  persistStoredConsent(consent)
  dispatchConsentChanged()
}
