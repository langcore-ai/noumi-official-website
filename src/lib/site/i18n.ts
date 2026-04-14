import enDictionary from '@/locales/site/en.json'
import zhDictionary from '@/locales/site/zh.json'

/** 站点语言 cookie 键 */
export const SITE_LOCALE_COOKIE = 'noumi-locale'
/** 站点支持的语言列表 */
export const SITE_LOCALES = ['en', 'zh'] as const
/** 站点语言类型 */
export type SiteLocale = (typeof SITE_LOCALES)[number]
/** 内容默认语言；用于 Payload 本地化字段回退 */
export const DEFAULT_CONTENT_LOCALE: SiteLocale = 'en'
/** 站点静态字典类型 */
type SiteDictionary = typeof enDictionary

/**
 * 站点静态字典
 * 仅承载前端写死文案，不承载 CMS 内容。
 */
const SITE_DICTIONARY: Record<SiteLocale, SiteDictionary> = {
  en: enDictionary,
  zh: zhDictionary,
}

/**
 * 将任意输入归一化为站点支持的语言
 * @param value 原始语言值
 * @returns 可用语言；不支持时返回 null
 */
export function normalizeSiteLocale(value?: string | null): SiteLocale | null {
  if (!value) {
    return null
  }

  const normalized = value.toLowerCase()

  if (normalized.startsWith('zh')) {
    return 'zh'
  }

  if (normalized.startsWith('en')) {
    return 'en'
  }

  return null
}

/**
 * 获取 Payload 读取时的语言回退配置
 * @param locale 当前站点语言
 * @returns Payload 本地化读取参数
 */
export function getPayloadLocaleOptions(locale: SiteLocale): {
  fallbackLocale?: SiteLocale
  locale: SiteLocale
} {
  return locale === DEFAULT_CONTENT_LOCALE
    ? { locale }
    : {
        locale,
        fallbackLocale: DEFAULT_CONTENT_LOCALE,
      }
}

/**
 * 获取前台静态字典
 * @param locale 当前站点语言
 * @returns 对应语言的静态文案
 */
export function getSiteDictionary(locale: SiteLocale) {
  return SITE_DICTIONARY[locale]
}

/**
 * 生成带站点名的 logo alt 文案
 * @param locale 当前站点语言
 * @param siteName 站点名称
 * @returns 适用于品牌图标的 alt 文案
 */
export function getSiteLogoAlt(locale: SiteLocale, siteName?: string | null): string {
  const dictionary = getSiteDictionary(locale)
  const siteNameText = siteName?.trim()

  if (!siteNameText) {
    return dictionary.common.siteLogoAlt
  }

  return `${siteNameText} ${dictionary.common.siteLogoSuffix}`
}

/**
 * 生成社交分享图 alt 文案
 * @param locale 当前站点语言
 * @param siteName 站点名称
 * @returns 适用于 SEO 分享图的 alt 文案
 */
export function getSocialPreviewAlt(locale: SiteLocale, siteName?: string | null): string | undefined {
  const siteNameText = siteName?.trim()

  if (!siteNameText) {
    return undefined
  }

  return `${siteNameText} ${getSiteDictionary(locale).common.socialPreviewSuffix}`
}

/**
 * 获取日期格式化所需的浏览器 locale
 * @param locale 当前站点语言
 * @returns 可传入 Intl / Date 的 locale 值
 */
export function getDateLocale(locale: SiteLocale): string {
  return locale === 'zh' ? 'zh-CN' : 'en-US'
}
