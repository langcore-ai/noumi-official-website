import { cache } from 'react'

import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'

import { OFFICIAL_SITE_URL } from '@/lib/site/official-site'
import {
  acquireOfficialSnapshotRefreshLock,
  clearOfficialSnapshotDirty,
  createOfficialSnapshotKey,
  deleteOfficialSnapshot,
  getOfficialSnapshotRefreshState,
  readOfficialSnapshot,
  readOfficialSnapshotManifest,
  releaseOfficialSnapshotRefreshLock,
  runOfficialSnapshotTaskInBackground,
  tryWriteOfficialSnapshot,
  writeOfficialSnapshot,
  writeOfficialSnapshotManifest,
} from '@/lib/site/official-snapshot-store'
import { getSitePayloadClient } from '@/lib/site/payload-client'
import { normalizeSiteHref } from '@/lib/site/url'
import type {
  AboutPage,
  BlogPost,
  FeaturePage,
  FeaturesPage,
  FaqPage,
  FriendlyLink,
  Media,
  PrivacyPage,
  TermsPage,
  UseCasePage,
  UseCasesPage,
} from '@/payload-types'
import type { OfficialSnapshotManifest } from '@/lib/site/official-snapshot-store'

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

/** Features 首屏功能卡视觉样式 */
export type OfficialFeatureCardTone = 'execution' | 'memory' | 'skills'

/**
 * Features 首屏功能卡
 */
export type OfficialFeatureCard = {
  /** 稳定主键 */
  id: string
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description: string
  /** 支持特性列表 */
  supportedFeatures: string[]
  /** 跳转按钮 */
  cta: OfficialButton
  /** 视觉样式 */
  tone: OfficialFeatureCardTone
}

/**
 * Features footer 导航项
 */
export type OfficialFeatureNavItem = {
  /** 功能标题 */
  label: string
  /** 功能链接 */
  href: string
}

/**
 * Features 能力卡片
 */
export type OfficialAbilityCard = {
  /** 稳定主键 */
  id: string
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description: string
  /** 搜索与能力标签 */
  tags: string[]
}

/**
 * Features Use Case 卡片
 */
export type OfficialFeaturesRoleCard = {
  /** 稳定主键 */
  id: string
  /** 跳转链接 */
  href: string
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description: string
  /** 跳转文案 */
  ctaLabel: string
  /** 视觉样式 */
  tone: OfficialUseCasesCardTone
  /** 头像地址，上传优先，未上传时使用预置头像 */
  avatarSrc: string
}

/**
 * Features FAQ 条目
 */
export type OfficialFeaturesFaqItem = {
  /** FAQ 主键 */
  id: string
  /** 问题 */
  question: string
  /** 回答，允许后台配置少量 HTML */
  answer: string
}

/**
 * Features 页面视图
 */
export type OfficialFeaturesPageView = {
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** 首屏功能卡片 */
  featureCards: OfficialFeatureCard[]
  /** 第二屏能力卡片 */
  abilityCards: OfficialAbilityCard[]
  /** 第四屏 Use Case 卡片 */
  roleCards: OfficialFeaturesRoleCard[]
  /** FAQ 条目 */
  faqItems: OfficialFeaturesFaqItem[]
}

/**
 * About 页面团队成员。
 */
export type OfficialAboutTeamMember = {
  /** 稳定主键 */
  id: string
  /** 头像资源 */
  avatar: Media | null
  /** 成员名字 */
  name?: string
  /** 成员职位 */
  role?: string
  /** 成员描述 */
  description?: string
}

/**
 * About 页面 FAQ 条目。
 */
export type OfficialAboutFaqItem = {
  /** 稳定主键 */
  id: string
  /** 问题 */
  question?: string
  /** 回答，允许后台配置少量 HTML */
  answer?: string
}

/**
 * About 页面视图。
 */
export type OfficialAboutPageView = {
  /** 团队成员卡片 */
  teamMembers: OfficialAboutTeamMember[]
  /** FAQ 角标 */
  faqEyebrow?: string
  /** FAQ 标题 */
  faqTitle?: string
  /** FAQ 描述 */
  faqDescription?: string
  /** FAQ 条目 */
  faqItems: OfficialAboutFaqItem[]
}

/**
 * Feature 子页内容分节
 */
export type OfficialFeaturePageSection = {
  /** 稳定主键 */
  id: string
  /** 分节角标 */
  label?: string
  /** 分节标题 */
  title: string
  /** 分节描述 */
  description?: string
  /** 分节列表 */
  bullets: string[]
}

/**
 * Feature 子页视图
 */
export type OfficialFeaturePageView = {
  /** 页面 slug */
  slug: string
  /** 前台渲染模式 */
  renderMode: 'html' | 'template'
  /** HTML 模式源码 */
  htmlContent?: string
  /** 导航短标题 */
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
  /** Hero 主按钮 */
  heroPrimaryCta?: OfficialButton
  /** 摘要 */
  summary?: string
  /** 内容分节 */
  sections: OfficialFeaturePageSection[]
  /** CTA 标题 */
  ctaTitle?: string
  /** CTA 描述 */
  ctaDescription?: string
  /** CTA 按钮 */
  ctaButton?: OfficialButton
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

/** Use Cases 聚合页卡片视觉样式 */
export type OfficialUseCasesCardTone = 'journalist' | 'pm' | 'solutions'

/** Use Cases 聚合页卡片预置头像 */
export type OfficialUseCasesCardAvatarPreset = 'journalist' | 'pm' | 'solutions'

/**
 * Use Cases 聚合页顶部卡片
 */
export type OfficialUseCasesCard = {
  /** 指向的 use case slug */
  slug: string
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description: string
  /** 跳转文案 */
  ctaLabel: string
  /** 视觉样式 */
  tone: OfficialUseCasesCardTone
  /** 卡片头像地址，上传优先，未上传时使用预置头像 */
  avatarSrc: string
}

/**
 * Use Cases 聚合页 FAQ 条目
 */
export type OfficialUseCasesFaqItem = {
  /** FAQ 主键 */
  id: string
  /** 问题 */
  question: string
  /** 回答，允许后台配置少量 HTML */
  answer: string
}

/**
 * Use Cases 聚合页视图
 */
export type OfficialUseCasesPageView = {
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** 顶部卡片 */
  cards: OfficialUseCasesCard[]
  /** Not your role 卡片标题 */
  moreTitle: string
  /** Not your role 卡片描述 */
  moreDescription: string
  /** coming soon 胶囊 */
  comingSoonRoles: string[]
  /** FAQ 角标 */
  faqEyebrow: string
  /** FAQ 标题 */
  faqTitle: string
  /** FAQ 描述 */
  faqDescription: string
  /** FAQ 条目 */
  faqItems: OfficialUseCasesFaqItem[]
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
 * FAQ 页面视图
 */
export type OfficialFaqPageView = {
  /** 前台渲染模式 */
  renderMode: 'html' | 'template'
  /** HTML 模式源码 */
  htmlContent?: string
}

/**
 * 友情链接视图。
 */
export type OfficialFriendlyLinkView = {
  /** 稳定主键 */
  id: string
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description: string
  /** 外链地址 */
  href: string
  /** 上传头像 */
  avatar: Media | null
  /** 远程头像 URL */
  avatarUrl?: string
  /** 未上传头像时显示的标题首字母 */
  avatarLabel: string
}

/** Feature 导航查询实际需要的最小字段。 */
type FeaturePageNavSource = Pick<FeaturePage, 'slug'> &
  Partial<Pick<FeaturePage, 'hero' | 'navigationLabel'>>

/** Use Case 导航查询实际需要的最小字段。 */
type UseCaseNavSource = Pick<UseCasePage, 'slug'> &
  Partial<Pick<UseCasePage, 'hero' | 'navigationLabel'>>

/** Blog 列表卡片查询实际需要的最小字段。 */
type BlogPostSummarySource = Pick<BlogPost, 'createdAt' | 'renderMode' | 'slug'> &
  Partial<
    Pick<
      BlogPost,
      | 'author'
      | 'coverImage'
      | 'excerpt'
      | 'htmlCardDescription'
      | 'htmlCardImage'
      | 'htmlCardReadingTime'
      | 'htmlCardTag'
      | 'htmlCardTitle'
      | 'lead'
      | 'publishedAt'
      | 'readingTime'
      | 'tags'
      | 'title'
    >
  >

/** 友链卡片查询实际需要的最小字段。 */
type FriendlyLinkCardSource = Partial<
  Pick<
    FriendlyLink,
    'avatar' | 'avatarUrl' | 'description' | 'href' | 'isActive' | 'sortOrder' | 'title'
  >
> & { id: FriendlyLink['id'] }

/**
 * 法律页面视图
 */
export type OfficialLegalPageView = {
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
const getPayloadClient = cache(getSitePayloadClient)

/** 公开站点 CMS 数据缓存标签前缀。 */
const OFFICIAL_CMS_CACHE_TAG = 'official-cms'
/** 公开站点 CMS 数据默认缓存 5 分钟，避免每次访问都打到 D1。 */
const DEFAULT_OFFICIAL_CMS_REVALIDATE_SECONDS = 300

/**
 * 解析公开 CMS 缓存时间。
 * @returns Next 增量缓存 revalidate 秒数
 */
function getOfficialCmsRevalidateSeconds(): number {
  const rawValue = process.env.OFFICIAL_CMS_REVALIDATE_SECONDS
  const seconds = rawValue ? Number.parseInt(rawValue, 10) : DEFAULT_OFFICIAL_CMS_REVALIDATE_SECONDS

  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_OFFICIAL_CMS_REVALIDATE_SECONDS
}

/**
 * 缓存发布态 CMS 读取。
 * @param key 缓存键
 * @param loader 发布态读取函数
 * @returns 带 Next 增量缓存的读取函数
 */
function cachePublishedCmsRead<Args extends unknown[], Result>(
  key: string,
  loader: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return unstable_cache(loader, [OFFICIAL_CMS_CACHE_TAG, key], {
    revalidate: getOfficialCmsRevalidateSeconds(),
    tags: [OFFICIAL_CMS_CACHE_TAG, `${OFFICIAL_CMS_CACHE_TAG}:${key}`],
  })
}

/** CMS 公开读取参数。 */
type OfficialCmsReadOptions = { draft?: true; overrideAccess?: false }

/** 发布态读取必须走访问控制，避免 Local API 默认越权读取草稿。 */
const PUBLISHED_CMS_READ_OPTIONS = {
  overrideAccess: false,
} as const satisfies OfficialCmsReadOptions
/** 草稿预览读取只在密钥校验后的 draft mode 中使用。 */
const DRAFT_CMS_READ_OPTIONS = { draft: true } as const satisfies OfficialCmsReadOptions

/** 官网公开内容快照 key。 */
const OFFICIAL_SNAPSHOT_KEYS = {
  aboutPage: createOfficialSnapshotKey('about-page'),
  blogPost: (slug: string) => createOfficialSnapshotKey('blog-post', slug),
  blogPosts: createOfficialSnapshotKey('blog-posts'),
  faqCategories: createOfficialSnapshotKey('faq-categories'),
  faqPage: createOfficialSnapshotKey('faq-page'),
  featureNavItems: (includeFallback: boolean) =>
    createOfficialSnapshotKey('feature-nav-items', includeFallback ? 'with-fallback' : 'strict'),
  featurePage: (slug: string) => createOfficialSnapshotKey('feature-page', slug),
  featuresPage: createOfficialSnapshotKey('features-page'),
  friendlyLinks: createOfficialSnapshotKey('friendly-links'),
  privacyPage: createOfficialSnapshotKey('privacy-page'),
  termsPage: createOfficialSnapshotKey('terms-page'),
  caseNavItems: createOfficialSnapshotKey('use-case-nav-items'),
  casePage: (slug: string) => createOfficialSnapshotKey('use-case-page', slug),
  casesPage: createOfficialSnapshotKey('use-cases-page'),
} as const

/**
 * 判断当前是否为草稿预览
 * @returns 是否启用草稿模式
 */
async function isDraftPreviewEnabled(): Promise<boolean> {
  try {
    const preview = await draftMode()

    return preview.isEnabled
  } catch {
    // sitemap、脚本验证等非请求上下文没有 draftMode store，此时应读取公开发布内容。
    return false
  }
}

/**
 * 根据预览状态选择读取发布快照或草稿实时数据。
 * @param draftReader 草稿实时读取函数
 * @param publishedReader 发布态读取函数
 * @returns CMS 视图数据
 */
async function readDraftOrPublished<Result>(
  draftReader: () => Promise<Result>,
  publishedReader: () => Promise<Result>,
): Promise<Result> {
  if (await isDraftPreviewEnabled()) {
    return draftReader()
  }

  return publishedReader()
}

/**
 * 后台按需触发全站快照刷新。
 */
const scheduleOfficialSnapshotRefreshIfNeeded = cache(async () => {
  const state = await getOfficialSnapshotRefreshState()

  if (!state.shouldRefresh || !state.reason) {
    return
  }

  if (!(await acquireOfficialSnapshotRefreshLock(state.reason))) {
    return
  }

  await runOfficialSnapshotTaskInBackground(
    refreshOfficialSiteSnapshots({ reason: state.reason }).finally(() =>
      releaseOfficialSnapshotRefreshLock(),
    ),
  )
})

/**
 * 读取发布态快照，缺失时回源 Payload 并异步回填单项快照。
 * @param key 快照 key
 * @param sourceReader Payload 源读取函数
 * @returns 发布态内容
 */
async function readPublishedSnapshotOrSource<Result>(
  key: string,
  sourceReader: () => Promise<Result>,
): Promise<Result> {
  const snapshot = await readOfficialSnapshot<Result>(key)

  if (snapshot != null) {
    await scheduleOfficialSnapshotRefreshIfNeeded()

    return snapshot
  }

  const source = await sourceReader()

  await runOfficialSnapshotTaskInBackground(
    tryWriteOfficialSnapshot(key, source).catch((error) => {
      console.error('[official-snapshot] failed to backfill snapshot', { error, key })
    }),
  )
  await scheduleOfficialSnapshotRefreshIfNeeded()

  return source
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
 * 规范化外链地址。
 * @param value 原始链接
 * @returns 自动补齐协议后的 http/https URL
 */
function normalizeExternalHref(value?: null | string): string | undefined {
  const rawHref = normalizeText(value)

  if (!rawHref) {
    return undefined
  }

  const href = /^[a-z][a-z\d+\-.]*:/i.test(rawHref) ? rawHref : `https://${rawHref}`

  try {
    const url = new URL(href)

    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
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
 * 提取数组中的 label 字段
 * @param items 原始数组
 * @returns 文本列表
 */
function extractLabelArray(items?: Array<{ label?: null | string } | null> | null): string[] {
  return (items ?? [])
    .map((item) => normalizeText(item?.label))
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
 * 根据友链标题生成头像占位字母。
 * @param title 友链标题
 * @returns 最多两个字符的占位字母
 */
function createFriendlyLinkAvatarLabel(title: string): string {
  const normalizedTitle = title.replace(/^https?:\/\//i, '')
  const segments = normalizedTitle.split(/[^a-z0-9]+/i).filter(Boolean)

  if (segments.length >= 2) {
    return segments
      .slice(0, 2)
      .map((segment) => segment[0])
      .join('')
      .toUpperCase()
  }

  return (
    normalizedTitle
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || 'L'
  )
}

/**
 * 映射友情链接条目。
 * @param link Payload 友链文档
 * @returns 前台友链视图
 */
function mapFriendlyLink(link: FriendlyLinkCardSource): OfficialFriendlyLinkView | null {
  const title = normalizeText(link.title)
  const description = normalizeText(link.description)
  const href = normalizeExternalHref(link.href)

  if (!link.isActive || !title || !description || !href) {
    return null
  }

  return {
    id: String(link.id),
    title,
    description,
    href,
    avatar: normalizeMedia(link.avatar),
    avatarUrl: normalizeExternalHref(link.avatarUrl),
    avatarLabel: createFriendlyLinkAvatarLabel(title),
  }
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

/** Features 页面默认 SEO，用于 CMS 尚未发布配置时保持迁移页面完整可见。 */
const DEFAULT_FEATURES_META = {
  title: 'AI That Remembers, Evolves, and Executes for You | Noumi',
  description:
    "Stop re-explaining yourself. Noumi's persistent memory, self-evolving skills, and autonomous execution get more capable every single session.",
}

/** Features 首屏默认功能卡片。 */
const DEFAULT_FEATURE_CARDS: OfficialFeatureCard[] = [
  {
    id: 'persistent-memory',
    title: 'Persistent Memory',
    description:
      'Projects, preferences, and working rules load automatically across sessions. Start every task with context already in place.',
    supportedFeatures: [
      'Three-tier memory',
      'File version history & rollback',
      'Rule & preference accumulation',
      'Evolution Report',
    ],
    cta: {
      label: 'Explore Persistent Memory →',
      href: '/features/persistent-memory',
    },
    tone: 'memory',
  },
  {
    id: 'self-evolving-skills',
    title: 'Self-Evolving Skills',
    description:
      'Start with pre-built professional skills, then teach Noumi your own. Every correction and template becomes a reusable rule.',
    supportedFeatures: [
      'Global Skills Library',
      'Agent Training Ground',
      'Continuous accumulation',
      'Reusable and editable at any time',
    ],
    cta: {
      label: 'Explore Self-Evolving Skills →',
      href: '/features/self-evolving-skills',
    },
    tone: 'skills',
  },
  {
    id: 'autonomous-execution',
    title: 'Autonomous Execution',
    description:
      'Describe the task and step back. Noumi plans, researches, generates, and delivers — you stay focused on decisions, not logistics.',
    supportedFeatures: [
      'Multi-step task planning',
      'Multi-source research & synthesis',
      'Document processing',
      'Human-in-the-loop or fully autonomous',
    ],
    cta: {
      label: 'Explore Autonomous Execution →',
      href: '/features/autonomous-execution',
    },
    tone: 'execution',
  },
]

/** Features 第二屏默认能力卡片。 */
const DEFAULT_ABILITY_CARDS: OfficialAbilityCard[] = [
  {
    id: 'audio-notes',
    title: 'Transcribe Audio & Generate Meeting Notes',
    description:
      'Upload a recording. Noumi transcribes it, identifies speakers, extracts key decisions, and produces a structured summary.',
    tags: ['AI audio transcription', 'automated meeting notes', 'AI meeting summarization'],
  },
  {
    id: 'document-conversion',
    title: 'Convert Documents Between Formats',
    description:
      'Noumi converts between formats — PDF to Word, text to HTML, spreadsheet to report — while preserving content and layout.',
    tags: ['AI file format conversion', 'PDF to Word', 'text to HTML'],
  },
  {
    id: 'multi-source-research',
    title: 'Research & Synthesize From Multiple Sources',
    description:
      'Point Noumi at any topic. It searches the web, reads your files, and delivers a structured synthesis with sources.',
    tags: ['AI web research', 'multi-source synthesis', 'AI content extraction'],
  },
  {
    id: 'business-documents',
    title: 'Write Reports, Articles & Business Documents',
    description:
      'Generate reports, articles, and proposals in your established tone, following your templates and style rules.',
    tags: ['AI report generation', 'AI document generation', 'market analysis report'],
  },
  {
    id: 'tracking-systems',
    title: 'Build Lightweight Tracking Systems',
    description:
      'Describe what you need to track — bugs, candidates, sprint tasks — and Noumi builds it. No code, no configuration.',
    tags: ['AI work organization system', 'lightweight project management', 'no-code tracker'],
  },
  {
    id: 'workspace-restructure',
    title: 'Organize & Restructure Your Workspace',
    description:
      'Noumi proposes a directory structure matched to your project and reorganizes everything in one step after confirmation.',
    tags: ['AI workspace restructuring', 'automated file organization', 'AI directory management'],
  },
  {
    id: 'spreadsheets-data',
    title: 'Process Spreadsheets & Extract Structured Data',
    description:
      'Upload data files. Noumi reads the structure and produces summaries, answers questions, or reformatted outputs.',
    tags: ['AI spreadsheet handling', 'structured data extraction', 'AI content extraction'],
  },
  {
    id: 'reusable-workflows',
    title: 'Train Reusable Workflows From Your Own Standards',
    description:
      'Upload your templates and rules once. Noumi converts them into skills applied automatically to every future task.',
    tags: ['custom AI workflow', 'AI agent training', 'AI workflow capture'],
  },
]

/** Features 第四屏默认 Use Case 卡片。 */
const DEFAULT_FEATURES_ROLE_CARDS: OfficialFeaturesRoleCard[] = [
  {
    id: 'product-manager',
    href: '/use-cases/product-manager',
    title: 'Product Manager',
    description: 'The roadmap memory you never had to keep.',
    ctaLabel: 'Explore for PMs →',
    tone: 'pm',
    avatarSrc: '/assets/use-cases/avatar-pm.webp',
  },
  {
    id: 'journalist',
    href: '/use-cases/journalist',
    title: 'Journalist',
    description: 'Your beat, your voice — never rebuilt from scratch.',
    ctaLabel: 'Explore for Journalists →',
    tone: 'journalist',
    avatarSrc: '/assets/use-cases/avatar-journalist.webp',
  },
  {
    id: 'solutions-engineer',
    href: '/use-cases/solutions-engineer',
    title: 'Solutions Engineer',
    description: 'What was promised always matches what gets built.',
    ctaLabel: 'Explore for SEs →',
    tone: 'solutions',
    avatarSrc: '/assets/use-cases/avatar-se.webp',
  },
]

/** Features 默认 FAQ。 */
const DEFAULT_FEATURES_FAQ_ITEMS: OfficialFeaturesFaqItem[] = [
  {
    id: 'different-from-chatgpt',
    question: 'How is Noumi different from ChatGPT or other AI assistants?',
    answer:
      'Most AI assistants start fresh with every new conversation. Noumi maintains <strong>persistent memory across sessions</strong> — it knows your projects, preferences, and working rules without you re-explaining them. It also executes multi-step tasks autonomously and accumulates your work patterns into reusable skills over time, so it gets meaningfully better the more you use it.',
  },
  {
    id: 'file-types',
    question: 'What file types can Noumi work with?',
    answer:
      'Noumi handles documents (Word, PDF), spreadsheets (Excel, CSV), images (PNG, JPG), and audio files (MP3, WAV, M4A). Files can be uploaded directly to a project workspace, and Noumi processes them as part of any task — no separate import step required.',
  },
  {
    id: 'memory-workflow',
    question: 'How does persistent memory actually work?',
    answer:
      'When you correct an output, set a rule, or describe a preference, Noumi saves it as a memory entry tied to your project or your global profile. On future tasks, those entries are loaded automatically and shape how Noumi works. You can review, edit, or delete any entry at any time through the <strong>Evolution Report</strong>.',
  },
  {
    id: 'team-workspace',
    question: 'Can my team use the same workspace?',
    answer:
      "Yes. Workspace owners can invite collaborators on a per-project basis. Collaborators can access files, open new work threads, and contribute to the project — but cannot see each other's private conversations. File changes sync in real time across everyone in the project.",
  },
  {
    id: 'agent-training-ground',
    question: 'What is the Agent Training Ground?',
    answer:
      'The <strong>Agent Training Ground</strong> is where you proactively build project-level skills. Upload style guides, report templates, evaluation criteria, or any reference material — Noumi reads them and converts them into structured skill entries it applies automatically to every relevant task in that project.',
  },
  {
    id: 'setup',
    question: 'Do I need to set anything up before using Noumi?',
    answer:
      'No manual configuration required. After registration, Noumi guides you through a short onboarding: upload your résumé or LinkedIn profile, and it recommends a matched set of professional skills to install. You can be up and running in under five minutes.',
  },
]

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
  sections?: Array<{
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
  } | null> | null,
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
              section.style === 'article' || section.style === 'plain' ? section.style : 'panel',
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
function mapUseCaseNavItem(page: UseCaseNavSource): OfficialUseCaseNavItem | null {
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

/** Use Cases 聚合页卡片预置头像素材。 */
const USE_CASES_CARD_AVATAR_SRC_BY_PRESET: Record<OfficialUseCasesCardAvatarPreset, string> = {
  pm: '/assets/use-cases/avatar-pm.webp',
  journalist: '/assets/use-cases/avatar-journalist.webp',
  solutions: '/assets/use-cases/avatar-se.webp',
}

/**
 * 规范化 Use Cases 聚合页卡片样式
 * @param value CMS 原始样式
 * @returns 有效样式
 */
function normalizeUseCasesCardTone(value?: null | string): OfficialUseCasesCardTone {
  if (value === 'journalist' || value === 'pm' || value === 'solutions') {
    return value
  }

  return 'pm'
}

/**
 * 规范化 Use Cases 聚合页卡片预置头像
 * @param value CMS 原始预置值
 * @param fallbackTone 卡片视觉样式，用于头像未选择时兜底
 * @returns 有效预置头像
 */
function normalizeUseCasesCardAvatarPreset(
  value: null | string | undefined,
  fallbackTone: OfficialUseCasesCardTone,
): OfficialUseCasesCardAvatarPreset {
  if (value === 'journalist' || value === 'pm' || value === 'solutions') {
    return value
  }

  return fallbackTone
}

/**
 * 解析 Use Cases 聚合页卡片头像地址
 * @param card CMS 卡片
 * @param tone 卡片视觉样式
 * @returns 上传头像地址或预置头像地址
 */
function resolveUseCasesCardAvatarSrc(
  card: {
    avatarImage?: Media | number | null
    avatarPreset?: null | string
  },
  tone: OfficialUseCasesCardTone,
): string {
  const uploadedAvatar = normalizeMedia(card.avatarImage)

  if (uploadedAvatar?.url) {
    return uploadedAvatar.url
  }

  const preset = normalizeUseCasesCardAvatarPreset(card.avatarPreset, tone)

  return USE_CASES_CARD_AVATAR_SRC_BY_PRESET[preset]
}

/**
 * 规范化 Features 首屏卡片样式
 * @param value CMS 原始样式
 * @returns 有效样式
 */
function normalizeFeatureCardTone(value?: null | string): OfficialFeatureCardTone {
  if (value === 'execution' || value === 'memory' || value === 'skills') {
    return value
  }

  return 'memory'
}

/**
 * 映射 Features 首屏卡片
 * @param card CMS 卡片
 * @param index 当前序号
 * @returns 前台卡片
 */
function mapFeatureCard(
  card: NonNullable<FeaturesPage['featureCards']>[number] | null | undefined,
  index: number,
): OfficialFeatureCard | null {
  const title = normalizeText(card?.title)
  const description = normalizeText(card?.description)
  const cta = mapButton(card?.ctaLabel, card?.ctaHref)

  if (!title || !description || !cta) {
    return null
  }

  return {
    id: card?.id ?? `feature-${index}`,
    title,
    description,
    supportedFeatures: extractLabelArray(card?.supportedFeatures),
    cta,
    tone: normalizeFeatureCardTone(card?.tone),
  }
}

/**
 * 映射 Feature 子页导航项
 * @param page 原始文档
 * @returns Feature 导航项
 */
function mapFeaturePageNavItem(page: FeaturePageNavSource): OfficialFeatureNavItem | null {
  const slug = normalizeText(page.slug)
  const label =
    normalizeText(page.navigationLabel) ??
    normalizeText(page.hero?.title) ??
    (slug ? humanizeSlug(slug) : undefined)

  if (!slug || !label) {
    return null
  }

  return {
    label,
    href: `/features/${slug}`,
  }
}

/**
 * 映射 Feature 子页内容分节
 * @param section CMS 分节
 * @param index 当前序号
 * @returns 前台分节
 */
function mapFeaturePageSection(
  section: NonNullable<FeaturePage['sections']>[number] | null | undefined,
  index: number,
): OfficialFeaturePageSection | null {
  const title = normalizeText(section?.title)

  if (!title) {
    return null
  }

  return {
    id: section?.id ?? `section-${index}`,
    label: normalizeText(section?.label),
    title,
    description: normalizeText(section?.description),
    bullets: extractTextArray(section?.bullets),
  }
}

/**
 * 映射 Features 能力卡片
 * @param card CMS 卡片
 * @param index 当前序号
 * @returns 前台卡片
 */
function mapAbilityCard(
  card: NonNullable<FeaturesPage['abilityCards']>[number] | null | undefined,
  index: number,
): OfficialAbilityCard | null {
  const title = normalizeText(card?.title)
  const description = normalizeText(card?.description)

  if (!title || !description) {
    return null
  }

  return {
    id: card?.id ?? `ability-${index}`,
    title,
    description,
    tags: extractLabelArray(card?.tags),
  }
}

/**
 * 映射 Features Use Case 卡片
 * @param card CMS 卡片
 * @param index 当前序号
 * @returns 前台卡片
 */
function mapFeaturesRoleCard(
  card: NonNullable<FeaturesPage['roleCards']>[number] | null | undefined,
  index: number,
): OfficialFeaturesRoleCard | null {
  const target =
    card?.targetUseCase && typeof card.targetUseCase === 'object'
      ? mapUseCaseNavItem(card.targetUseCase)
      : null
  const title = normalizeText(card?.title)
  const description = normalizeText(card?.description)
  const ctaLabel = normalizeText(card?.ctaLabel)

  if (!target || !title || !description || !ctaLabel) {
    return null
  }

  const tone = normalizeUseCasesCardTone(card?.tone)

  return {
    id: card?.id ?? `role-${index}`,
    href: `/use-cases/${target.slug}`,
    title,
    description,
    ctaLabel,
    tone,
    avatarSrc: resolveUseCasesCardAvatarSrc(card, tone),
  }
}

/**
 * 映射 Features FAQ
 * @param item CMS FAQ 条目
 * @param index 当前序号
 * @returns 前台 FAQ
 */
function mapFeaturesFaqItem(
  item: NonNullable<FeaturesPage['faqItems']>[number] | null | undefined,
  index: number,
): OfficialFeaturesFaqItem | null {
  const question = normalizeText(item?.question)
  const answer = normalizeText(item?.answer)

  if (!question || !answer) {
    return null
  }

  return {
    id: item?.id ?? `features-faq-${index}`,
    question,
    answer,
  }
}

/**
 * 映射 About 团队成员卡片。
 * @param member CMS 团队成员
 * @param index 当前序号
 * @returns 前台团队成员卡片
 */
function mapAboutTeamMember(
  member: NonNullable<AboutPage['teamMembers']>[number] | null | undefined,
  index: number,
): OfficialAboutTeamMember | null {
  const avatar = normalizeMedia(member?.avatar)
  const name = normalizeText(member?.name)
  const role = normalizeText(member?.role)
  const description = normalizeText(member?.description)

  // 完全空白的数组行不进入前台，避免后台误留空行导致空卡片。
  if (!avatar && !name && !role && !description) {
    return null
  }

  return {
    id: member?.id ?? `team-member-${index}`,
    avatar,
    name,
    role,
    description,
  }
}

/**
 * 映射 About FAQ 条目。
 * @param item CMS FAQ 条目
 * @param index 当前序号
 * @returns 前台 FAQ 条目
 */
function mapAboutFaqItem(
  item: NonNullable<AboutPage['faqItems']>[number] | null | undefined,
  index: number,
): OfficialAboutFaqItem | null {
  const question = normalizeText(item?.question)
  const answer = normalizeText(item?.answer)

  // 完全空白的数组行不进入前台；单侧填写时保留另一侧为空。
  if (!question && !answer) {
    return null
  }

  return {
    id: item?.id ?? `about-faq-${index}`,
    question,
    answer,
  }
}

/**
 * 映射 Use Cases 聚合页卡片
 * @param card CMS 卡片
 * @returns 前台卡片
 */
function mapUseCasesCard(
  card?: NonNullable<UseCasesPage['cards']>[number] | null,
): OfficialUseCasesCard | null {
  const target =
    card?.targetUseCase && typeof card.targetUseCase === 'object'
      ? mapUseCaseNavItem(card.targetUseCase)
      : null

  if (!target) {
    return null
  }

  const title = normalizeText(card?.title)
  const description = normalizeText(card?.description)
  const ctaLabel = normalizeText(card?.ctaLabel)

  if (!title || !description || !ctaLabel) {
    return null
  }

  const tone = normalizeUseCasesCardTone(card?.tone)

  return {
    slug: target.slug,
    title,
    description,
    ctaLabel,
    tone,
    avatarSrc: resolveUseCasesCardAvatarSrc(card, tone),
  }
}

/**
 * 映射 Use Cases 专属 FAQ
 * @param item CMS FAQ 条目
 * @param index 当前序号
 * @returns 前台 FAQ
 */
function mapUseCasesFaqItem(
  item: NonNullable<UseCasesPage['faqItems']>[number] | null | undefined,
  index: number,
): OfficialUseCasesFaqItem | null {
  const question = normalizeText(item?.question)
  const answer = normalizeText(item?.answer)

  if (!question || !answer) {
    return null
  }

  return {
    id: item?.id ?? `faq-${index}`,
    question,
    answer,
  }
}

/**
 * 获取 About 页面配置。
 * @param readOptions Payload 读取参数
 * @returns About 页面视图
 */
async function readOfficialAboutPage(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialAboutPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'about-page',
    depth: 1,
    ...readOptions,
  })
  const typedPage = page as AboutPage

  return {
    teamMembers: (typedPage.teamMembers ?? [])
      .map((member, index) => mapAboutTeamMember(member, index))
      .filter(isPresent),
    faqEyebrow: normalizeText(typedPage.faqEyebrow),
    faqTitle: normalizeText(typedPage.faqTitle),
    faqDescription: normalizeText(typedPage.faqDescription),
    faqItems: (typedPage.faqItems ?? [])
      .map((item, index) => mapAboutFaqItem(item, index))
      .filter(isPresent),
  }
}

const readPublishedOfficialAboutPage = cachePublishedCmsRead('about-page', () =>
  readOfficialAboutPage(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 About 页面配置。
 * @returns About 页面视图
 */
export async function getOfficialAboutPage(): Promise<OfficialAboutPageView> {
  return readDraftOrPublished(
    () => readOfficialAboutPage(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.aboutPage,
        readPublishedOfficialAboutPage,
      ),
  )
}

/**
 * 获取 Features 页面配置
 * @param readOptions Payload 读取参数
 * @returns Features 页面视图
 */
async function readOfficialFeaturesPage(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialFeaturesPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'features-page',
    depth: 1,
    ...readOptions,
  })
  const typedPage = page as FeaturesPage
  const configuredFeatureCards = (typedPage.featureCards ?? [])
    .map((card, index) => mapFeatureCard(card, index))
    .filter(isPresent)
  const configuredAbilityCards = (typedPage.abilityCards ?? [])
    .map((card, index) => mapAbilityCard(card, index))
    .filter(isPresent)
  const configuredRoleCards = (typedPage.roleCards ?? [])
    .map((card, index) => mapFeaturesRoleCard(card, index))
    .filter(isPresent)
  const configuredFaqItems = (typedPage.faqItems ?? [])
    .map((item, index) => mapFeaturesFaqItem(item, index))
    .filter(isPresent)

  return {
    metaTitle: normalizeText(typedPage.metaTitle) ?? DEFAULT_FEATURES_META.title,
    metaDescription: normalizeText(typedPage.metaDescription) ?? DEFAULT_FEATURES_META.description,
    ogImage: normalizeMedia(typedPage.ogImage),
    featureCards:
      configuredFeatureCards.length > 0 ? configuredFeatureCards : DEFAULT_FEATURE_CARDS,
    abilityCards:
      configuredAbilityCards.length > 0 ? configuredAbilityCards : DEFAULT_ABILITY_CARDS,
    roleCards: configuredRoleCards.length > 0 ? configuredRoleCards : DEFAULT_FEATURES_ROLE_CARDS,
    faqItems: configuredFaqItems.length > 0 ? configuredFaqItems : DEFAULT_FEATURES_FAQ_ITEMS,
  }
}

const readPublishedOfficialFeaturesPage = cachePublishedCmsRead('features-page', () =>
  readOfficialFeaturesPage(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 Features 页面配置
 * @returns Features 页面视图
 */
export async function getOfficialFeaturesPage(): Promise<OfficialFeaturesPageView> {
  return readDraftOrPublished(
    () => readOfficialFeaturesPage(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.featuresPage,
        readPublishedOfficialFeaturesPage,
      ),
  )
}

/**
 * 获取 Features 页脚导航项
 * @param options.includeFallback 是否在没有 Feature 子页时回退到 Features 首屏卡片
 * @param readOptions Payload 读取参数
 * @returns 首屏功能卡片对应的页脚链接
 */
async function readOfficialFeatureNavItems(
  options: { includeFallback?: boolean } = {},
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialFeatureNavItem[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'feature-pages',
    depth: 0,
    limit: 100,
    pagination: false,
    // 导航只需要 slug、短标题与 Hero 标题，避免读取 HTML 大字段和正文分节。
    select: {
      hero: true,
      navigationLabel: true,
      slug: true,
    },
    sort: 'slug',
    ...readOptions,
  })
  const featurePages = docs.map((doc) => mapFeaturePageNavItem(doc)).filter(isPresent)

  if (featurePages.length > 0 || options.includeFallback === false) {
    return featurePages
  }

  const page = await readOfficialFeaturesPage(readOptions)

  return page.featureCards.map((card) => ({
    label: card.title,
    href: card.cta.href,
  }))
}

const readPublishedOfficialFeatureNavItems = cachePublishedCmsRead(
  'feature-nav-items',
  (includeFallback: boolean) =>
    readOfficialFeatureNavItems({ includeFallback }, PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 Features 页脚导航项
 * @param options.includeFallback 是否在没有 Feature 子页时回退到 Features 首屏卡片
 * @returns 首屏功能卡片对应的页脚链接
 */
export async function getOfficialFeatureNavItems(
  options: { includeFallback?: boolean } = {},
): Promise<OfficialFeatureNavItem[]> {
  const includeFallback = options.includeFallback !== false

  return readDraftOrPublished(
    () => readOfficialFeatureNavItems({ includeFallback }, DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(OFFICIAL_SNAPSHOT_KEYS.featureNavItems(includeFallback), () =>
        readPublishedOfficialFeatureNavItems(includeFallback),
      ),
  )
}

/**
 * 获取单个 Feature 子页
 * @param slug 页面 slug
 * @param readOptions Payload 读取参数
 * @returns Feature 子页视图
 */
async function readOfficialFeaturePage(
  slug: string,
  readOptions: OfficialCmsReadOptions,
): Promise<null | OfficialFeaturePageView> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'feature-pages',
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    ...readOptions,
  })
  const page = docs[0]

  if (!page) {
    return null
  }

  const navigationLabel =
    normalizeText(page.navigationLabel) ??
    normalizeText(page.hero?.title) ??
    humanizeSlug(page.slug)

  return {
    slug: page.slug,
    renderMode: page.renderMode === 'html' ? 'html' : 'template',
    htmlContent: normalizeText(page.htmlContent),
    navigationLabel,
    ...normalizeSeoMeta(page.meta),
    heroEyebrow: normalizeText(page.hero?.eyebrow),
    heroTitle: normalizeText(page.hero?.title),
    heroDescription: normalizeText(page.hero?.description),
    heroPrimaryCta: mapButton(page.hero?.primaryCtaLabel, page.hero?.primaryCtaHref),
    summary: normalizeText(page.summary),
    sections: (page.sections ?? [])
      .map((section, index) => mapFeaturePageSection(section, index))
      .filter(isPresent),
    ctaTitle: normalizeText(page.ctaTitle),
    ctaDescription: normalizeText(page.ctaDescription),
    ctaButton: mapButton(page.ctaLabel, page.ctaHref),
  }
}

const readPublishedOfficialFeaturePage = cachePublishedCmsRead('feature-page', (slug: string) =>
  readOfficialFeaturePage(slug, PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取单个 Feature 子页
 * @param slug 页面 slug
 * @returns Feature 子页视图
 */
export async function getOfficialFeaturePage(
  slug: string,
): Promise<null | OfficialFeaturePageView> {
  return readDraftOrPublished(
    () => readOfficialFeaturePage(slug, DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(OFFICIAL_SNAPSHOT_KEYS.featurePage(slug), () =>
        readPublishedOfficialFeaturePage(slug),
      ),
  )
}

/**
 * 获取 Use Cases 聚合页配置
 * @param readOptions Payload 读取参数
 * @returns 聚合页视图
 */
async function readOfficialUseCasesPage(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialUseCasesPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'use-cases-page',
    depth: 1,
    ...readOptions,
  })
  const typedPage = page as UseCasesPage
  const configuredCards = (typedPage.cards ?? [])
    .map((card) => mapUseCasesCard(card))
    .filter(isPresent)
  const configuredFaqItems = (typedPage.faqItems ?? [])
    .map((item, index) => mapUseCasesFaqItem(item, index))
    .filter(isPresent)
  const comingSoonRoles = (typedPage.comingSoonRoles ?? [])
    .map((item) => normalizeText(item?.label))
    .filter((label): label is string => Boolean(label))

  return {
    metaTitle: normalizeText(typedPage.metaTitle),
    metaDescription: normalizeText(typedPage.metaDescription),
    ogImage: normalizeMedia(typedPage.ogImage),
    cards: configuredCards,
    moreTitle: normalizeText(typedPage.moreTitle) ?? '',
    moreDescription: normalizeText(typedPage.moreDescription) ?? '',
    comingSoonRoles,
    faqEyebrow: normalizeText(typedPage.faqEyebrow) ?? '',
    faqTitle: normalizeText(typedPage.faqTitle) ?? '',
    faqDescription: normalizeText(typedPage.faqDescription) ?? '',
    faqItems: configuredFaqItems,
  }
}

const readPublishedOfficialUseCasesPage = cachePublishedCmsRead('use-cases-page', () =>
  readOfficialUseCasesPage(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 Use Cases 聚合页配置
 * @returns 聚合页视图
 */
export async function getOfficialUseCasesPage(): Promise<OfficialUseCasesPageView> {
  return readDraftOrPublished(
    () => readOfficialUseCasesPage(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.casesPage,
        readPublishedOfficialUseCasesPage,
      ),
  )
}

/**
 * 获取全部已发布 use case 页签
 * @param readOptions Payload 读取参数
 * @returns use case 页签列表
 */
async function readOfficialUseCaseNavItems(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialUseCaseNavItem[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'use-case-pages',
    depth: 0,
    limit: 100,
    pagination: false,
    // Header/footer 只需要页签展示字段，避免把正文、HTML、workflow 和 testimonials 一起读出。
    select: {
      hero: true,
      navigationLabel: true,
      slug: true,
    },
    sort: 'slug',
    ...readOptions,
  })

  return docs.map((doc) => mapUseCaseNavItem(doc)).filter(isPresent)
}

const readPublishedOfficialUseCaseNavItems = cachePublishedCmsRead('use-case-nav-items', () =>
  readOfficialUseCaseNavItems(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取全部已发布 use case 页签
 * @returns use case 页签列表
 */
export async function getOfficialUseCaseNavItems(): Promise<OfficialUseCaseNavItem[]> {
  return readDraftOrPublished(
    () => readOfficialUseCaseNavItems(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.caseNavItems,
        readPublishedOfficialUseCaseNavItems,
      ),
  )
}

/**
 * 获取单个 use case 页面
 * @param slug 页面 slug
 * @param readOptions Payload 读取参数
 * @returns use case 视图
 */
async function readOfficialUseCasePage(
  slug: string,
  readOptions: OfficialCmsReadOptions,
): Promise<null | OfficialUseCasePageView> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    ...readOptions,
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

const readPublishedOfficialUseCasePage = cachePublishedCmsRead('use-case-page', (slug: string) =>
  readOfficialUseCasePage(slug, PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取单个 use case 页面
 * @param slug 页面 slug
 * @returns use case 视图
 */
export async function getOfficialUseCasePage(
  slug: string,
): Promise<null | OfficialUseCasePageView> {
  return readDraftOrPublished(
    () => readOfficialUseCasePage(slug, DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(OFFICIAL_SNAPSHOT_KEYS.casePage(slug), () =>
        readPublishedOfficialUseCasePage(slug),
      ),
  )
}

/**
 * 映射 blog 摘要
 * @param post 原始文档
 * @returns blog 摘要
 */
function mapBlogPostSummary(post: BlogPostSummarySource): OfficialBlogPostSummary | null {
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
    readingTime: isHtmlMode
      ? normalizeText(post.htmlCardReadingTime)
      : normalizeText(post.readingTime),
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
 * @param readOptions Payload 读取参数
 * @returns blog 列表项
 */
async function readOfficialBlogPosts(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialBlogPostSummary[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 100,
    pagination: false,
    // 列表卡片不需要 htmlContent 和正文 blocks，字段裁剪可显著降低 HTML 模式文章的 D1 读取体积。
    select: {
      author: true,
      coverImage: true,
      createdAt: true,
      excerpt: true,
      htmlCardDescription: true,
      htmlCardImage: true,
      htmlCardReadingTime: true,
      htmlCardTag: true,
      htmlCardTitle: true,
      lead: true,
      publishedAt: true,
      readingTime: true,
      renderMode: true,
      slug: true,
      tags: true,
      title: true,
    },
    sort: '-publishedAt',
    ...readOptions,
  })

  return docs
    .map((doc) => mapBlogPostSummary(doc))
    .filter((item): item is OfficialBlogPostSummary => Boolean(item))
}

const readPublishedOfficialBlogPosts = cachePublishedCmsRead('blog-posts', () =>
  readOfficialBlogPosts(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 blog 列表
 * @returns blog 列表项
 */
export async function getOfficialBlogPosts(): Promise<OfficialBlogPostSummary[]> {
  return readDraftOrPublished(
    () => readOfficialBlogPosts(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.blogPosts,
        readPublishedOfficialBlogPosts,
      ),
  )
}

/**
 * 获取 blog 详情
 * @param slug 文章 slug
 * @param readOptions Payload 读取参数
 * @returns 文章详情
 */
async function readOfficialBlogPost(
  slug: string,
  readOptions: OfficialCmsReadOptions,
): Promise<null | OfficialBlogPostView> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    ...readOptions,
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
      : (
          await (readOptions === PUBLISHED_CMS_READ_OPTIONS
            ? readPublishedOfficialBlogPosts()
            : readOfficialBlogPosts(readOptions))
        )
          .filter((item) => item.slug !== slug)
          .slice(0, 1)

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

const readPublishedOfficialBlogPost = cachePublishedCmsRead('blog-post', (slug: string) =>
  readOfficialBlogPost(slug, PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 blog 详情
 * @param slug 文章 slug
 * @returns 文章详情
 */
export async function getOfficialBlogPost(slug: string): Promise<null | OfficialBlogPostView> {
  return readDraftOrPublished(
    () => readOfficialBlogPost(slug, DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(OFFICIAL_SNAPSHOT_KEYS.blogPost(slug), () =>
        readPublishedOfficialBlogPost(slug),
      ),
  )
}

/**
 * 获取前台友情链接列表。
 * @param readOptions Payload 读取参数
 * @returns 已启用且链接安全的友情链接
 */
async function readOfficialFriendlyLinks(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialFriendlyLinkView[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'friendly-links',
    depth: 1,
    limit: 100,
    pagination: false,
    // 前台卡片不需要录入 HTML 原文，只读取展示所需字段。
    select: {
      avatar: true,
      avatarUrl: true,
      description: true,
      href: true,
      isActive: true,
      sortOrder: true,
      title: true,
    },
    sort: 'sortOrder',
    where: {
      isActive: {
        equals: true,
      },
    },
    ...readOptions,
  })

  return docs.map((doc) => mapFriendlyLink(doc)).filter(isPresent)
}

const readPublishedOfficialFriendlyLinks = cachePublishedCmsRead('friendly-links', () =>
  readOfficialFriendlyLinks(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取前台友情链接列表。
 * @returns 已启用且链接安全的友情链接
 */
export async function getOfficialFriendlyLinks(): Promise<OfficialFriendlyLinkView[]> {
  return readDraftOrPublished(
    () => readOfficialFriendlyLinks(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.friendlyLinks,
        readPublishedOfficialFriendlyLinks,
      ),
  )
}

/**
 * 获取 FAQ 页面配置
 * @param readOptions Payload 读取参数
 * @returns FAQ 页面视图
 */
async function readOfficialFaqPage(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialFaqPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'faq-page',
    depth: 0,
    ...readOptions,
  })

  return {
    renderMode: (page as FaqPage).renderMode === 'html' ? 'html' : 'template',
    htmlContent: normalizeText((page as FaqPage).htmlContent),
  }
}

const readPublishedOfficialFaqPage = cachePublishedCmsRead('faq-page', () =>
  readOfficialFaqPage(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 FAQ 页面配置
 * @returns FAQ 页面视图
 */
export async function getOfficialFaqPage(): Promise<OfficialFaqPageView> {
  return readDraftOrPublished(
    () => readOfficialFaqPage(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(OFFICIAL_SNAPSHOT_KEYS.faqPage, readPublishedOfficialFaqPage),
  )
}

/**
 * 获取 FAQ 分组
 * @param readOptions Payload 读取参数
 * @returns FAQ 分组列表
 */
async function readOfficialFaqCategories(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialFaqCategoryView[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'faq-items',
    depth: 0,
    limit: 200,
    pagination: false,
    select: {
      answer: true,
      category: true,
      isActive: true,
      question: true,
      sortOrder: true,
    },
    sort: 'sortOrder',
    where: {
      isActive: {
        equals: true,
      },
    },
    ...readOptions,
  })

  const groupedItems = new Map<string, OfficialFaqCategoryView>()

  docs.forEach((item) => {
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

const readPublishedOfficialFaqCategories = cachePublishedCmsRead('faq-categories', () =>
  readOfficialFaqCategories(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取 FAQ 分组
 * @returns FAQ 分组列表
 */
export async function getOfficialFaqCategories(): Promise<OfficialFaqCategoryView[]> {
  return readDraftOrPublished(
    () => readOfficialFaqCategories(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.faqCategories,
        readPublishedOfficialFaqCategories,
      ),
  )
}

/**
 * 映射法律页面
 * @param page 原始文档
 * @returns 法律页面视图
 */
function mapLegalPage(page: PrivacyPage | TermsPage): OfficialLegalPageView {
  return {
    renderMode: page.renderMode === 'html' ? 'html' : 'template',
    htmlContent: normalizeText(page.htmlContent),
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
 * @param readOptions Payload 读取参数
 * @returns 页面视图
 */
async function readOfficialPrivacyPage(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialLegalPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'privacy-page',
    depth: 1,
    ...readOptions,
  })

  return mapLegalPage(page)
}

const readPublishedOfficialPrivacyPage = cachePublishedCmsRead('privacy-page', () =>
  readOfficialPrivacyPage(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取隐私政策页
 * @returns 页面视图
 */
export async function getOfficialPrivacyPage(): Promise<OfficialLegalPageView> {
  return readDraftOrPublished(
    () => readOfficialPrivacyPage(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.privacyPage,
        readPublishedOfficialPrivacyPage,
      ),
  )
}

/**
 * 获取服务条款页
 * @param readOptions Payload 读取参数
 * @returns 页面视图
 */
async function readOfficialTermsPage(
  readOptions: OfficialCmsReadOptions,
): Promise<OfficialLegalPageView> {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({
    slug: 'terms-page',
    depth: 1,
    ...readOptions,
  })

  return mapLegalPage(page)
}

const readPublishedOfficialTermsPage = cachePublishedCmsRead('terms-page', () =>
  readOfficialTermsPage(PUBLISHED_CMS_READ_OPTIONS),
)

/**
 * 获取服务条款页
 * @returns 页面视图
 */
export async function getOfficialTermsPage(): Promise<OfficialLegalPageView> {
  return readDraftOrPublished(
    () => readOfficialTermsPage(DRAFT_CMS_READ_OPTIONS),
    () =>
      readPublishedSnapshotOrSource(
        OFFICIAL_SNAPSHOT_KEYS.termsPage,
        readPublishedOfficialTermsPage,
      ),
  )
}

/** 全站快照刷新结果。 */
export type OfficialSnapshotRefreshResult = {
  /** 写入的详情页数量。 */
  counts: OfficialSnapshotManifest['counts']
  /** 生成耗时。 */
  durationMs: number
  /** 生成时间。 */
  generatedAt: string
  /** 写入的业务快照 key。 */
  keys: string[]
  /** 生成覆盖的公开路径。 */
  routes: string[]
}

/**
 * 从 Feature 导航 href 中提取 slug。
 * @param href Feature 导航链接
 * @returns Feature slug
 */
function readFeatureSlugFromHref(href: string): string | null {
  const match = /^\/features\/([^/?#]+)/.exec(href)

  return match?.[1] ? decodeURIComponent(match[1]) : null
}

/**
 * 去重并排序公开路径。
 * @param routes 原始路径
 * @returns 稳定排序后的公开路径
 */
function normalizeSnapshotRoutes(routes: string[]): string[] {
  return Array.from(new Set(routes)).sort((a, b) => a.localeCompare(b))
}

/**
 * 从 Payload 生成全站 R2 JSON 快照。
 * 该函数是唯一需要批量读取 Payload/D1 的公开内容刷新入口。
 *
 * @param options.reason 刷新原因
 * @returns 快照刷新结果
 */
export async function refreshOfficialSiteSnapshots(
  options: { reason?: string } = {},
): Promise<OfficialSnapshotRefreshResult> {
  const startedAt = Date.now()
  const generatedAt = new Date(startedAt).toISOString()
  const previousManifest = await readOfficialSnapshotManifest()
  const snapshotEntries: Array<{ data: unknown; key: string }> = []
  const routes = [
    '/',
    '/about',
    '/blog',
    '/contact',
    '/faqs',
    '/features',
    '/links',
    '/pricing',
    '/privacy',
    '/terms',
    '/use-cases',
  ]

  /**
   * 注册待写入快照。
   * @param key 快照 key
   * @param data 快照数据
   */
  function addSnapshot(key: string, data: unknown): void {
    snapshotEntries.push({ data, key })
  }

  const [
    aboutPage,
    featuresPage,
    useCasesPage,
    featureNavItems,
    strictFeatureNavItems,
    useCaseNavItems,
    blogPosts,
    friendlyLinks,
    faqPage,
    faqCategories,
    privacyPage,
    termsPage,
  ] = await Promise.all([
    readOfficialAboutPage(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialFeaturesPage(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialUseCasesPage(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialFeatureNavItems({ includeFallback: true }, PUBLISHED_CMS_READ_OPTIONS),
    readOfficialFeatureNavItems({ includeFallback: false }, PUBLISHED_CMS_READ_OPTIONS),
    readOfficialUseCaseNavItems(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialBlogPosts(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialFriendlyLinks(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialFaqPage(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialFaqCategories(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialPrivacyPage(PUBLISHED_CMS_READ_OPTIONS),
    readOfficialTermsPage(PUBLISHED_CMS_READ_OPTIONS),
  ])

  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.aboutPage, aboutPage)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.featuresPage, featuresPage)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.casesPage, useCasesPage)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.featureNavItems(true), featureNavItems)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.featureNavItems(false), strictFeatureNavItems)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.caseNavItems, useCaseNavItems)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.blogPosts, blogPosts)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.friendlyLinks, friendlyLinks)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.faqPage, faqPage)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.faqCategories, faqCategories)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.privacyPage, privacyPage)
  addSnapshot(OFFICIAL_SNAPSHOT_KEYS.termsPage, termsPage)

  for (const item of strictFeatureNavItems) {
    const slug = readFeatureSlugFromHref(item.href)

    if (!slug) {
      continue
    }

    const page = await readOfficialFeaturePage(slug, PUBLISHED_CMS_READ_OPTIONS)

    if (!page) {
      continue
    }

    routes.push(`/features/${page.slug}`)
    addSnapshot(OFFICIAL_SNAPSHOT_KEYS.featurePage(page.slug), page)
  }

  for (const item of useCaseNavItems) {
    const page = await readOfficialUseCasePage(item.slug, PUBLISHED_CMS_READ_OPTIONS)

    if (!page) {
      continue
    }

    routes.push(`/use-cases/${page.slug}`)
    addSnapshot(OFFICIAL_SNAPSHOT_KEYS.casePage(page.slug), page)
  }

  for (const item of blogPosts) {
    const post = await readOfficialBlogPost(item.slug, PUBLISHED_CMS_READ_OPTIONS)

    if (!post) {
      continue
    }

    routes.push(`/blog/${post.slug}`)
    addSnapshot(OFFICIAL_SNAPSHOT_KEYS.blogPost(post.slug), post)
  }

  const keys = snapshotEntries.map((entry) => entry.key)
  const nextKeySet = new Set(keys)

  await Promise.all(
    snapshotEntries.map((entry) => writeOfficialSnapshot(entry.key, entry.data, generatedAt)),
  )

  if (previousManifest) {
    await Promise.all(
      previousManifest.keys
        .filter((key) => !nextKeySet.has(key))
        .map((key) => deleteOfficialSnapshot(key)),
    )
  }

  const manifest: OfficialSnapshotManifest = {
    counts: {
      blogPosts: blogPosts.length,
      featurePages: strictFeatureNavItems.length,
      useCasePages: useCaseNavItems.length,
    },
    durationMs: Date.now() - startedAt,
    generatedAt,
    keys,
    reason: options.reason ?? 'manual',
    routes: normalizeSnapshotRoutes(routes),
    version: 1,
  }

  await writeOfficialSnapshotManifest(manifest)
  await clearOfficialSnapshotDirty()

  return {
    counts: manifest.counts,
    durationMs: manifest.durationMs,
    generatedAt: manifest.generatedAt,
    keys: manifest.keys,
    routes: manifest.routes,
  }
}
