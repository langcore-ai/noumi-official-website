import type { CollectionConfig } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import {
  createHtmlContentField,
  createRenderModeField,
  isTemplateRenderMode,
  withTemplateCondition,
} from '@/fields/htmlRenderMode'
import { MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD } from '@/fields/marketingContent'
import {
  buildPreviewURL,
  contentDocumentReadAccess,
  getCollectionPreviewPath,
  PUBLIC_COLLECTION_VERSIONS,
} from '@/lib/site/publishing'

/**
 * Use Case 页面集合
 */
export const UseCasePages: CollectionConfig = {
  slug: 'use-case-pages',
  labels: {
    singular: 'Use Case Page',
    plural: 'Use Case Pages',
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', '_status', 'updatedAt'],
    group: 'Content',
    preview: (doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getCollectionPreviewPath('use-case-pages', doc),
      }),
  },
  versions: PUBLIC_COLLECTION_VERSIONS,
  access: {
    read: contentDocumentReadAccess,
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    createRenderModeField('默认模板沿用当前 use case 结构；HTML 模式只需要 slug 与 HTML 内容。'),
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Use case 路由 slug；应与固定外部 URL 保持一致。',
      },
    },
    createHtmlContentField(),
    {
      name: 'navigationLabel',
      type: 'text',
      localized: true,
      admin: {
        description: '页签与页脚使用的短标题，例如 For Product Managers。',
        condition: isTemplateRenderMode,
      },
    },
    withTemplateCondition(MARKETING_HERO_FIELD),
    {
      name: 'heroLead',
      type: 'textarea',
      localized: true,
      label: 'Hero 导语',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'painPoints',
      type: 'array',
      localized: true,
      label: '痛点列表',
      admin: {
        condition: isTemplateRenderMode,
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: '文案',
          required: true,
        },
      ],
    },
    {
      name: 'workflowEyebrow',
      type: 'text',
      localized: true,
      label: 'Workflow 角标',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'workflowTitle',
      type: 'text',
      localized: true,
      label: 'Workflow 标题',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'workflowDescription',
      type: 'textarea',
      localized: true,
      label: 'Workflow 描述',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'workflowSteps',
      type: 'array',
      localized: true,
      label: 'Workflow 步骤',
      admin: {
        condition: isTemplateRenderMode,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '步骤标题',
          required: true,
        },
        {
          name: 'panelTitle',
          type: 'text',
          label: '右侧面板标题',
          required: true,
        },
        {
          name: 'panelDescription',
          type: 'textarea',
          label: '右侧面板描述',
        },
        {
          name: 'panelMarkdown',
          type: 'textarea',
          label: '右侧面板 Markdown',
          required: true,
        },
        {
          name: 'footerLabel',
          type: 'text',
          label: '底部标签',
        },
        {
          name: 'footerBadge',
          type: 'text',
          label: '底部徽标',
        },
      ],
    },
    {
      name: 'testimonialsEyebrow',
      type: 'text',
      localized: true,
      label: 'Testimonials 角标',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'testimonialsTitle',
      type: 'text',
      localized: true,
      label: 'Testimonials 标题',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'testimonialsDescription',
      type: 'textarea',
      localized: true,
      label: 'Testimonials 描述',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'testimonials',
      type: 'array',
      localized: true,
      label: 'Testimonials 列表',
      admin: {
        condition: isTemplateRenderMode,
      },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          label: '评价',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: '姓名',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          label: '身份',
          required: true,
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: '头像',
        },
      ],
    },
    {
      name: 'ctaEyebrow',
      type: 'text',
      localized: true,
      label: 'CTA 角标',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'ctaTitle',
      type: 'text',
      localized: true,
      label: 'CTA 标题',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
      localized: true,
      label: 'CTA 描述',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      label: 'CTA 按钮文案',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    {
      name: 'ctaHref',
      type: 'text',
      localized: true,
      label: 'CTA 按钮链接',
      admin: {
        condition: isTemplateRenderMode,
      },
    },
    withTemplateCondition(MARKETING_SECTIONS_FIELD),
  ],
}
