import type { CollectionConfig, Field } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import {
  createHtmlContentField,
  createRenderModeField,
  isTemplateRenderMode,
  withTemplateCondition,
} from '@/fields/htmlRenderMode'
import {
  buildPreviewURL,
  contentDocumentReadAccess,
  getCollectionPreviewPath,
  PUBLIC_COLLECTION_VERSIONS,
} from '@/lib/site/publishing'

/** Feature 子页 Hero 字段 */
const FEATURE_HERO_FIELD: Field = {
  name: 'hero',
  type: 'group',
  localized: true,
  label: 'Hero',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: '角标',
    },
    {
      name: 'title',
      type: 'text',
      label: '标题',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
      label: '主按钮文案',
    },
    {
      name: 'primaryCtaHref',
      type: 'text',
      label: '主按钮链接',
    },
  ],
}

/**
 * Feature 子页集合
 * 用于承接 `/features/[slug]`，支持默认模板与整页 HTML 迁移两种模式。
 */
export const FeaturePages: CollectionConfig = {
  slug: 'feature-pages',
  labels: {
    singular: 'Feature Page',
    plural: 'Feature Pages',
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', '_status', 'updatedAt'],
    group: 'Content',
    preview: (doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getCollectionPreviewPath('feature-pages', doc),
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
    createRenderModeField('默认模板用于结构化 Feature 子页；HTML 模式只需要 slug 与 HTML 内容。'),
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Feature 子页路由 slug，例如 persistent-memory。',
      },
    },
    createHtmlContentField(),
    {
      name: 'navigationLabel',
      type: 'text',
      localized: true,
      label: '导航 / 页脚短标题',
      admin: {
        condition: isTemplateRenderMode,
        description: 'Footer Features 栏与后台列表可使用的短标题；未填时回退到 Hero 标题或 slug。',
      },
    },
    withTemplateCondition(FEATURE_HERO_FIELD),
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      label: '摘要',
      admin: {
        condition: isTemplateRenderMode,
        description: '用于默认模板 Hero 下方或 SEO 描述兜底。',
      },
    },
    {
      name: 'sections',
      type: 'array',
      localized: true,
      label: '内容分节',
      admin: {
        condition: isTemplateRenderMode,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '角标',
        },
        {
          name: 'title',
          type: 'text',
          label: '标题',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: '描述',
        },
        {
          name: 'bullets',
          type: 'array',
          label: '列表',
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: '文案',
              required: true,
            },
          ],
        },
      ],
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
  ],
}
