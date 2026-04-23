import { cache } from 'react'

import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Media, SiteSetting } from '@/payload-types'

/**
 * 过滤空值
 * @param value 值
 * @returns 是否为有效值
 */
function isPresent<T>(value: null | T | undefined): value is T {
  return value != null
}

/**
 * 站点导航项
 */
export type SiteNavigationItem = {
  /** 导航文案 */
  label: string
  /** 链接地址 */
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
 * Hero 视图
 */
export type CmsHeroView = {
  /** 角标 */
  eyebrow?: string
  /** 标题 */
  title?: string
  /** 高亮文案 */
  highlight?: string
  /** 描述 */
  description?: string
  /** 补充文案 */
  supportingText?: string
  /** 尾注 */
  footnote?: string
}

/**
 * 卡片视图
 */
export type CmsCardView = {
  /** 角标 */
  eyebrow?: string
  /** 标题 */
  title: string
  /** 正文 */
  body?: string
  /** 段落 */
  paragraphs: string[]
  /** 列表 */
  bullets: string[]
}

/**
 * 读取 Payload 客户端
 * @returns Payload 实例
 */
const getPayloadClient = cache(async () => getPayload({ config: await config }))

/**
 * 获取站点设置
 * 旧 SEO 工具链仍依赖该全局配置，因此保留最小读取封装。
 * @returns Site Settings 文档
 */
export async function getSiteSettings(): Promise<SiteSetting> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
    overrideAccess: false,
  })
}

/**
 * 映射导航配置
 * @param siteSettings 站点设置
 * @returns 导航列表
 */
export function mapNavigation(siteSettings: SiteSetting): SiteNavigationItem[] {
  return (siteSettings.navLinks ?? [])
    .map((item) => {
      const label = item?.label?.trim()

      if (!label) {
        return null
      }

      return {
        label,
        href: item?.href?.trim() || undefined,
        children: (item?.children ?? [])
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
          .filter(isPresent),
      } satisfies SiteNavigationItem
    })
    .filter(isPresent)
}

/**
 * 映射页脚列
 * @param siteSettings 站点设置
 * @returns 页脚列
 */
export function mapFooterColumns(siteSettings: SiteSetting): SiteFooterColumn[] {
  return (siteSettings.footerColumns ?? [])
    .map((column) => {
      const title = column?.title?.trim()

      if (!title) {
        return null
      }

      return {
        title,
        links: (column?.links ?? [])
          .map((link) => {
            const label = link?.label?.trim()
            const href = link?.href?.trim()

            if (!label || !href) {
              return null
            }

            return {
              label,
              href,
            }
          })
          .filter(isPresent),
      } satisfies SiteFooterColumn
    })
    .filter(isPresent)
}

/**
 * 规范化媒体对象
 * @param value 原始媒体值
 * @returns 媒体对象或 null
 */
export function normalizeMedia(value?: Media | number | null): Media | null {
  return value && typeof value === 'object' ? value : null
}
