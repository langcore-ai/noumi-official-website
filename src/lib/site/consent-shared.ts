/** 官网 cookie 偏好本地存储键，供前后台安全复用。 */
export const COOKIE_CONSENT_STORAGE_KEY = 'noumi-cookie-consent'

/** 当前 cookie 偏好存储版本，需与读取逻辑保持一致。 */
export const COOKIE_CONSENT_VERSION = 3

/** 同意 analytics 后写入的偏好 cookie，供服务端中继二次校验。 */
export const OFFICIAL_ANALYTICS_CONSENT_COOKIE = 'noumi_analytics_consent'
