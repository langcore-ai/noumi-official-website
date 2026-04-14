import { cache } from 'react'

import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import { DEFAULT_CONTENT_LOCALE, getPayloadLocaleOptions, type SiteLocale } from '@/lib/site/i18n'
import config from '@/payload.config'
import type {
  AboutPage as AboutPageDoc,
  BlogPost,
  FaqItem,
  FeaturePage,
  HomePage as HomePageDoc,
  Media,
  PricingPage as PricingPageDoc,
  PrivacyPage as PrivacyPageDoc,
  SiteSetting,
  TermsPage as TermsPageDoc,
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
 * 通用按钮视图
 */
export type CmsButtonView = {
  /** 按钮文案 */
  label: string
  /** 跳转链接 */
  href: string
}

/**
 * 分节头部对齐方式
 */
export type CmsSectionHeaderAlignment = 'left' | 'center' | 'right'

/**
 * 通用 Hero 视图
 */
export type CmsHeroView = {
  /** 角标 */
  eyebrow?: string
  /** 标题 */
  title?: string
  /** 高亮文案 */
  highlight?: string
  /** 主描述 */
  description?: string
  /** 补充描述 */
  supportingText?: string
  /** 尾注文案 */
  footnote?: string
  /** 主按钮 */
  primaryCta?: CmsButtonView
  /** 次按钮 */
  secondaryCta?: CmsButtonView
}

/**
 * 通用卡片视图
 */
export type CmsCardView = {
  /** 可选角标 */
  eyebrow?: string
  /** 卡片标题 */
  title: string
  /** 卡片正文 */
  body?: string
  /** 段落 */
  paragraphs: string[]
  /** 列表 */
  bullets: string[]
}

/**
 * 富文本 section 视图
 */
export type CmsRichTextSectionView = {
  /** 分节类型 */
  type: 'richText'
  /** 稳定槽位标识 */
  slotKey?: string
  /** 可选角标 */
  label?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 头部对齐方式 */
  headerAlignment?: CmsSectionHeaderAlignment
  /** 段落 */
  paragraphs: string[]
  /** 列表 */
  bullets: string[]
  /** 样式 */
  style: 'article' | 'panel' | 'plain'
}

/**
 * 卡片分节视图
 */
export type CmsCardGridSectionView = {
  /** 分节类型 */
  type: 'cardGrid'
  /** 稳定槽位标识 */
  slotKey?: string
  /** 可选角标 */
  label?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 头部对齐方式 */
  headerAlignment?: CmsSectionHeaderAlignment
  /** 左侧段落 */
  paragraphs: string[]
  /** 左侧列表 */
  bullets: string[]
  /** 列数 */
  columns: 2 | 3 | 4
  /** 样式 */
  style: 'default' | 'stats' | 'steps'
  /** 卡片布局模式 */
  layoutMode: 'auto' | 'fixed'
  /** 卡片列表 */
  cards: CmsCardView[]
}

/**
 * 列表分节视图
 */
export type CmsBulletListSectionView = {
  /** 分节类型 */
  type: 'bulletList'
  /** 稳定槽位标识 */
  slotKey?: string
  /** 可选角标 */
  label?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 头部对齐方式 */
  headerAlignment?: CmsSectionHeaderAlignment
  /** 条目 */
  items: string[]
  /** 样式 */
  style: 'panel' | 'plain'
}

/**
 * CTA 分节视图
 */
export type CmsCtaSectionView = {
  /** 分节类型 */
  type: 'cta'
  /** 稳定槽位标识 */
  slotKey?: string
  /** 可选角标 */
  label?: string
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 头部对齐方式 */
  headerAlignment?: CmsSectionHeaderAlignment
  /** 主按钮 */
  primaryCta?: CmsButtonView
  /** 次按钮 */
  secondaryCta?: CmsButtonView
}

/**
 * Markdown 分节视图
 */
export type CmsMarkdownDocumentSectionView = {
  /** 分节类型 */
  type: 'markdownDocument'
  /** 稳定槽位标识 */
  slotKey?: string
  /** 可选角标 */
  label?: string
  /** 标题 */
  title?: string
  /** 头部对齐方式 */
  headerAlignment?: CmsSectionHeaderAlignment
  /** Markdown 原稿 */
  markdown: string
}

/**
 * 营销页通用分节视图
 */
export type CmsPageSectionView =
  | CmsRichTextSectionView
  | CmsCardGridSectionView
  | CmsBulletListSectionView
  | CmsCtaSectionView
  | CmsMarkdownDocumentSectionView

/**
 * 共享页面基础视图
 */
type CmsBasicPageView = {
  /** 页面 SEO 标题 */
  metaTitle?: string
  /** 页面 SEO 描述 */
  metaDescription?: string
  /** 页面分享图 */
  ogImage: Media | null
  /** 页面 Hero */
  hero: CmsHeroView
  /** 页面分节 */
  sections: CmsPageSectionView[]
}

/**
 * 首页视图
 */
export type HomePageView = CmsBasicPageView & {
  /** 首页问题区 */
  problemsSection: CmsCardGridSectionView | null
  /** 首页功能导语 */
  featureIntroSection: CmsRichTextSectionView | null
  /** 首页工作方式 */
  howItWorksSection: CmsCardGridSectionView | null
  /** 首页底部行动区 */
  finalCtaSection: CmsCtaSectionView | null
}

/**
 * 单页营销页面视图
 */
export type CmsStandalonePageView = CmsBasicPageView

/**
 * Feature 卡片摘要视图
 */
export type FeaturePageSummaryView = {
  /** 页面 slug */
  slug: string
  /** 页面 hero */
  hero: CmsHeroView
  /** 摘要列表 */
  summaryItems: string[]
}

/**
 * Feature 详情页视图
 */
export type FeaturePageView = {
  /** 页面 slug */
  slug: string
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** Hero */
  hero: CmsHeroView
  /** 摘要分节 */
  summarySection: CmsBulletListSectionView | null
  /** 主体分节 */
  sections: CmsPageSectionView[]
  /** 关联 Feature */
  relatedFeatures: FeaturePageSummaryView[]
  /** 底部 CTA */
  ctaSection: CmsCtaSectionView | null
}

/**
 * Use case 卡片摘要视图
 */
export type UseCasePageSummaryView = {
  /** 页面 slug */
  slug: string
  /** 页面 hero */
  hero: CmsHeroView
}

/**
 * Use case 详情视图
 */
export type UseCasePageView = {
  /** 页面 slug */
  slug: string
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** Hero */
  hero: CmsHeroView
  /** 痛点分节 */
  painPointsSection: CmsCardGridSectionView | null
  /** 主体分节 */
  sections: CmsPageSectionView[]
  /** 关联 Feature */
  relatedFeatures: FeaturePageSummaryView[]
}

/**
 * 博客列表项视图
 */
export type BlogPostSummaryView = {
  /** 文章 slug */
  slug: string
  /** 标题 */
  title: string
  /** 摘要 */
  excerpt?: string
  /** 作者 */
  author?: string
  /** 发布时间 */
  publishedAt?: string
}

/**
 * 博客详情视图
 */
export type BlogPostView = {
  /** 文章 slug */
  slug: string
  /** 文章标题 */
  title: string
  /** 文章摘要 */
  excerpt?: string
  /** SEO 标题 */
  metaTitle?: string
  /** SEO 描述 */
  metaDescription?: string
  /** 分享图 */
  ogImage: Media | null
  /** 作者 */
  author?: string
  /** 发布时间 */
  publishedAt?: string
  /** 标签 */
  tags: string[]
  /** 正文分节 */
  sections: CmsRichTextSectionView[]
}

/**
 * Payload section 原始输入
 * 为避免和生成类型强耦合，这里只声明视图层实际会使用到的字段。
 */
type RawSectionBlock = {
  /** block 类型 */
  blockType?: null | string
  /** 槽位标识 */
  slotKey?: null | string
  /** 角标 */
  label?: null | string
  /** 标题 */
  title?: null | string
  /** 描述 */
  description?: null | string
  /** 头部对齐方式 */
  headerAlignment?: null | string
  /** 段落 */
  paragraphs?: Array<{ text?: null | string } | null> | null
  /** 列表 */
  bullets?: Array<{ text?: null | string } | null> | null
  /** 通用条目 */
  items?: Array<{ text?: null | string } | null> | null
  /** Markdown */
  markdown?: null | string
  /** 视觉样式 */
  style?: null | string
  /** 卡片布局模式 */
  layoutMode?: null | string
  /** 栅格列数 */
  columns?: null | string
  /** 卡片列表 */
  cards?:
    | Array<
        | {
            eyebrow?: null | string
            title?: null | string
            body?: null | string
            paragraphs?: Array<{ text?: null | string } | null> | null
            bullets?: Array<{ text?: null | string } | null> | null
          }
        | null
      >
    | null
  /** 主按钮文案 */
  primaryCtaLabel?: null | string
  /** 主按钮链接 */
  primaryCtaHref?: null | string
  /** 次按钮文案 */
  secondaryCtaLabel?: null | string
  /** 次按钮链接 */
  secondaryCtaHref?: null | string
}

/**
 * 从 Payload 获取共享客户端
 * @returns Payload 实例
 */
const getPayloadClient = cache(async () => getPayload({ config: await config }))

/** 前台公共读取参数 */
type PublicReadOptions = {
  /** 是否读取草稿版本 */
  draft?: boolean
  /** 是否跳过访问控制 */
  overrideAccess?: boolean
}

/**
 * 判断当前请求是否处于预览模式
 * @returns 是否启用草稿预览
 */
async function isDraftPreviewEnabled(): Promise<boolean> {
  const preview = await draftMode()
  return preview.isEnabled
}

/**
 * 根据预览状态生成公开读取参数
 * 正常模式严格遵循访问控制，预览模式显式读取草稿版本。
 * @param previewEnabled 是否启用预览
 * @returns 可复用的 Payload 查询参数
 */
function getPublicReadOptions(previewEnabled: boolean): PublicReadOptions {
  if (previewEnabled) {
    return {
      draft: true,
    }
  }

  return {
    overrideAccess: false,
  }
}

/**
 * 清洗文本，统一去掉空字符串
 * @param value 原始值
 * @returns 清洗后的文本
 */
function normalizeText(value?: null | string): string | undefined {
  const text = value?.trim()
  return text ? text : undefined
}

/**
 * 提取简单文本数组
 * @param items 数组字段
 * @returns 文本数组
 */
function extractTextArray(items?: Array<{ text?: null | string } | null> | null): string[] {
  return (items ?? [])
    .map((item) => normalizeText(item?.text))
    .filter((item): item is string => Boolean(item))
}

/**
 * 映射按钮配置
 * @param label 原始文案
 * @param href 原始链接
 * @returns 可渲染按钮；无效时返回 undefined
 */
function mapButton(label?: null | string, href?: null | string): CmsButtonView | undefined {
  const normalizedLabel = normalizeText(label)
  const normalizedHref = normalizeText(href)

  if (!normalizedLabel || !normalizedHref) {
    return undefined
  }

  return {
    label: normalizedLabel,
    href: normalizedHref,
  }
}

/**
 * 映射 Hero 结构
 * @param hero 原始 hero 字段
 * @returns 前台 Hero 视图
 */
function mapHero(hero?: {
  eyebrow?: null | string
  title?: null | string
  highlight?: null | string
  description?: null | string
  supportingText?: null | string
  footnote?: null | string
  primaryCtaLabel?: null | string
  primaryCtaHref?: null | string
  secondaryCtaLabel?: null | string
  secondaryCtaHref?: null | string
} | null): CmsHeroView {
  return {
    eyebrow: normalizeText(hero?.eyebrow),
    title: normalizeText(hero?.title),
    highlight: normalizeText(hero?.highlight),
    description: normalizeText(hero?.description),
    supportingText: normalizeText(hero?.supportingText),
    footnote: normalizeText(hero?.footnote),
    primaryCta: mapButton(hero?.primaryCtaLabel, hero?.primaryCtaHref),
    secondaryCta: mapButton(hero?.secondaryCtaLabel, hero?.secondaryCtaHref),
  }
}

/**
 * 规范化媒体字段
 * @param value 原始媒体值
 * @returns 已展开媒体对象；未展开时返回 null
 */
function normalizeMedia(value: Media | number | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

/**
 * 获取 section 槽位标识
 * @param section section 视图
 * @returns 槽位标识
 */
function getSlotKey(section: CmsPageSectionView | null | undefined): string | undefined {
  return section?.slotKey
}

/**
 * 判断 section 是否仍有可渲染内容
 * @param section section 视图
 * @returns 是否可渲染
 */
function isRenderableSection(section: CmsPageSectionView | null): section is CmsPageSectionView {
  return Boolean(section)
}

/**
 * 映射卡片列表
 * @param cards 原始卡片列表
 * @returns 可渲染卡片
 */
function mapCards(
  cards?: RawSectionBlock['cards'],
): CmsCardView[] {
  return (cards ?? [])
    .flatMap((card) => {
      const title = normalizeText(card?.title)

      if (!title) {
        return []
      }

      return [
        {
          eyebrow: normalizeText(card?.eyebrow),
          title,
          body: normalizeText(card?.body),
          paragraphs: extractTextArray(card?.paragraphs),
          bullets: extractTextArray(card?.bullets),
        },
      ]
    })
}

/**
 * 解析卡片分节列数
 * @param value 原始列数
 * @returns 可渲染列数
 */
function normalizeCardGridColumns(value?: null | string): 2 | 3 | 4 {
  switch (value) {
    case '3':
      return 3
    case '4':
      return 4
    default:
      return 2
  }
}

/**
 * 解析卡片分节布局模式
 * @param value 原始布局模式
 * @returns 可渲染布局模式
 */
function normalizeCardGridLayoutMode(value?: null | string): 'auto' | 'fixed' {
  return value === 'fixed' ? 'fixed' : 'auto'
}

/**
 * 解析分节头部对齐方式
 * @param value 原始对齐方式
 * @returns 可渲染对齐方式
 */
function normalizeSectionHeaderAlignment(
  value?: null | string,
): CmsSectionHeaderAlignment | undefined {
  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return undefined
}

/**
 * 映射共享 section blocks
 * @param sections 原始分节
 * @returns 通用分节视图
 */
function mapSections(
  sections?: Array<RawSectionBlock | null> | null,
): CmsPageSectionView[] {
  return (sections ?? [])
    .map((section) => {
      const slotKey = normalizeText(section?.slotKey)
      const label = normalizeText(section?.label)
      const title = normalizeText(section?.title)
      const description = normalizeText(section?.description)
      const headerAlignment = normalizeSectionHeaderAlignment(section?.headerAlignment)
      const paragraphs = extractTextArray(section?.paragraphs)
      const bullets = extractTextArray(section?.bullets)

      switch (section?.blockType) {
        case 'rich-text-section': {
          if (!label && !title && !description && paragraphs.length === 0 && bullets.length === 0) {
            return null
          }

          return {
            type: 'richText',
            slotKey,
            label,
            title,
            description,
            headerAlignment,
            paragraphs,
            bullets,
            style:
              section.style === 'article' || section.style === 'plain'
                ? section.style
                : 'panel',
          } satisfies CmsRichTextSectionView
        }
        case 'card-grid-section': {
          const cards = mapCards(section.cards)

          if (
            !label &&
            !title &&
            !description &&
            paragraphs.length === 0 &&
            bullets.length === 0 &&
            cards.length === 0
          ) {
            return null
          }

          return {
            type: 'cardGrid',
            slotKey,
            label,
            title,
            description,
            headerAlignment,
            paragraphs,
            bullets,
            columns: normalizeCardGridColumns(section.columns),
            style: section.style === 'stats' || section.style === 'steps' ? section.style : 'default',
            layoutMode: normalizeCardGridLayoutMode(section.layoutMode),
            cards,
          } satisfies CmsCardGridSectionView
        }
        case 'bullet-list-section': {
          const items = extractTextArray(section.items)

          if (!label && !title && !description && items.length === 0) {
            return null
          }

          return {
            type: 'bulletList',
            slotKey,
            label,
            title,
            description,
            headerAlignment,
            items,
            style: section.style === 'plain' ? 'plain' : 'panel',
          } satisfies CmsBulletListSectionView
        }
        case 'cta-section': {
          const primaryCta = mapButton(section.primaryCtaLabel, section.primaryCtaHref)
          const secondaryCta = mapButton(section.secondaryCtaLabel, section.secondaryCtaHref)

          if (!label && !title && !description && !primaryCta && !secondaryCta) {
            return null
          }

          return {
            type: 'cta',
            slotKey,
            label,
            title,
            description,
            headerAlignment,
            primaryCta,
            secondaryCta,
          } satisfies CmsCtaSectionView
        }
        case 'markdown-document': {
          const markdown = normalizeText(section.markdown)

          if (!markdown) {
            return null
          }

          return {
            type: 'markdownDocument',
            slotKey,
            label,
            title,
            headerAlignment,
            markdown,
          } satisfies CmsMarkdownDocumentSectionView
        }
        default:
          return null
      }
    })
    .filter(isRenderableSection)
}

/**
 * 根据槽位查找指定类型的 section
 * @param sections section 列表
 * @param slotKey 目标槽位
 * @param type 目标类型
 * @returns 命中的 section
 */
function findSectionBySlot<
  TType extends CmsPageSectionView['type'],
>(
  sections: CmsPageSectionView[],
  slotKey: string,
  type: TType,
): Extract<CmsPageSectionView, { type: TType }> | null {
  const section = sections.find(
    (item): item is Extract<CmsPageSectionView, { type: TType }> =>
      getSlotKey(item) === slotKey && item.type === type,
  )

  return section ?? null
}

/**
 * 过滤掉指定槽位后的剩余 section
 * @param sections 原始 section
 * @param slotKeys 需要排除的槽位
 * @returns 过滤后的 section
 */
function omitSectionsBySlotKeys(sections: CmsPageSectionView[], slotKeys: string[]): CmsPageSectionView[] {
  if (slotKeys.length === 0) {
    return sections
  }

  return sections.filter((section) => {
    const slotKey = getSlotKey(section)
    return !slotKey || !slotKeys.includes(slotKey)
  })
}

/**
 * 映射页面基础视图
 * @param page 页面文档
 * @returns 基础页面视图
 */
function mapBasicPageView(page: {
  metaTitle?: null | string
  metaDescription?: null | string
  ogImage?: Media | number | null
  hero?: HomePageDoc['hero'] | AboutPageDoc['hero'] | PricingPageDoc['hero'] | PrivacyPageDoc['hero'] | TermsPageDoc['hero']
  sections?: HomePageDoc['sections'] | AboutPageDoc['sections'] | PricingPageDoc['sections'] | PrivacyPageDoc['sections'] | TermsPageDoc['sections']
}): CmsBasicPageView {
  return {
    metaTitle: normalizeText(page.metaTitle),
    metaDescription: normalizeText(page.metaDescription),
    ogImage: normalizeMedia(page.ogImage),
    hero: mapHero(page.hero ?? null),
    sections: mapSections(page.sections as Array<RawSectionBlock | null> | null | undefined),
  }
}

/**
 * 读取公开 global 文档
 * @param slug global slug
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns global 文档
 */
async function findPublicGlobal<TDoc>(
  slug:
    | 'about-page'
    | 'home-page'
    | 'pricing-page'
    | 'privacy-page'
    | 'site-settings'
    | 'terms-page',
  locale: SiteLocale,
  previewEnabled: boolean,
): Promise<TDoc> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug,
    depth: 1,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
  }) as Promise<TDoc>
}

/**
 * 读取站点设置
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns 站点设置
 */
const getSiteSettingsByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  return findPublicGlobal<SiteSetting>('site-settings', locale, previewEnabled)
})

/**
 * 读取站点设置
 * @param locale 站点语言
 * @returns 站点设置
 */
export async function getSiteSettings(locale: SiteLocale = DEFAULT_CONTENT_LOCALE) {
  return getSiteSettingsByMode(locale, await isDraftPreviewEnabled())
}

/**
 * 读取首页配置
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns 首页文档
 */
const getHomePageByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  return findPublicGlobal<HomePageDoc>('home-page', locale, previewEnabled)
})

/**
 * 读取首页视图
 * @param locale 站点语言
 * @returns 首页视图模型
 */
export async function getHomePage(locale: SiteLocale = DEFAULT_CONTENT_LOCALE): Promise<HomePageView> {
  const page = await getHomePageByMode(locale, await isDraftPreviewEnabled())
  const baseView = mapBasicPageView(page)

  return {
    ...baseView,
    problemsSection: findSectionBySlot(baseView.sections, 'home-problems', 'cardGrid'),
    featureIntroSection: findSectionBySlot(baseView.sections, 'home-feature-intro', 'richText'),
    howItWorksSection: findSectionBySlot(baseView.sections, 'home-how-it-works', 'cardGrid'),
    finalCtaSection: findSectionBySlot(baseView.sections, 'home-final-cta', 'cta'),
  }
}

/**
 * 读取 about 页面
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns about 文档
 */
const getAboutPageByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  return findPublicGlobal<AboutPageDoc>('about-page', locale, previewEnabled)
})

/**
 * 读取 about 页面视图
 * @param locale 站点语言
 * @returns about 视图模型
 */
export async function getAboutPageView(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<CmsStandalonePageView> {
  const page = await getAboutPageByMode(locale, await isDraftPreviewEnabled())
  return mapBasicPageView(page)
}

/**
 * 读取 pricing 页面
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns pricing 文档
 */
const getPricingPageByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  return findPublicGlobal<PricingPageDoc>('pricing-page', locale, previewEnabled)
})

/**
 * 读取 pricing 页面视图
 * @param locale 站点语言
 * @returns pricing 视图模型
 */
export async function getPricingPageView(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<CmsStandalonePageView> {
  const page = await getPricingPageByMode(locale, await isDraftPreviewEnabled())
  return mapBasicPageView(page)
}

/**
 * 读取隐私政策页面
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns 隐私政策文档
 */
const getPrivacyPageByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  return findPublicGlobal<PrivacyPageDoc>('privacy-page', locale, previewEnabled)
})

/**
 * 读取隐私政策页面视图
 * @param locale 站点语言
 * @returns 隐私政策视图模型
 */
export async function getPrivacyPageView(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<CmsStandalonePageView> {
  const page = await getPrivacyPageByMode(locale, await isDraftPreviewEnabled())
  return mapBasicPageView(page)
}

/**
 * 读取服务条款页面
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns 服务条款文档
 */
const getTermsPageByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  return findPublicGlobal<TermsPageDoc>('terms-page', locale, previewEnabled)
})

/**
 * 读取服务条款页面视图
 * @param locale 站点语言
 * @returns 服务条款视图模型
 */
export async function getTermsPageView(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<CmsStandalonePageView> {
  const page = await getTermsPageByMode(locale, await isDraftPreviewEnabled())
  return mapBasicPageView(page)
}

/**
 * 读取全部 feature 页面
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns feature 文档列表
 */
const getFeatureDocsByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'feature-pages',
    depth: 1,
    limit: 100,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
    sort: 'createdAt',
  })

  return result.docs
})

/**
 * 映射 feature 摘要卡片
 * @param page feature 文档
 * @returns 摘要视图
 */
function mapFeaturePageSummary(page: FeaturePage): FeaturePageSummaryView {
  const hero = mapHero(page.hero ?? null)
  const sections = mapSections(page.sections as Array<RawSectionBlock | null> | null | undefined)
  const summarySection = findSectionBySlot(sections, 'feature-summary', 'bulletList')

  return {
    slug: page.slug,
    hero,
    summaryItems: summarySection?.items ?? [],
  }
}

/**
 * 读取全部 feature 页面摘要
 * @param locale 站点语言
 * @returns feature 摘要列表
 */
export async function getFeaturePages(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<FeaturePageSummaryView[]> {
  const docs = await getFeatureDocsByMode(locale, await isDraftPreviewEnabled())
  return docs.map(mapFeaturePageSummary)
}

/**
 * 按 slug 读取 feature 页面
 * @param slug feature slug
 * @param locale 站点语言
 * @returns feature 视图模型
 */
export async function getFeaturePageView(
  slug: string,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<FeaturePageView | null> {
  const previewEnabled = await isDraftPreviewEnabled()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'feature-pages',
    depth: 1,
    limit: 1,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const page = result.docs[0]

  if (!page) {
    return null
  }

  const sections = mapSections(page.sections as Array<RawSectionBlock | null> | null | undefined)
  const relatedFeatures = (page.relatedFeatures ?? [])
    .filter((item): item is Exclude<typeof item, number | null> => typeof item === 'object' && Boolean(item))
    .map((item) => mapFeaturePageSummary(item))

  return {
    slug: page.slug,
    metaTitle: normalizeText(page.metaTitle),
    metaDescription: normalizeText(page.metaDescription),
    ogImage: normalizeMedia(page.ogImage),
    hero: mapHero(page.hero ?? null),
    summarySection: findSectionBySlot(sections, 'feature-summary', 'bulletList'),
    sections: omitSectionsBySlotKeys(sections, ['feature-summary', 'feature-final-cta']),
    relatedFeatures,
    ctaSection: findSectionBySlot(sections, 'feature-final-cta', 'cta'),
  }
}

/**
 * 读取全部 use case 页面
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns use case 文档列表
 */
const getUseCaseDocsByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 100,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
    sort: 'createdAt',
  })

  return result.docs
})

/**
 * 映射 use case 摘要
 * @param page use case 文档
 * @returns 摘要视图
 */
function mapUseCasePageSummary(page: UseCasePage): UseCasePageSummaryView {
  return {
    slug: page.slug,
    hero: mapHero(page.hero ?? null),
  }
}

/**
 * 读取全部 use case 摘要
 * @param locale 站点语言
 * @returns use case 摘要列表
 */
export async function getUseCasePages(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<UseCasePageSummaryView[]> {
  const docs = await getUseCaseDocsByMode(locale, await isDraftPreviewEnabled())
  return docs.map(mapUseCasePageSummary)
}

/**
 * 按 slug 读取 use case 页面
 * @param slug use case slug
 * @param locale 站点语言
 * @returns use case 视图模型
 */
export async function getUseCasePageView(
  slug: string,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<UseCasePageView | null> {
  const previewEnabled = await isDraftPreviewEnabled()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'use-case-pages',
    depth: 1,
    limit: 1,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const page = result.docs[0]

  if (!page) {
    return null
  }

  const sections = mapSections(page.sections as Array<RawSectionBlock | null> | null | undefined)
  const relatedFeatures = (page.relatedFeatures ?? [])
    .filter((item): item is Exclude<typeof item, number | null> => typeof item === 'object' && Boolean(item))
    .map((item) => mapFeaturePageSummary(item))

  return {
    slug: page.slug,
    metaTitle: normalizeText(page.metaTitle),
    metaDescription: normalizeText(page.metaDescription),
    ogImage: normalizeMedia(page.ogImage),
    hero: mapHero(page.hero ?? null),
    painPointsSection: findSectionBySlot(sections, 'use-case-pain-points', 'cardGrid'),
    sections: omitSectionsBySlotKeys(sections, ['use-case-pain-points']),
    relatedFeatures,
  }
}

/**
 * 读取博客文章列表
 * @param locale 站点语言
 * @param previewEnabled 是否启用预览
 * @returns 文章文档列表
 */
const getPublishedBlogDocsByMode = cache(async (locale: SiteLocale, previewEnabled: boolean) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 100,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
    sort: '-publishedAt',
    where: previewEnabled
      ? undefined
      : {
          _status: {
            equals: 'published',
          },
        },
  })

  return result.docs
})

/**
 * 映射博客列表项
 * @param post 博客文档
 * @returns 列表项视图
 */
function mapBlogPostSummary(post: BlogPost): BlogPostSummaryView {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: normalizeText(post.excerpt),
    author: normalizeText(post.author),
    publishedAt: post.publishedAt ?? undefined,
  }
}

/**
 * 读取博客文章列表
 * @param locale 站点语言
 * @returns 文章列表视图
 */
export async function getPublishedBlogPosts(
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<BlogPostSummaryView[]> {
  const docs = await getPublishedBlogDocsByMode(locale, await isDraftPreviewEnabled())
  return docs.map(mapBlogPostSummary)
}

/**
 * 按 slug 读取博客文章
 * 正常模式返回已发布内容，预览模式返回当前草稿内容。
 * @param slug 文章 slug
 * @param locale 站点语言
 * @returns 文章视图模型
 */
export async function getBlogPostView(
  slug: string,
  locale: SiteLocale = DEFAULT_CONTENT_LOCALE,
): Promise<BlogPostView | null> {
  const previewEnabled = await isDraftPreviewEnabled()
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 1,
    limit: 1,
    ...getPayloadLocaleOptions(locale),
    ...getPublicReadOptions(previewEnabled),
    where: previewEnabled
      ? {
          slug: {
            equals: slug,
          },
        }
      : {
          and: [
            {
              slug: {
                equals: slug,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
          ],
        },
  })

  const post = result.docs[0]

  if (!post) {
    return null
  }

  const sections = mapSections(post.sections as Array<RawSectionBlock | null> | null | undefined)
    .filter((section): section is CmsRichTextSectionView => section.type === 'richText')

  return {
    slug: post.slug,
    title: post.title,
    excerpt: normalizeText(post.excerpt),
    metaTitle: normalizeText(post.metaTitle),
    metaDescription: normalizeText(post.metaDescription),
    ogImage: normalizeMedia(post.ogImage),
    author: normalizeText(post.author),
    publishedAt: post.publishedAt ?? undefined,
    tags: (post.tags ?? [])
      .map((tag) => normalizeText(tag?.tag))
      .filter((tag): tag is string => Boolean(tag)),
    sections: sections.map((section) => ({
      ...section,
      style: 'article',
    })),
  }
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
 * 映射导航配置
 * @param siteSettings 站点设置
 * @returns 可渲染导航
 */
export function mapNavigation(siteSettings: SiteSetting): SiteNavigationItem[] {
  return (siteSettings.navLinks ?? [])
    .flatMap((item) => {
      const label = normalizeText(item?.label)
      if (!label) {
        return []
      }

      const href = normalizeText(item?.href)
      const children = (item.children ?? [])
        .map((child) => {
          const childLabel = normalizeText(child?.label)
          const childHref = normalizeText(child?.href)
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

      if (href) {
        navigationItem.href = href
      }

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
      const title = normalizeText(column?.title)
      if (!title) {
        return null
      }

      const links = (column.links ?? [])
        .map((link) => {
          const label = normalizeText(link?.label)
          const href = normalizeText(link?.href)
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
