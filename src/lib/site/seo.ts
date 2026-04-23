import type { Metadata } from 'next'

import {
  DEFAULT_CONTENT_LOCALE,
  getDateLocale,
  getSocialPreviewAlt,
  type SiteLocale,
} from '@/lib/site/i18n'
import { getSiteSettings } from '@/lib/site/cms'
import type { Media } from '@/payload-types'

/**
 * 页面 SEO 输入参数
 */
type SeoConfig = {
  /** 页面标题 */
  title?: string | null
  /** 页面描述 */
  description?: string | null
  /** 当前页面路径，需以 / 开头 */
  pathname: string
  /** 页面类型 */
  type?: 'article' | 'website'
  /** 页面分享图 */
  image?: string | Media | null
  /** 当前语言 */
  locale: SiteLocale
}

/**
 * 结构化数据面包屑项
 */
type BreadcrumbItem = {
  /** 节点名称 */
  name: string
  /** 站内路径 */
  pathname: string
}

/**
 * 文章结构化数据输入
 */
type ArticleConfig = {
  /** 文章标题 */
  title: string
  /** 文章描述 */
  description?: string | null
  /** 文章路径 */
  pathname: string
  /** 发布时间 */
  publishedAt: string
  /** 作者 */
  author?: string | null
  /** 文章分享图 */
  image?: string | Media | null
  /** 当前语言 */
  locale: SiteLocale
}

/**
 * 构建页面完整 URL
 * @param pathname 站内路径
 * @param siteUrl 站点地址
 * @returns 绝对地址
 */
export function buildAbsoluteUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).toString()
}

/**
 * 清洗文本值，避免把空字符串输出到 metadata
 * @param value 原始值
 * @returns 清洗后的文本
 */
function normalizeText(value?: string | null): string | undefined {
  const text = value?.trim()
  return text ? text : undefined
}

/**
 * 解析媒体相对地址为完整 URL
 * @param image 图片地址或媒体对象
 * @param siteUrl 站点地址
 * @returns 可直接用于 SEO 的图片地址
 */
function resolveImageUrl(
  image: string | Media | null | undefined,
  siteUrl?: string,
): string | undefined {
  const rawUrl = typeof image === 'string' ? image.trim() : normalizeText(image?.url)

  if (!rawUrl) {
    return undefined
  }

  if (/^https?:\/\//.test(rawUrl)) {
    return rawUrl
  }

  if (!siteUrl) {
    return undefined
  }

  return buildAbsoluteUrl(rawUrl, siteUrl)
}

/**
 * 生成带后台配置的 Next metadata
 * @param config 页面 SEO 配置
 * @returns Next metadata
 */
export async function createPageMetadata(config: SeoConfig): Promise<Metadata> {
  const siteSettings = await getSiteSettings()
  const siteUrl = normalizeText(siteSettings.siteUrl)
  const title = normalizeText(config.title)
  const description =
    normalizeText(config.description) ?? normalizeText(siteSettings.defaultDescription)
  const canonical = siteUrl ? buildAbsoluteUrl(config.pathname, siteUrl) : undefined
  const ogImage =
    resolveImageUrl(config.image, siteUrl) ??
    resolveImageUrl(
      typeof siteSettings.defaultOgImage === 'object' ? siteSettings.defaultOgImage : null,
      siteUrl,
    )
  const siteName = normalizeText(siteSettings.siteName)

  return {
    title,
    description,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    openGraph: title || description || canonical || siteName || ogImage
      ? {
          type: config.type ?? 'website',
          locale: getDateLocale(config.locale).replace('-', '_'),
          title,
          description,
          url: canonical,
          siteName,
          images: ogImage
            ? [
                {
                  url: ogImage,
                  width: 1200,
                  height: 630,
                  alt: getSocialPreviewAlt(config.locale, siteName),
                },
              ]
            : undefined,
        }
      : undefined,
    twitter: title || description || ogImage
      ? {
          card: ogImage ? 'summary_large_image' : 'summary',
          title,
          description,
          images: ogImage ? [ogImage] : undefined,
        }
      : undefined,
  }
}

/**
 * 生成组织结构化数据
 * @returns Organization JSON-LD
 */
export async function createOrganizationJsonLd(locale: SiteLocale = DEFAULT_CONTENT_LOCALE) {
  const siteSettings = await getSiteSettings()
  const siteUrl = normalizeText(siteSettings.siteUrl)
  const siteName = normalizeText(siteSettings.siteName)
  const email = normalizeText(siteSettings.contactEmail)
  const description = normalizeText(siteSettings.defaultDescription)

  if (!siteUrl && !siteName && !email && !description) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': siteUrl ? `${siteUrl}/#organization` : undefined,
    name: siteName,
    url: siteUrl ? `${siteUrl}/` : undefined,
    email,
    description,
  }
}

/**
 * 生成面包屑结构化数据
 * @param items 面包屑节点
 * @returns BreadcrumbList JSON-LD
 */
export async function createBreadcrumbJsonLd(
  items: BreadcrumbItem[],
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
) {
  const siteSettings = await getSiteSettings()
  const siteUrl = normalizeText(siteSettings.siteUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl ? buildAbsoluteUrl(item.pathname, siteUrl) : undefined,
    })),
  }
}

/**
 * 生成 FAQ 结构化数据
 * @param items FAQ 列表
 * @returns FAQPage JSON-LD
 */
export function createFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * 生成文章结构化数据
 * @param config 文章信息
 * @returns Article JSON-LD
 */
export async function createArticleJsonLd(config: ArticleConfig) {
  const siteSettings = await getSiteSettings()
  const siteUrl = normalizeText(siteSettings.siteUrl)
  const siteName = normalizeText(siteSettings.siteName)
  const imageUrl =
    resolveImageUrl(config.image, siteUrl) ??
    resolveImageUrl(
      typeof siteSettings.defaultOgImage === 'object' ? siteSettings.defaultOgImage : null,
      siteUrl,
    )

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.title,
    description: normalizeText(config.description),
    url: siteUrl ? buildAbsoluteUrl(config.pathname, siteUrl) : undefined,
    datePublished: config.publishedAt,
    author: normalizeText(config.author)
      ? {
          '@type': 'Organization',
          name: normalizeText(config.author),
        }
      : undefined,
    publisher: siteName
      ? {
          '@type': 'Organization',
          name: siteName,
        }
      : undefined,
    image: imageUrl ? [imageUrl] : undefined,
  }
}
