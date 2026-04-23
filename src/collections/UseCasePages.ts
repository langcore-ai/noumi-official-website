import type { CollectionConfig, Condition, Field, TextareaFieldValidation } from 'payload'

import { contentCreateAccess, contentUpdateAccess, htmlModeFieldAccess } from '@/access/cms'
import { MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD } from '@/fields/marketingContent'
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

/** HTML 模式字段仅允许管理员与内容编辑写入 */
const htmlModeWriteAccess = {
  create: htmlModeFieldAccess,
  update: htmlModeFieldAccess,
}

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
      access: htmlModeWriteAccess,
      admin: {
        description: '默认模板沿用当前 use case 结构；HTML 模式只需要 slug 与 HTML 内容。',
      },
    },
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
    {
      name: 'htmlContent',
      type: 'textarea',
      localized: true,
      label: 'HTML 内容',
      validate: validateHtmlContent,
      access: htmlModeWriteAccess,
      admin: {
        condition: isHtmlRenderMode,
        description: '仅 HTML 模式使用；前台会在 navbar 与 footer 之间直接渲染这段 HTML。',
      },
    },
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
