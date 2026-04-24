import type { CollectionConfig, Field, TextFieldValidation } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import {
  createHtmlContentField,
  createRenderModeField,
  HtmlRenderModeSiblingData,
  isHtmlRenderMode,
  isTemplateRenderMode,
  htmlModeWriteAccess,
  withTemplateCondition,
} from '@/fields/htmlRenderMode'
import { MARKETING_SECTIONS_FIELD } from '@/fields/marketingContent'
import {
  buildPreviewURL,
  contentDocumentReadAccess,
  getCollectionPreviewPath,
  PUBLIC_COLLECTION_VERSIONS,
} from '@/lib/site/publishing'

/**
 * 校验模板模式必填文本
 * @param message 错误提示
 * @returns Payload 文本字段校验器
 */
function validateTemplateText(message: string): TextFieldValidation {
  return (value, { siblingData }) => {
    const renderMode = (siblingData as HtmlRenderModeSiblingData | undefined)?.renderMode

    if (renderMode === 'html' || value?.trim()) {
      return true
    }

    return message
  }
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
    createRenderModeField('默认模板沿用当前文章结构；HTML 模式只需要 slug 与 HTML 内容。'),
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
    createHtmlContentField(),
    {
      name: 'htmlCardImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      label: 'HTML 卡片图片',
      access: htmlModeWriteAccess,
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
      access: htmlModeWriteAccess,
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
      access: htmlModeWriteAccess,
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
      access: htmlModeWriteAccess,
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
      access: htmlModeWriteAccess,
      admin: {
        condition: isHtmlRenderMode,
        description: 'Blog 列表卡片右下角阅读时间，例如 7 min read。',
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
