import type {
  CollectionConfig,
  Condition,
  Field,
  TextareaFieldValidation,
  TextFieldValidation,
} from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import { MARKETING_SECTIONS_FIELD } from '@/fields/marketingContent'
import {
  buildPreviewURL,
  contentDocumentReadAccess,
  getCollectionPreviewPath,
  PUBLIC_COLLECTION_VERSIONS,
} from '@/lib/site/publishing'

/**
 * 内容渲染模式字段数据
 */
type RenderModeSiblingData = {
  /** 前台渲染模式 */
  renderMode?: 'html' | 'template' | null
}

/**
 * 判断字段是否应在默认模板模式下显示
 */
const isTemplateRenderMode: Condition<any, RenderModeSiblingData> = (_, siblingData) =>
  siblingData.renderMode !== 'html'

/**
 * 判断字段是否应在 HTML 模式下显示
 */
const isHtmlRenderMode: Condition<any, RenderModeSiblingData> = (_, siblingData) =>
  siblingData.renderMode === 'html'

/**
 * 给默认模板字段追加后台显示条件
 * @param field Payload 字段配置
 * @returns 仅默认模板模式显示的字段配置
 */
function withTemplateCondition(field: Field): Field {
  return {
    ...field,
    admin: {
      ...('admin' in field ? field.admin : undefined),
      condition: isTemplateRenderMode,
    },
  } as Field
}

/**
 * 校验模板模式必填文本
 * @param message 错误提示
 * @returns Payload 文本字段校验器
 */
function validateTemplateText(message: string): TextFieldValidation {
  return (value, { siblingData }) => {
    const renderMode = (siblingData as RenderModeSiblingData | undefined)?.renderMode

    if (renderMode === 'html' || value?.trim()) {
      return true
    }

    return message
  }
}

/**
 * 校验 HTML 模式必填源码
 */
const validateHtmlContent: TextareaFieldValidation = (value, { siblingData }) => {
  const renderMode = (siblingData as RenderModeSiblingData | undefined)?.renderMode

  if (renderMode !== 'html' || value?.trim()) {
    return true
  }

  return 'HTML 模式必须粘贴 HTML 内容。'
}

/**
 * Blog 文章集合
 */
export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'status', 'publishedAt'],
    group: 'Content',
    preview: (doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getCollectionPreviewPath('blog-posts', doc),
      }),
  },
  versions: PUBLIC_COLLECTION_VERSIONS,
  access: {
    /** 公开请求仅可读取已发布内容 */
    read: contentDocumentReadAccess,
    /** 内容编辑可创建文章；翻译仅允许更新现有内容 */
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    {
      name: 'renderMode',
      type: 'select',
      defaultValue: 'template',
      label: '渲染模式',
      options: [
        {
          label: '默认模板模式',
          value: 'template',
        },
        {
          label: 'HTML 模式',
          value: 'html',
        },
      ],
      required: true,
      admin: {
        description: '默认模板沿用当前文章结构；HTML 模式只需要 slug 与 HTML 内容。',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      validate: validateTemplateText('默认模板模式必须填写文章标题。'),
      admin: {
        description: '文章标题，同时可作为默认 H1。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '文章 URL slug；上线后应谨慎变更，避免 SEO 权重丢失。',
      },
    },
    {
      name: 'htmlContent',
      type: 'textarea',
      localized: true,
      label: 'HTML 内容',
      validate: validateHtmlContent,
      admin: {
        condition: isHtmlRenderMode,
        description: '仅 HTML 模式使用；前台会在 navbar 与 footer 之间直接渲染这段 HTML。',
      },
    },
    {
      name: 'htmlCardImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      label: 'HTML 卡片图片',
      admin: {
        condition: isHtmlRenderMode,
        description: 'Blog 列表卡片顶部图片。',
      },
    },
    {
      name: 'htmlCardTag',
      type: 'text',
      localized: true,
      label: 'HTML 卡片 Tag',
      admin: {
        condition: isHtmlRenderMode,
        description: 'Blog 列表卡片第一行左侧标签。',
      },
    },
    {
      name: 'htmlCardTitle',
      type: 'text',
      localized: true,
      label: 'HTML 卡片标题',
      admin: {
        condition: isHtmlRenderMode,
        description: 'Blog 列表卡片第二行标题；未填写时回退到 slug。',
      },
    },
    {
      name: 'htmlCardDescription',
      type: 'textarea',
      localized: true,
      label: 'HTML 卡片描述',
      admin: {
        condition: isHtmlRenderMode,
        description: 'Blog 列表卡片第三行描述。',
      },
    },
    {
      name: 'htmlCardReadingTime',
      type: 'text',
      localized: true,
      label: 'HTML 卡片阅读时间',
      admin: {
        condition: isHtmlRenderMode,
        description: 'Blog 列表卡片右下角阅读时间，例如 7 min read。',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      admin: {
        description: '可选 SEO 标题；未填写时前台可回退到 title。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description: '文章 meta description，建议控制在 160 字符以内。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: '列表页摘要与分享描述。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'lead',
      type: 'textarea',
      localized: true,
      admin: {
        description: '文章页头部导语；未填写时前台可回退到 excerpt。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      admin: {
        description: '文章分享图；如未上传，前台可回退到站点默认 OG 图。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      admin: {
        description: '文章卡片与详情页顶部封面图；支持上传 SVG。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'author',
      type: 'text',
      localized: true,
      admin: {
        description: '作者展示名。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'readingTime',
      type: 'text',
      localized: true,
      admin: {
        description: '阅读时长展示文案，例如 7 min read。',
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        condition: isTemplateRenderMode,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      localized: true,
      admin: {
        condition: isTemplateRenderMode,
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'blog-posts',
      hasMany: true,
      admin: {
        description: '文章页底部推荐阅读；未填写时前台可自动补一个已发布文章。',
        condition: isTemplateRenderMode,
      },
    },
    withTemplateCondition(MARKETING_SECTIONS_FIELD),
  ],
}
