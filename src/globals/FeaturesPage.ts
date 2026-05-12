import type { GlobalConfig } from 'payload'

import { contentUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  marketingGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/** Features 页面配置 */
export const FeaturesPage: GlobalConfig = {
  slug: 'features-page',
  label: 'Features Page',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    /** 前台仅读取已发布配置，后台内容角色可读取草稿。 */
    read: marketingGlobalReadAccess,
    /** Features 属于营销内容，仅内容编辑与翻译角色可更新。 */
    update: contentUpdateAccess,
  },
  admin: {
    group: 'Pages',
    preview: (_doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getGlobalPreviewPath('features-page'),
      }),
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      label: 'SEO 标题',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      label: 'SEO 描述',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      label: '分享图',
    },
    {
      name: 'featureCards',
      type: 'array',
      localized: true,
      label: '首屏功能卡片',
      admin: {
        description: '控制 Features 首屏三张功能卡片，同时作为统一页脚 Features 栏目的来源。',
      },
      fields: [
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'memory',
          label: '视觉样式',
          options: [
            { label: 'Persistent Memory / 紫色', value: 'memory' },
            { label: 'Self-Evolving Skills / 棕色', value: 'skills' },
            { label: 'Autonomous Execution / 绿色', value: 'execution' },
          ],
          required: true,
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
          required: true,
        },
        {
          name: 'supportedFeatures',
          type: 'array',
          label: '支持特性',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: '文案',
              required: true,
            },
          ],
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: '跳转链接文案',
          required: true,
        },
        {
          name: 'ctaHref',
          type: 'text',
          label: '跳转链接地址',
          required: true,
        },
      ],
    },
    {
      name: 'abilityCards',
      type: 'array',
      localized: true,
      label: '能力卡片',
      admin: {
        description: '对应 From raw inputs to finished work. 分屏。',
      },
      fields: [
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
          required: true,
        },
        {
          name: 'tags',
          type: 'array',
          label: 'Tag',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: '文案',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'roleCards',
      type: 'array',
      localized: true,
      label: 'Use Case 卡片',
      maxRows: 3,
      admin: {
        description: '复用 Find Your Use Case 页的卡片结构，控制第四屏三张角色卡片。',
      },
      fields: [
        {
          name: 'targetUseCase',
          type: 'relationship',
          relationTo: 'use-case-pages',
          required: true,
          label: '指向的 Use Case',
          admin: {
            description: '卡片点击后跳转到这里选择的 use case 详情页。',
          },
        },
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'pm',
          label: '视觉样式',
          options: [
            { label: 'Product Manager / 紫色', value: 'pm' },
            { label: 'Journalist / 棕色', value: 'journalist' },
            { label: 'Solutions Engineer / 绿色', value: 'solutions' },
          ],
          required: true,
        },
        {
          name: 'avatarPreset',
          type: 'select',
          label: '头像预置',
          options: [
            { label: 'Product Manager 头像', value: 'pm' },
            { label: 'Journalist 头像', value: 'journalist' },
            { label: 'Solutions Engineer 头像', value: 'solutions' },
          ],
          admin: {
            description: '未上传自定义头像时，前台使用这里选择的本地头像素材。',
          },
        },
        {
          name: 'avatarImage',
          type: 'upload',
          relationTo: 'media',
          label: '自定义头像',
          admin: {
            description: '优先于头像预置；未上传时使用预置头像。',
          },
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
          required: true,
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: '跳转链接文案',
          required: true,
        },
      ],
    },
    {
      name: 'faqItems',
      type: 'array',
      localized: true,
      label: 'FAQ',
      admin: {
        description: '回答支持少量 HTML，例如 <strong>，用于还原 Features 原型中的强调。',
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
          label: '回答',
          required: true,
        },
      ],
    },
  ],
}
