import { cache } from 'react'

import { getPayload } from 'payload'

import { DEFAULT_CONTENT_LOCALE, getPayloadLocaleOptions, type SiteLocale } from '@/lib/site/i18n'
import config from '@/payload.config'
import type {
  AboutPage as AboutPageDoc,
  BlogPost,
  FaqItem,
  FeaturePage,
  LegalPage,
  PricingPage as PricingPageDoc,
  SiteSetting,
  UseCasePage,
} from '@/payload-types'

/**
 * 站点导航项
 */
export type SiteNavigationItem = {
  /** 导航文案 */
  label: string
  /** 可选链接 */
  href?: string
  /** 子导航 */
  children?: Array<{
    /** 子项文案 */
    label: string
    /** 子项链接 */
    href: string
  }>
}

/**
 * 页脚列
 */
export type SiteFooterColumn = {
  /** 列标题 */
  title: string
  /** 链接列表 */
  links: Array<{
    /** 链接文案 */
    label: string
    /** 链接地址 */
    href: string
  }>
}

/**
 * 通用内容分节
 */
export type CmsContentSection = {
  /** 可选标签 */
  label?: string
  /** 标题 */
  title: string
  /** 段落 */
  paragraphs: string[]
  /** 卡片 */
  cards?: Array<{
    /** 卡片标题 */
    title: string
    /** 卡片正文 */
    body: string
  }>
  /** 列表 */
  bullets?: string[]
}

/**
 * 从 Payload 获取共享客户端
 * @returns Payload 实例
 */
const getPayloadClient = cache(async () => getPayload({ config: await config }))

/**
 * 读取站点设置
 * @param locale 站点语言
 * @returns 站点设置
 */
export const getSiteSettings = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
    ...getPayloadLocaleOptions(locale),
  })
})

/**
 * 读取 about 全局配置
 * @param locale 站点语言
 * @returns about 内容
 */
export const getAboutPage = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'about-page',
    depth: 0,
    ...getPayloadLocaleOptions(locale),
  })
})

/**
 * 读取 pricing 全局配置
 * @param locale 站点语言
 * @returns pricing 内容
 */
export const getPricingPage = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'pricing-page',
    depth: 0,
    ...getPayloadLocaleOptions(locale),
  })
})

/**
 * 读取 legal 全局配置
 * @param locale 站点语言
 * @returns legal 内容
 */
export const getLegalPages = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'legal-pages',
    depth: 0,
    ...getPayloadLocaleOptions(locale),
  })
})

/**
 * 读取全部 feature 页面
 * @param locale 站点语言
 * @returns feature 列表
 */
export const getFeaturePages = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'feature-pages',
    depth: 1,
    limit: 100,
    ...getPayloadLocaleOptions(locale),
    sort: 'createdAt',
  })

  return result.docs
})

/**
 * 按 slug 读取 feature 页面
 * @param slug feature slug
 * @param locale 站点语言
 * @returns feature 页面
 */
export async function getFeaturePageBySlug(
  slug: string,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<FeaturePage | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'feature-pages',
    depth: 1,
    limit: 1,
    ...getPayloadLocaleOptions(locale),
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

/**
 * 读取全部 use case 页面
 * @param locale 站点语言
 * @returns use case 列表
 */
export const getUseCasePages = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 100,
    ...getPayloadLocaleOptions(locale),
    sort: 'createdAt',
  })

  return result.docs
})

/**
 * 按 slug 读取 use case 页面
 * @param slug use case slug
 * @param locale 站点语言
 * @returns use case 页面
 */
export async function getUseCasePageBySlug(
  slug: string,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<UseCasePage | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 1,
    ...getPayloadLocaleOptions(locale),
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] ?? null
}

/**
 * 读取公开博客文章
 * @param locale 站点语言
 * @returns 已发布文章列表
 */
export const getPublishedBlogPosts = cache(async (locale: SiteLocale = DEFAULT_CONTENT_LOCALE) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 100,
    ...getPayloadLocaleOptions(locale),
    sort: '-publishedAt',
    where: {
      status: {
        equals: 'published',
      },
    },
  })

  return result.docs
})

/**
 * 按 slug 读取已发布博客文章
 * @param slug 文章 slug
 * @param locale 站点语言
 * @returns 文章
 */
export async function getPublishedBlogPostBySlug(
  slug: string,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<BlogPost | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 1,
    ...getPayloadLocaleOptions(locale),
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return result.docs[0] ?? null
}

/**
 * 读取 FAQ 列表
 * @param pages 页面范围
 * @param locale 站点语言
 * @returns FAQ 列表
 */
export async function getFaqItems(
  pages: string[] | undefined,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<FaqItem[]> {
  const payload = await getPayloadClient()
  const where =
    pages && pages.length > 0
      ? {
          and: [
            {
              isActive: {
                equals: true,
              },
            },
            {
              or: pages.map((page) => ({
                page: {
                  equals: page,
                },
              })),
            },
          ],
        }
      : {
          isActive: {
            equals: true,
          },
        }

  const result = await payload.find({
    collection: 'faq-items',
    depth: 0,
    ...getPayloadLocaleOptions(locale),
    limit: 100,
    sort: 'sortOrder',
    where,
  })

  return result.docs
}

/**
 * 提取简单文本数组
 * @param items 数组字段
 * @returns 文本数组
 */
function extractTextArray(items?: Array<{ text?: string | null } | null> | null): string[] {
  return (items ?? [])
    .map((item) => item?.text?.trim())
    .filter((item): item is string => Boolean(item))
}

/**
 * 映射导航配置
 * @param siteSettings 站点设置
 * @returns 可渲染导航
 */
export function mapNavigation(siteSettings: SiteSetting): SiteNavigationItem[] {
  return (siteSettings.navLinks ?? [])
    .flatMap((item) => {
      const label = item?.label?.trim()
      if (!label) {
        return []
      }

      const href = item.href?.trim() || undefined
      const children = (item.children ?? [])
        .map((child) => {
          const childLabel = child?.label?.trim()
          const childHref = child?.href?.trim()
          if (!childLabel || !childHref) {
            return null
          }

          return {
            label: childLabel,
            href: childHref,
          }
        })
        .filter((child): child is { label: string; href: string } => Boolean(child))

      const navigationItem: SiteNavigationItem = {
        label,
      }

      // 仅在存在有效链接时写入字段，保持可选属性语义一致
      if (href) {
        navigationItem.href = href
      }

      // 仅在存在有效子导航时写入字段，避免产生多余的 undefined 属性
      if (children.length > 0) {
        navigationItem.children = children
      }

      return [navigationItem]
    })
}

/**
 * 映射页脚配置
 * @param siteSettings 站点设置
 * @returns 可渲染页脚列
 */
export function mapFooterColumns(siteSettings: SiteSetting): SiteFooterColumn[] {
  return (siteSettings.footerColumns ?? [])
    .map((column) => {
      const title = column?.title?.trim()
      if (!title) {
        return null
      }

      const links = (column.links ?? [])
        .map((link) => {
          const label = link?.label?.trim()
          const href = link?.href?.trim()
          if (!label || !href) {
            return null
          }

          return { label, href }
        })
        .filter((link): link is { label: string; href: string } => Boolean(link))

      return {
        title,
        links,
      }
    })
    .filter((column): column is SiteFooterColumn => Boolean(column))
}

/**
 * 映射首页问题卡片
 * @param siteSettings 站点设置
 * @returns 首页问题卡片
 */
export function mapHomeProblems(siteSettings: SiteSetting) {
  return (siteSettings.homeProblems ?? [])
    .map((item) => {
      const title = item?.title?.trim()
      if (!title) {
        return null
      }

      return {
        title,
        paragraphs: extractTextArray(item.paragraphs),
      }
    })
    .filter((item): item is { title: string; paragraphs: string[] } => Boolean(item))
}

/**
 * 映射首页步骤
 * @param siteSettings 站点设置
 * @returns 首页步骤
 */
export function mapHomeHowItWorks(siteSettings: SiteSetting) {
  return (siteSettings.homeHowItWorks ?? [])
    .map((item) => {
      const title = item?.title?.trim()
      const body = item?.body?.trim()
      if (!title || !body) {
        return null
      }

      return { title, body }
    })
    .filter((item): item is { title: string; body: string } => Boolean(item))
}

/**
 * 映射 feature 分节
 * @param sections feature 原始分节
 * @returns 可渲染分节
 */
export function mapContentSections(
  sections?:
    | Array<{
        label?: string | null
        title?: string | null
        paragraphs?: Array<{ text?: string | null } | null> | null
        cards?: Array<{ title?: string | null; body?: string | null } | null> | null
        bullets?: Array<{ text?: string | null } | null> | null
      } | null>
    | null,
): CmsContentSection[] {
  return (sections ?? [])
    .flatMap((section) => {
      const title = section?.title?.trim()
      if (!title) {
        return []
      }

      const cards = (section.cards ?? [])
        .map((card) => {
          const cardTitle = card?.title?.trim()
          const cardBody = card?.body?.trim()
          if (!cardTitle || !cardBody) {
            return null
          }

          return {
            title: cardTitle,
            body: cardBody,
          }
        })
        .filter((card): card is { title: string; body: string } => Boolean(card))

      const contentSection: CmsContentSection = {
        title,
        paragraphs: extractTextArray(section.paragraphs),
      }

      const label = section.label?.trim()
      if (label) {
        contentSection.label = label
      }

      if (cards.length > 0) {
        contentSection.cards = cards
      }

      const bullets = extractTextArray(section.bullets)
      if (bullets.length > 0) {
        contentSection.bullets = bullets
      }

      return [contentSection]
    })
}

/**
 * 映射 about 文本段落
 * @param page about 内容
 * @returns about 页面段落
 */
export function mapAboutParagraphs(page: AboutPageDoc, key: 'missionParagraphs' | 'storyParagraphs') {
  return extractTextArray(page[key])
}

/**
 * 映射博客正文分节
 * @param post 文章
 * @returns 可渲染分节
 */
export function mapBlogSections(post: BlogPost): Array<{
  title: string
  paragraphs: string[]
  bullets?: string[]
}> {
  return (post.contentSections ?? [])
    .flatMap((section) => {
      const title = section?.title?.trim()
      if (!title) {
        return []
      }

      const bullets = extractTextArray(section.bullets)

      const blogSection: {
        title: string
        paragraphs: string[]
        bullets?: string[]
      } = {
        title,
        paragraphs: extractTextArray(section.paragraphs),
      }

      if (bullets.length > 0) {
        blogSection.bullets = bullets
      }

      return [blogSection]
    })
}
