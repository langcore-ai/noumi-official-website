import type { Access, CollectionConfig, GlobalConfig, PayloadRequest } from 'payload'

import { DEFAULT_CONTENT_LOCALE, normalizeSiteLocale, SITE_LOCALE_COOKIE, type SiteLocale } from '@/lib/site/i18n'

/** 统一草稿配置 */
const DRAFTS_CONFIG = {
  autosave: true,
  schedulePublish: true,
  validate: false,
} as const

/** 公开内容集合的版本配置 */
export const PUBLIC_COLLECTION_VERSIONS = {
  drafts: DRAFTS_CONFIG,
  maxPerDoc: 50,
} satisfies NonNullable<CollectionConfig['versions']>

/** 公开全局配置的版本配置 */
export const PUBLIC_GLOBAL_VERSIONS = {
  drafts: DRAFTS_CONFIG,
  max: 50,
} satisfies NonNullable<GlobalConfig['versions']>

/** 仅允许登录用户执行的访问控制 */
export const authenticatedAccess: Access = ({ req: { user } }) => Boolean(user)

/**
 * 判断当前读取是否显式请求草稿内容
 * @param req Payload 请求对象
 * @returns 是否为草稿读取
 */
function isDraftReadRequest(req: PayloadRequest): boolean {
  const queryDraft = req.query?.draft

  if (queryDraft === true || queryDraft === 'true') {
    return true
  }

  return req.searchParams?.get('draft') === 'true'
}

/**
 * 公开集合默认只允许读取已发布版本
 * 后台用户仍可读取全部状态，便于编辑、审核与回滚。
 */
export const publishedDocumentReadAccess: Access = ({ req }) => {
  if (req.user) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}

/**
 * 公开 global 默认仅允许匿名读取已发布内容
 * 匿名显式请求草稿时直接拒绝，避免通过公开 API 读取未发布版本。
 */
export const publishedGlobalReadAccess: Access = ({ req }) => {
  if (req.user) {
    return true
  }

  return !isDraftReadRequest(req)
}

/** 支持预览的集合 slug */
type PreviewCollectionSlug = 'blog-posts' | 'feature-pages' | 'use-case-pages'
/** 支持预览的全局 slug */
type PreviewGlobalSlug =
  | 'about-page'
  | 'legal-pages'
  | 'pricing-page'
  | 'site-settings'

/** 预览文档的最小结构 */
type PreviewDoc = {
  slug?: null | string
}

/** 全局页面预览路径映射 */
const GLOBAL_PREVIEW_PATHS: Record<PreviewGlobalSlug, string> = {
  'about-page': '/about/',
  'legal-pages': '/privacy/',
  'pricing-page': '/pricing/',
  'site-settings': '/',
}

/**
 * 清洗预览跳转路径，避免把预览能力变成开放重定向入口
 * @param value 原始路径
 * @returns 可安全跳转的站内路径
 */
export function sanitizePreviewPath(value?: null | string): string {
  const path = value?.trim()

  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/'
  }

  return path
}

/**
 * 解析预览语言，异常值统一回退到默认语言
 * @param locale 原始语言
 * @returns 站点可识别的语言
 */
export function resolvePreviewLocale(locale?: null | string): SiteLocale {
  return normalizeSiteLocale(locale) ?? DEFAULT_CONTENT_LOCALE
}

/**
 * 获取预览密钥
 * 优先支持独立的预览密钥，未配置时回退到 Payload 主密钥。
 * @returns 预览密钥；缺失时返回 null
 */
export function getPreviewSecret(): null | string {
  const secret = process.env.PAYLOAD_PREVIEW_SECRET?.trim() || process.env.PAYLOAD_SECRET?.trim()
  return secret || null
}

/**
 * 为集合文档解析预览路径
 * @param collectionSlug 集合 slug
 * @param doc 当前文档
 * @returns 预览路径；无法预览时返回 null
 */
export function getCollectionPreviewPath(
  collectionSlug: PreviewCollectionSlug,
  doc: PreviewDoc,
): null | string {
  const slug = doc.slug?.trim()

  if (!slug) {
    return null
  }

  switch (collectionSlug) {
    case 'blog-posts':
      return `/blog/${slug}/`
    case 'feature-pages':
      return `/features/${slug}/`
    case 'use-case-pages':
      return `/use-cases/${slug}/`
    default:
      return null
  }
}

/**
 * 为 global 解析预览路径
 * @param globalSlug global slug
 * @returns 预览路径
 */
export function getGlobalPreviewPath(globalSlug: PreviewGlobalSlug): string {
  return GLOBAL_PREVIEW_PATHS[globalSlug]
}

/**
 * 构建后台预览地址
 * @param args 预览参数
 * @returns 可交给 Payload 后台的预览 URL
 */
export function buildPreviewURL(args: {
  locale?: null | string
  path?: null | string
}): null | string {
  if (args.path == null) {
    return null
  }

  const path = sanitizePreviewPath(args.path)
  const secret = getPreviewSecret()

  if (!secret) {
    return null
  }

  const searchParams = new URLSearchParams({
    locale: resolvePreviewLocale(args.locale),
    path,
    secret,
  })

  return `/api/preview?${searchParams.toString()}`
}

/**
 * 构建退出预览地址
 * @param path 退出后跳转的路径
 * @returns 退出预览 URL
 */
export function buildExitPreviewURL(path = '/'): string {
  const searchParams = new URLSearchParams({
    path: sanitizePreviewPath(path),
  })

  return `/api/preview/exit?${searchParams.toString()}`
}

/**
 * 预览模式下需要写入的语言 cookie
 * @param locale 当前预览语言
 * @returns cookie 写入参数
 */
export function createPreviewLocaleCookie(locale?: null | string) {
  return {
    name: SITE_LOCALE_COOKIE,
    value: resolvePreviewLocale(locale),
  }
}
