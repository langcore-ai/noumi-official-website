import type { GlobalConfig } from 'payload'

import { contentUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  marketingGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/** Use Cases 聚合页配置 */
export const UseCasesPage: GlobalConfig = {
  slug: 'use-cases-page',
  label: 'Use Cases Page',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    /** 前台仅读取已发布配置，后台内容角色可读取草稿。 */
    read: marketingGlobalReadAccess,
    /** 聚合页属于营销内容，仅内容编辑与翻译角色可更新。 */
    update: contentUpdateAccess,
  },
  admin: {
    group: 'Pages',
    preview: (_doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getGlobalPreviewPath('use-cases-page'),
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
      name: 'cards',
      type: 'array',
      localized: true,
      label: '顶部 Use Case 卡片',
      maxRows: 3,
      admin: {
        description: '最多配置 3 张小卡片；未配置时前台不展示卡片。',
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
      name: 'moreTitle',
      type: 'text',
      localized: true,
      label: 'Not your role 卡片标题',
    },
    {
      name: 'moreDescription',
      type: 'textarea',
      localized: true,
      label: 'Not your role 卡片描述',
      admin: {
        description: '按钮会自动读取已发布 use case，coming soon 胶囊在下方配置。',
      },
    },
    {
      name: 'comingSoonRoles',
      type: 'array',
      localized: true,
      label: 'Coming soon 胶囊',
      admin: {
        description: '展示为不可点击的虚线胶囊。',
      },
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
      name: 'faqEyebrow',
      type: 'text',
      localized: true,
      label: 'FAQ 角标',
    },
    {
      name: 'faqTitle',
      type: 'text',
      localized: true,
      label: 'FAQ 标题',
    },
    {
      name: 'faqDescription',
      type: 'textarea',
      localized: true,
      label: 'FAQ 描述',
    },
    {
      name: 'faqItems',
      type: 'array',
      localized: true,
      label: 'Use Cases 专属 FAQ',
      admin: {
        description: '回答支持少量 HTML，例如 <strong>、<a>，用于还原原型中的强调与链接。',
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
