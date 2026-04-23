/** 站点首选访问地址 */
export const PREFERRED_SITE_URL = 'https://noumi.ai'

/** 不应参与前台 URL 规范化重定向的路径前缀 */
const REDIRECT_EXCLUDED_PREFIXES = ['/api', '/admin', '/_next', '/assets']

/** 不应参与前台 URL 规范化重定向的独立文件路径 */
const REDIRECT_EXCLUDED_PATHS = ['/favicon.ico', '/robots.txt', '/sitemap.xml', '/Noumi-Logo.svg']

/** 带文件扩展名的路径通常是静态资源，不按页面 URL 处理 */
const FILE_EXTENSION_PATTERN = /\/[^/?#]+\.[^/?#]+$/

/**
 * 判断 href 是否属于外链或非页面跳转协议
 * @param href 待检查链接
 * @returns 是否应跳过站内 URL 规范化
 */
function isExternalOrSpecialHref(href: string): boolean {
  return (
    href.startsWith('#') ||
    href.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(href)
  )
}

/**
 * 判断路径是否像静态资源文件
 * @param pathname URL pathname
 * @returns 是否为文件路径
 */
export function isFilePathname(pathname: string): boolean {
  return FILE_EXTENSION_PATTERN.test(pathname)
}

/**
 * 将站内页面 pathname 归一化为不带 trailing slash 的首选形式
 * @param pathname 站内 pathname
 * @returns 首选 pathname
 */
export function normalizePreferredPathname(pathname: string): string {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (normalizedPathname === '/' || isFilePathname(normalizedPathname)) {
    return normalizedPathname
  }

  return normalizedPathname.replace(/\/+$/, '') || '/'
}

/**
 * 规范化站内 href，保留 query/hash，外链、锚点、mailto 等不变
 * @param href 原始链接
 * @param siteUrl 当前站点地址，用于识别绝对形式的本站链接
 * @returns 首选 href
 */
export function normalizeSiteHref(href: string, siteUrl = PREFERRED_SITE_URL): string {
  const trimmedHref = href.trim()

  if (!trimmedHref) {
    return trimmedHref
  }

  const siteOrigin = new URL(siteUrl).origin

  if (/^https?:\/\//i.test(trimmedHref)) {
    const url = new URL(trimmedHref)

    if (url.origin !== siteOrigin) {
      return trimmedHref
    }

    url.pathname = normalizePreferredPathname(url.pathname)
    return `${url.pathname}${url.search}${url.hash}`
  }

  if (isExternalOrSpecialHref(trimmedHref)) {
    return trimmedHref
  }

  const suffixIndex = findUrlSuffixIndex(trimmedHref)
  const pathname = suffixIndex === -1 ? trimmedHref : trimmedHref.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : trimmedHref.slice(suffixIndex)

  if (!pathname || !pathname.startsWith('/')) {
    return trimmedHref
  }

  return `${normalizePreferredPathname(pathname)}${suffix}`
}

/**
 * 构建符合首选无 trailing slash 规则的绝对 URL
 * @param pathname 站内路径
 * @param siteUrl 站点地址
 * @returns 绝对 URL
 */
export function buildPreferredAbsoluteUrl(pathname: string, siteUrl = PREFERRED_SITE_URL): string {
  return new URL(normalizeSiteHref(pathname, siteUrl), siteUrl).toString()
}

/**
 * 获取需要 301 到首选 URL 版本的目标 pathname
 * @param request 请求方法与 pathname
 * @returns 需要重定向的 pathname；无需重定向时返回 null
 */
export function getCanonicalRedirectPath(request: {
  method: string
  pathname: string
}): null | string {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return null
  }

  const pathname = request.pathname

  if (
    pathname === '/' ||
    !pathname.endsWith('/') ||
    REDIRECT_EXCLUDED_PATHS.includes(pathname) ||
    REDIRECT_EXCLUDED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ||
    isFilePathname(pathname)
  ) {
    return null
  }

  return normalizePreferredPathname(pathname)
}

/**
 * 查找 query 或 hash 在 href 中的起始位置
 * @param href 原始 href
 * @returns query/hash 起始下标；不存在时返回 -1
 */
function findUrlSuffixIndex(href: string): number {
  const queryIndex = href.indexOf('?')
  const hashIndex = href.indexOf('#')
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0)

  return indexes.length > 0 ? Math.min(...indexes) : -1
}
