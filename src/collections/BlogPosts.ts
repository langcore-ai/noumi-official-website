import type { CollectionBeforeValidateHook, CollectionConfig, TextFieldValidation } from 'payload'

import {
  CMS_ADMIN_ROLES,
  contentCreateAccess,
  contentUpdateAccess,
  hasAnyCmsRole,
} from '@/access/cms'
import {
  createHtmlContentField,
  createMarkdownContentField,
  createRenderModeField,
  HtmlRenderModeSiblingData,
  isCardRenderMode,
  isMarkdownRenderMode,
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

    if (renderMode === 'html' || renderMode === 'markdown' || value?.trim()) {
      return true
    }

    return message
  }
}

/**
 * 限制 HTML 模式写入权限：仅管理员可创建或切换到 HTML 模式。
 * Markdown 与模板模式保持 content-editor 可写。
 */
function restrictHtmlModeToAdmin(): CollectionBeforeValidateHook {
  return async ({ data, req }) => {
    if (data?.renderMode !== 'html') {
      return data
    }

    if (hasAnyCmsRole(req.user, CMS_ADMIN_ROLES)) {
      return data
    }

    throw new Error('仅管理员可创建或切换到 HTML 模式；普通文章请使用 Markdown 或模板模式。')
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
  hooks: {
    beforeValidate: [restrictHtmlModeToAdmin()],
    beforeChange: [
      ({ data, originalDoc }) => {
        if ((data.renderMode ?? originalDoc?.renderMode) === 'markdown' && data.htmlCardTitle?.trim()) {
          data.title = data.htmlCardTitle.trim()
        }

        return data
      },
    ],
  },
  fields: [
    createRenderModeField(
      '新文章默认使用 Markdown，沿用官网 Blog 排版。分块模板用于已有结构化文章，HTML 模式仅管理员可用。',
      'markdown',
    ),
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
      name: 'htmlCardTitle',
      type: 'text',
      localized: true,
      label: '文章标题',
      access: htmlModeWriteAccess,
      admin: {
        condition: isCardRenderMode,
        description: '用于 Blog 总览，Markdown 文章也用作正文标题。',
      },
    },
    {
      name: 'htmlCardImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      label: '封面',
      access: htmlModeWriteAccess,
      admin: {
        condition: isCardRenderMode,
        description: '用于 Blog 总览卡片，Markdown 文章也用作正文首图。',
      },
    },
    {
      name: 'htmlCardDescription',
      type: 'textarea',
      localized: true,
      label: '摘要',
      access: htmlModeWriteAccess,
      admin: {
        condition: isCardRenderMode,
        description: '用于 Blog 总览，Markdown 文章也用作正文导语。',
      },
    },
    {
      name: 'htmlCardTag',
      type: 'text',
      localized: true,
      label: '分类',
      access: htmlModeWriteAccess,
      admin: {
        condition: isCardRenderMode,
        description: '用于 Blog 筛选。请沿用总览页已有的分类名称。',
      },
    },
    {
      name: 'htmlCardReadingTime',
      type: 'text',
      localized: true,
      label: '阅读时长',
      access: htmlModeWriteAccess,
      admin: {
        condition: isCardRenderMode,
        description: '填写时长，例如 7 min。显示在 Blog 总览和 Markdown 文章页。',
      },
    },
    createMarkdownContentField(),
    createHtmlContentField(),
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
    {
      name: 'faqItems',
      type: 'array',
      localized: true,
      label: 'FAQ',
      admin: {
        description: '可选。问题与回答显示在文章底部，回答支持 Markdown。',
        condition: isMarkdownRenderMode,
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          label: '问题',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: '回答（Markdown）',
          required: true,
        },
      ],
    },
    withTemplateCondition(MARKETING_SECTIONS_FIELD),
  ],
}
