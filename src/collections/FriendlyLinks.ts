import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import {
  CMS_CONTENT_UPDATE_ROLES,
  contentCreateAccess,
  contentUpdateAccess,
  hasAnyCmsRole,
} from '@/access/cms'

/**
 * 友情链接公开读取权限。
 * 后台内容角色可读取全部条目，匿名前台只读取启用中的条目，避免未启用链接被公开 API 暴露。
 */
const friendlyLinkReadAccess: Access = ({ req: { user } }) => {
  if (hasAnyCmsRole(user, CMS_CONTENT_UPDATE_ROLES)) {
    return true
  }

  return {
    isActive: {
      equals: true,
    },
  }
}

/** 友链录入方式。 */
type FriendlyLinkInputMode = 'manual' | 'html'

/** beforeValidate 阶段需要处理的友链数据结构。 */
type FriendlyLinkData = {
  inputMode?: FriendlyLinkInputMode | null
  htmlSnippet?: string | null
  title?: string | null
  description?: string | null
  href?: string | null
  avatarUrl?: string | null
}

/**
 * 判断是否为 HTML 自动提取模式。
 * @param data 当前表单数据
 * @returns 是否使用 HTML 自动提取
 */
function isHtmlInputMode(data: Partial<FriendlyLinkData>): boolean {
  return data.inputMode === 'html'
}

/**
 * 判断是否为手动填写模式。
 * @param data 当前表单数据
 * @returns 是否使用手动填写
 */
function isManualInputMode(data: Partial<FriendlyLinkData>): boolean {
  return !isHtmlInputMode(data)
}

/**
 * 清洗文本。
 * @param value 原始值
 * @returns 非空文本
 */
function normalizeText(value?: null | string): string | undefined {
  const text = value?.trim()

  return text ? text : undefined
}

/**
 * 规范化外链地址，未填写协议时默认补齐 https。
 * @param value 原始链接
 * @returns http/https URL
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
 * 读取 HTML 标签中的属性。
 * @param tag HTML 标签
 * @param attribute 属性名
 * @returns 属性值
 */
function readHtmlAttribute(tag: string | undefined, attribute: string): string | undefined {
  if (!tag) {
    return undefined
  }

  const match = new RegExp(
    `\\s${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(tag)

  return normalizeText(match?.[1] ?? match?.[2] ?? match?.[3])
}

/**
 * 从 URL 中读取更适合展示的域名。
 * @param href 外链地址
 * @returns 域名
 */
function getDisplayHost(href: string | undefined): string | undefined {
  if (!href) {
    return undefined
  }

  try {
    return new URL(href).hostname.replace(/^www\./i, '')
  } catch {
    return undefined
  }
}

/**
 * 规范化 HTML 片段里的图片地址。
 * @param value 原始图片地址
 * @param baseHref 外链地址，用于解析相对路径
 * @returns 绝对图片 URL
 */
function normalizeImageUrl(
  value: string | undefined,
  baseHref: string | undefined,
): string | undefined {
  const src = normalizeText(value)

  if (!src) {
    return undefined
  }

  try {
    return baseHref ? new URL(src, baseHref).toString() : new URL(src).toString()
  } catch {
    return normalizeExternalHref(src)
  }
}

/**
 * 从外链 HTML 片段提取标题、描述、链接与远程头像地址。
 * @param htmlSnippet 外部站点提供的 badge HTML
 * @returns 可写入友链字段的数据
 */
function extractFriendlyLinkHtml(htmlSnippet?: null | string): Partial<FriendlyLinkData> {
  const html = normalizeText(htmlSnippet)

  if (!html) {
    return {}
  }

  const anchorTag = html.match(/<a\b[^>]*>/i)?.[0]
  const imageTag = html.match(/<img\b[^>]*>/i)?.[0]
  const href = normalizeExternalHref(readHtmlAttribute(anchorTag, 'href'))
  const imageAlt = readHtmlAttribute(imageTag, 'alt')
  const imageSrc = normalizeImageUrl(readHtmlAttribute(imageTag, 'src'), href)
  const displayHost = getDisplayHost(href)
  const titleFromAlt = normalizeText(imageAlt?.replace(/^featured\s+on\s+/i, ''))

  return {
    href,
    avatarUrl: imageSrc,
    title: titleFromAlt ?? displayHost,
    description: imageAlt ?? (displayHost ? `Featured on ${displayHost}` : undefined),
  }
}

/**
 * 在保存前把 HTML 片段转换为标准友链字段。
 */
const applyHtmlSnippetFields: CollectionBeforeValidateHook = ({ data }) => {
  const nextData = data as FriendlyLinkData | undefined

  if (!nextData || !isHtmlInputMode(nextData)) {
    return data
  }

  return {
    ...nextData,
    ...extractFriendlyLinkHtml(nextData.htmlSnippet),
  }
}

/**
 * 友情链接集合。
 * 用于驱动 `/links` 外链目录页，后台可任意增删并维护头像、标题、描述与外链地址。
 */
export const FriendlyLinks: CollectionConfig = {
  slug: 'friendly-links',
  labels: {
    singular: 'Friendly Link',
    plural: 'Friendly Links',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'description', 'href', 'sortOrder', 'isActive'],
    group: 'Content',
  },
  access: {
    read: friendlyLinkReadAccess,
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  hooks: {
    beforeValidate: [applyHtmlSnippetFields],
  },
  fields: [
    {
      name: 'inputMode',
      type: 'select',
      label: '录入方式',
      defaultValue: 'manual',
      required: true,
      options: [
        { label: '手动填写', value: 'manual' },
        { label: 'HTML 自动提取', value: 'html' },
      ],
      admin: {
        description: '选择粘贴外部站点提供的 HTML，或手动填写每个字段。',
      },
    },
    {
      name: 'htmlSnippet',
      type: 'textarea',
      label: 'HTML 代码',
      admin: {
        condition: isHtmlInputMode,
        description:
          '粘贴形如 <a href="..."><img src="..." alt="..." /></a> 的 badge 代码，保存前会自动提取链接、标题、描述和图片地址。',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      admin: {
        condition: isManualInputMode,
        description: '卡片主标题，通常填写站点域名，例如 twelve.tools。',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
      required: true,
      admin: {
        condition: isManualInputMode,
        description: '卡片副标题或一句简短说明。',
      },
    },
    {
      name: 'href',
      type: 'text',
      label: '链接',
      required: true,
      admin: {
        condition: isManualInputMode,
        description: '外链地址；未填写协议时前台会按 https:// 处理。',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
      admin: {
        condition: isManualInputMode,
        description: '可选头像图片；未上传时前台显示标题首字母。',
      },
    },
    {
      name: 'avatarUrl',
      type: 'text',
      label: '远程头像地址',
      admin: {
        condition: isManualInputMode,
        description: '可选远程图片地址；上传 Avatar 优先于远程头像地址。',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      index: true,
      admin: {
        description: '数字越小越靠前。',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
}
