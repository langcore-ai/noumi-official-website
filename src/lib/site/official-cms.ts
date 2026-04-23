import { cache } from 'react'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { OFFICIAL_SITE_URL } from '@/lib/site/official-site'
import { normalizeSiteHref } from '@/lib/site/url'
import type {
  BlogPost,
  FaqItem,
  Media,
  PrivacyPage,
  TermsPage,
  UseCasePage,
} from '@/payload-types'

/**
 * Payload SEO 插件写入的页面级 metadata。
 */
type CmsSeoMeta = {
  /** SEO 标题 */
  title?: null | string
  /** SEO 描述 */
  description?: null | string
  /** 分享图 */
  image?: Media | number | null
}

/**
 * 过滤空值
 * @param value 值
 * @returns 是否为有效值
 */
function isPresent<T>(value: null | T | undefined): value is T {
  return value != null
}

/**
 * 将 slug 转成更适合导航显示的短标题
 * @param value slug 或原始标题
 * @returns 可显示标题
 */
function humanizeSlug(value: string): string {
  // 先把短横线和下划线统一成空格，再按单词首字母大写
  return value
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * 正式站点按钮配置
 */
export type OfficialButton = {
  /** 按钮文案 */
  label: string
  /** 跳转链接 */
  href: string
}

/**
 * 正式站点图片分节
 */
export type OfficialImageSection = {
  /** 分节类型 */
  type: 'image'
  /** 可选角标 */
  label?: string
  /** 可选标题 */
  title?: string
  /** 图片资源 */
  image: Media | null
  /** 替代文本 */
  alt?: string
  /** 图片说明 */
  caption?: string
}

/**
 * 正式站点富文本分节
 */
export type OfficialRichTextSection = {
  /** 分节类型 */
  type: 'richText'
  /** 可选角标 */
  label?: string
  /** 可选标题 */
  title?: string
  /** 可选描述 */
  description?: string
  /** 段落 */
  paragraphs: string[]
  /** 列表 */
  bullets: string[]
  /** 样式 */
  style: 'article' | 'panel' | 'plain'
}

/**
 * 正式站点 Markdown 分节
 */
export type OfficialMarkdownSection = {
  /** 分节类型 */
  type: 'markdown'
  /** 可选角标 */
  label?: string
  /** 可选标题 */
  title?: string
  /** Markdown 原稿 */
  markdown: string
}

/**
 * 正式站点 CTA 分节
 */
export type OfficialCtaSection = {
  /** 分节类型 */
  type: 'cta'
  /** 可选角标 */
  label?: string
  /** 可选标题 */
  title?: string
  /** 可选描述 */
  description?: string
  /** 主按钮 */
  primaryCta?: OfficialButton
  /** 次按钮 */
  secondaryCta?: OfficialButton
}

/**
 * 正式站点正文分节
 */
export type OfficialContentSection =
  | OfficialCtaSection
  | OfficialImageSection
  | OfficialMarkdownSection
  | OfficialRichTextSection

/**
 * Use case 页签项
 */
export type OfficialUseCaseNavItem = {
  /** 页面 slug */
  slug: string
  /** 页签文案 */
  label: string
  /** 页面标题 */
  title: string
}

/**
 * Workflow 步骤
 */
export type OfficialUseCaseWorkflowStep = {
  /** 左侧步骤标题 */
  title: string
  /** 右侧面板标题 */
  panelTitle: string
  /** 右侧面板描述 */
  panelDescription?: string
  /** 右侧面板 Markdown */
  panelMarkdown: string
  /** 面板底部标签 */
  footerLabel?: string
  /** 面板底部徽标 */
  footerBadge?: string
}

/**
 * Testimonial 视图
 */
export type OfficialUseCaseTestimonial = {
  /** 评价内容 */
  quote: string
  /** 姓名 */
  name: string
  /** 身份 */
  role: string
  /** 头像 */
  avatar: Media | null
}

/**
 * Use case 详情页视图
 */
export type OfficialUseCasePageView = {
  /** 页面 slug */
  slug: string
  /** 前台渲染模式 */
  renderMode: 'html' | 'template'
  /** HTML 模式源码 */
  htmlContent?: string
  /** 页签文案 */
  navigationLabel: string
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** Hero 角标 */
  heroEyebrow?: string
  /** Hero 标题 */
  heroTitle?: string
  /** Hero 描述 */
  heroDescription?: string
  /** Hero 导语 */
  heroLead?: string
  /** Hero CTA */
  heroPrimaryCta?: OfficialButton
  /** 痛点列表 */
  painPoints: string[]
  /** Workflow 角标 */
  workflowEyebrow?: string
  /** Workflow 标题 */
  workflowTitle?: string
  /** Workflow 描述 */
  workflowDescription?: string
  /** Workflow 步骤 */
  workflowSteps: OfficialUseCaseWorkflowStep[]
  /** Testimonials 角标 */
  testimonialsEyebrow?: string
  /** Testimonials 标题 */
  testimonialsTitle?: string
  /** Testimonials 描述 */
  testimonialsDescription?: string
  /** Testimonials 列表 */
  testimonials: OfficialUseCaseTestimonial[]
  /** CTA 角标 */
  ctaEyebrow?: string
  /** CTA 标题 */
  ctaTitle?: string
  /** CTA 描述 */
  ctaDescription?: string
  /** CTA 按钮 */
  ctaButton?: OfficialButton
  /** 追加内容分节 */
  sections: OfficialContentSection[]
}

/**
 * Blog 列表项视图
 */
export type OfficialBlogPostSummary = {
  /** 文章 slug */
  slug: string
  /** 标题 */
  title: string
  /** 摘要 */
  excerpt?: string
  /** 导语 */
  lead?: string
  /** 作者 */
  author?: string
  /** 发布时间 */
  publishedAt?: string
  /** 阅读时长 */
  readingTime?: string
  /** 标签 */
  tags: string[]
  /** 封面 */
  coverImage: Media | null
}

/**
 * Blog 详情页视图
 */
export type OfficialBlogPostView = OfficialBlogPostSummary & {
  /** 前台渲染模式 */
  renderMode: 'html' | 'template'
  /** HTML 模式源码 */
  htmlContent?: string
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** 正文分节 */
  sections: OfficialContentSection[]
  /** 推荐文章 */
  relatedPosts: OfficialBlogPostSummary[]
}

/**
 * FAQ 条目
 */
export type OfficialFaqItemView = {
  /** FAQ 主键 */
  id: string
  /** 问题 */
  question: string
  /** 回答 */
  answer: string
}

/**
 * FAQ 分组
 */
export type OfficialFaqCategoryView = {
  /** 分组标题 */
  title: string
  /** 分组条目 */
  items: OfficialFaqItemView[]
}

/**
 * 法律页面视图
 */
export type OfficialLegalPageView = {
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** Hero 角标 */
  heroEyebrow?: string
  /** Hero 标题 */
  heroTitle?: string
  /** Hero 描述 */
  heroDescription?: string
  /** 正文分节 */
  sections: OfficialContentSection[]
}

/**
 * 读取 Payload 客户端
 * @returns Payload 实例
 */
const getPayloadClient = cache(async () => getPayload({ config: await config }))

/**
 * 判断当前是否为草稿预览
 * @returns 是否启用草稿模式
 */
async function isDraftPreviewEnabled(): Promise<boolean> {
  const preview = await draftMode()
  return preview.isEnabled
}

/**
 * 获取公开查询参数
 * @returns 公开查询参数
 */
async function getPublicReadOptions(): Promise<{ draft?: boolean; overrideAccess?: false }> {
  if (await isDraftPreviewEnabled()) {
    return { draft: true }
  }

  return { overrideAccess: false }
}

/**
 * 清洗文本
 * @param value 原始值
 * @returns 清洗后的文本
 */
function normalizeText(value?: null | string): string | undefined {
  const text = value?.trim()
  return text ? text : undefined
}

/**
 * 提取数组中的文本字段
 * @param items 原始数组
 * @returns 文本列表
 */
function extractTextArray(items?: Array<{ text?: null | string } | null> | null): string[] {
  return (items ?? [])
    .map((item) => normalizeText(item?.text))
    .filter((item): item is string => Boolean(item))
}

/**
 * 规范化媒体对象
 * @param value 原始媒体值
 * @returns 媒体对象或 null
 */
function normalizeMedia(value?: Media | number | null): Media | null {
  return value && typeof value === 'object' ? value : null
}

/**
 * 规范化 Payload SEO 插件字段
 * @param meta 插件写入的 meta 分组
 * @returns 前台 metadata 视图
 */
function normalizeSeoMeta(meta?: CmsSeoMeta | null): {
  metaDescription?: string
  metaTitle?: string
  ogImage: Media | null
} {
  return {
    metaTitle: normalizeText(meta?.title),
    metaDescription: normalizeText(meta?.description),
    ogImage: normalizeMedia(meta?.image),
  }
}

/**
 * 格式化 HTML 模式 blog 卡片日期
 * @param value ISO 日期或原始日期
 * @returns 卡片展示日期
 */
function formatHtmlBlogCardDate(value?: null | string): string | undefined {
  const text = normalizeText(value)

  if (!text) {
    return undefined
  }

  const date = new Date(text)

  if (Number.isNaN(date.getTime())) {
    return text
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)
}

/**
 * 映射按钮
 * @param label 按钮文案
 * @param href 按钮链接
 * @returns 按钮配置
 */
function mapButton(label?: null | string, href?: null | string): OfficialButton | undefined {
  const normalizedLabel = normalizeText(label)
  const normalizedHref = normalizeText(href)

  if (!normalizedLabel || !normalizedHref) {
    return undefined
  }

  return {
    label: normalizedLabel,
    href: normalizeSiteHref(normalizedHref, OFFICIAL_SITE_URL),
  }
}

/**
 * 映射通用内容分节
 * @param sections 原始分节
 * @returns 分节视图
 */
function mapSections(
  sections?: Array<
    | {
        blockType?: null | string
        label?: null | string
        title?: null | string
        description?: null | string
        paragraphs?: Array<{ text?: null | string } | null> | null
        bullets?: Array<{ text?: null | string } | null> | null
        markdown?: null | string
        style?: null | string
        primaryCtaLabel?: null | string
        primaryCtaHref?: null | string
        secondaryCtaLabel?: null | string
        secondaryCtaHref?: null | string
        image?: Media | number | null
        alt?: null | string
        caption?: null | string
      }
    | null
  >
    | null,
): OfficialContentSection[] {
  return (sections ?? [])
    .map((section) => {
      const label = normalizeText(section?.label)
      const title = normalizeText(section?.title)
      const description = normalizeText(section?.description)
      const paragraphs = extractTextArray(section?.paragraphs)
      const bullets = extractTextArray(section?.bullets)

      switch (section?.blockType) {
        case 'rich-text-section':
          if (!label && !title && !description && paragraphs.length === 0 && bullets.length === 0) {
            return null
          }

          return {
            type: 'richText',
            label,
            title,
            description,
            paragraphs,
            bullets,
            style:
              section.style === 'article' || section.style === 'plain'
                ? section.style
                : 'panel',
          } satisfies OfficialRichTextSection
        case 'markdown-document': {
          const markdown = normalizeText(section.markdown)

          if (!markdown) {
            return null
          }

          return {
            type: 'markdown',
            label,
            title,
            markdown,
          } satisfies OfficialMarkdownSection
        }
        case 'cta-section': {
          const primaryCta = mapButton(section.primaryCtaLabel, section.primaryCtaHref)
          const secondaryCta = mapButton(section.secondaryCtaLabel, section.secondaryCtaHref)

          if (!label && !title && !description && !primaryCta && !secondaryCta) {
            return null
          }

          return {
            type: 'cta',
            label,
            title,
            description,
            primaryCta,
            secondaryCta,
          } satisfies OfficialCtaSection
        }
        case 'image-section': {
          const image = normalizeMedia(section.image)

          if (!image) {
            return null
          }

          return {
            type: 'image',
            label,
            title,
            image,
            alt: normalizeText(section.alt),
            caption: normalizeText(section.caption),
          } satisfies OfficialImageSection
        }
        default:
          return null
      }
    })
    .filter(isPresent)
}

/**
 * 映射 Use case 摘要
 * @param page 原始文档
 * @returns 页签视图
 */
function mapUseCaseNavItem(page: UseCasePage): OfficialUseCaseNavItem | null {
  const slug = normalizeText(page.slug)
  const navigationLabel =
    normalizeText(page.navigationLabel) ??
    normalizeText(page.hero?.title)?.replace(/^Noumi\s+for\s+/i, 'For ') ??
    (slug ? humanizeSlug(slug) : undefined)
  const title =
    normalizeText(page.hero?.title) ??
    normalizeText(page.navigationLabel) ??
    (slug ? humanizeSlug(slug) : undefined)

  if (!slug || !navigationLabel || !title) {
    return null
  }

  return {
    slug,
    label: navigationLabel,
    title,
  }
}

/**
 * 获取全部已发布 use case 页签
 * @returns use case 页签列表
 */
export async function getOfficialUseCaseNavItems(): Promise<OfficialUseCaseNavItem[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 100,
    sort: 'slug',
    ...(await getPublicReadOptions()),
  })

  return docs
    .map((doc) => mapUseCaseNavItem(doc))
    .filter(isPresent)
}

/**
 * 获取单个 use case 页面
 * @param slug 页面 slug
 * @returns use case 视图
 */
export async function getOfficialUseCasePage(
  slug: string,
): Promise<null | OfficialUseCasePageView> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
    ...(await getPublicReadOptions()),
  })
  const page = docs[0]

  if (!page) {
    return null
  }

  return {
    slug: page.slug,
    renderMode: page.renderMode === 'html' ? 'html' : 'template',
    htmlContent: normalizeText(page.htmlContent),
    navigationLabel:
      normalizeText(page.navigationLabel) ??
      normalizeText(page.hero?.title)?.replace(/^Noumi\s+for\s+/i, 'For ') ??
      page.slug,
    ...normalizeSeoMeta(page.meta),
    heroEyebrow: normalizeText(page.hero?.eyebrow),
    heroTitle: normalizeText(page.hero?.title),
    heroDescription: normalizeText(page.hero?.description),
    heroLead: normalizeText(page.heroLead),
    heroPrimaryCta: mapButton(page.hero?.primaryCtaLabel, page.hero?.primaryCtaHref),
    painPoints: extractTextArray(page.painPoints),
    workflowEyebrow: normalizeText(page.workflowEyebrow),
    workflowTitle: normalizeText(page.workflowTitle),
    workflowDescription: normalizeText(page.workflowDescription),
    workflowSteps: (page.workflowSteps ?? [])
      .map((step) => {
        const title = normalizeText(step?.title)
        const panelTitle = normalizeText(step?.panelTitle)
        const panelMarkdown = normalizeText(step?.panelMarkdown)

        if (!title || !panelTitle || !panelMarkdown) {
          return null
        }

        return {
          title,
          panelTitle,
          panelDescription: normalizeText(step?.panelDescription),
          panelMarkdown,
          footerLabel: normalizeText(step?.footerLabel),
          footerBadge: normalizeText(step?.footerBadge),
        } satisfies OfficialUseCaseWorkflowStep
      })
      .filter(isPresent),
    testimonialsEyebrow: normalizeText(page.testimonialsEyebrow),
    testimonialsTitle: normalizeText(page.testimonialsTitle),
    testimonialsDescription: normalizeText(page.testimonialsDescription),
    testimonials: (page.testimonials ?? [])
      .map((item) => {
        const quote = normalizeText(item?.quote)
        const name = normalizeText(item?.name)
        const role = normalizeText(item?.role)

        if (!quote || !name || !role) {
          return null
        }

        return {
          quote,
          name,
          role,
          avatar: normalizeMedia(item?.avatar),
        } satisfies OfficialUseCaseTestimonial
      })
      .filter(isPresent),
    ctaEyebrow: normalizeText(page.ctaEyebrow),
    ctaTitle: normalizeText(page.ctaTitle),
    ctaDescription: normalizeText(page.ctaDescription),
    ctaButton: mapButton(page.ctaLabel, page.ctaHref),
    sections: mapSections(page.sections),
  }
}

/**
 * 映射 blog 摘要
 * @param post 原始文档
 * @returns blog 摘要
 */
function mapBlogPostSummary(post: BlogPost): OfficialBlogPostSummary | null {
  const slug = normalizeText(post.slug)
  const isHtmlMode = post.renderMode === 'html'
  const title =
    (isHtmlMode ? normalizeText(post.htmlCardTitle) : undefined) ??
    normalizeText(post.title) ??
    (slug ? humanizeSlug(slug) : undefined)

  if (!slug || !title) {
    return null
  }

  return {
    slug,
    title,
    excerpt: isHtmlMode ? normalizeText(post.htmlCardDescription) : normalizeText(post.excerpt),
    lead: normalizeText(post.lead),
    author: normalizeText(post.author),
    publishedAt: isHtmlMode
      ? formatHtmlBlogCardDate(post.publishedAt || post.createdAt)
      : normalizeText(post.publishedAt),
    readingTime: isHtmlMode ? normalizeText(post.htmlCardReadingTime) : normalizeText(post.readingTime),
    tags: isHtmlMode
      ? [normalizeText(post.htmlCardTag)].filter((tag): tag is string => Boolean(tag))
      : (post.tags ?? [])
          .map((tag) => normalizeText(tag?.tag))
          .filter((tag): tag is string => Boolean(tag)),
    coverImage: isHtmlMode ? normalizeMedia(post.htmlCardImage) : normalizeMedia(post.coverImage),
  }
}

/**
 * 获取 blog 列表
 * @returns blog 列表项
 */
export async function getOfficialBlogPosts(): Promise<OfficialBlogPostSummary[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
    ...(await getPublicReadOptions()),
  })

  return docs
    .map((doc) => mapBlogPostSummary(doc))
    .filter((item): item is OfficialBlogPostSummary => Boolean(item))
}

/**
 * 获取 blog 详情
 * @param slug 文章 slug
 * @returns 文章详情
 */
export async function getOfficialBlogPost(slug: string): Promise<null | OfficialBlogPostView> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
    ...(await getPublicReadOptions()),
  })
  const post = docs[0]

  if (!post) {
    return null
  }

  const summary = mapBlogPostSummary(post)

  if (!summary) {
    return null
  }

  const relatedPosts = (post.relatedPosts ?? [])
    .map((item) => (item && typeof item === 'object' ? mapBlogPostSummary(item as BlogPost) : null))
    .filter((item): item is OfficialBlogPostSummary => Boolean(item))

  const fallbackRelatedPosts =
    relatedPosts.length > 0
      ? relatedPosts
      : (await getOfficialBlogPosts()).filter((item) => item.slug !== slug).slice(0, 1)

  return {
    ...summary,
    renderMode: post.renderMode === 'html' ? 'html' : 'template',
    htmlContent: normalizeText(post.htmlContent),
    ...normalizeSeoMeta({
      ...post.meta,
      description: post.meta?.description ?? post.htmlCardDescription,
      title: post.meta?.title ?? post.htmlCardTitle,
    }),
    sections: mapSections(post.sections),
    relatedPosts: fallbackRelatedPosts,
  }
}

/**
 * 获取 FAQ 分组
 * @returns FAQ 分组列表
 */
export async function getOfficialFaqCategories(): Promise<OfficialFaqCategoryView[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'faq-items',
    depth: 0,
    limit: 200,
    sort: 'sortOrder',
    where: {
      isActive: {
        equals: true,
      },
    },
    ...(await getPublicReadOptions()),
  })

  const groupedItems = new Map<string, OfficialFaqCategoryView>()

  docs.forEach((item: FaqItem) => {
    const categoryTitle = normalizeText(item.category)
    const question = normalizeText(item.question)
    const answer = normalizeText(item.answer)

    if (!categoryTitle || !question || !answer) {
      return
    }

    if (!groupedItems.has(categoryTitle)) {
      groupedItems.set(categoryTitle, {
        title: categoryTitle,
        items: [],
      })
    }

    groupedItems.get(categoryTitle)?.items.push({
      id: String(item.id),
      question,
      answer,
    })
  })

  return Array.from(groupedItems.values())
}

/**
 * 映射法律页面
 * @param page 原始文档
 * @returns 法律页面视图
 */
function mapLegalPage(page: PrivacyPage | TermsPage): OfficialLegalPageView {
  return {
    metaTitle: normalizeText(page.metaTitle),
    metaDescription: normalizeText(page.metaDescription),
    ogImage: normalizeMedia(page.ogImage),
    heroEyebrow: normalizeText(page.hero?.eyebrow),
    heroTitle: normalizeText(page.hero?.title),
    heroDescription: normalizeText(page.hero?.description),
    sections: mapSections(page.sections),
  }
}

/**
 * 获取隐私政策页
 * @returns 页面视图
 */
export async function getOfficialPrivacyPage(): Promise<OfficialLegalPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'privacy-page',
    depth: 1,
    ...(await getPublicReadOptions()),
  })

  return mapLegalPage(page)
}

/**
 * 获取服务条款页
 * @returns 页面视图
 */
export async function getOfficialTermsPage(): Promise<OfficialLegalPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'terms-page',
    depth: 1,
    ...(await getPublicReadOptions()),
  })

  return mapLegalPage(page)
}
