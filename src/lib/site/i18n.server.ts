import { cookies, headers } from 'next/headers'

import { DEFAULT_CONTENT_LOCALE, normalizeSiteLocale, type SiteLocale } from '@/lib/site/i18n'

/**
 * 推断当前请求语言
 * 优先使用 cookie，其次回退到浏览器 Accept-Language。
 * @returns 当前请求应使用的站点语言
 */
export async function getRequestLocale(): Promise<SiteLocale> {
  const cookieStore = await cookies()
  const cookieLocale = normalizeSiteLocale(cookieStore.get('noumi-locale')?.value)

  if (cookieLocale) {
    return cookieLocale
  }

  const headerStore = await headers()
  const acceptLanguage = headerStore.get('accept-language') ?? ''
  const browserLocale = acceptLanguage
    .split(',')
    .map((item) => normalizeSiteLocale(item.split(';')[0]?.trim()))
    .find((locale): locale is SiteLocale => Boolean(locale))

  return browserLocale ?? DEFAULT_CONTENT_LOCALE
}
