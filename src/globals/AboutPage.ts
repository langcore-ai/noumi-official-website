import type { GlobalConfig } from 'payload'

import { contentUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  marketingGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/** About 页面全局配置。 */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    /** 前台读取公开内容，后台内容角色可读取草稿。 */
    read: marketingGlobalReadAccess,
    /** About 属于营销内容，仅内容编辑与翻译角色可更新。 */
    update: contentUpdateAccess,
  },
  admin: {
    group: 'Pages',
    preview: (_doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getGlobalPreviewPath('about-page'),
      }),
  },
  fields: [
    {
      name: 'teamMembers',
      type: 'array',
      localized: true,
      label: '团队成员',
      admin: {
        description: '控制 About 页面人物介绍卡片；未填写的字段前台保持为空。',
      },
      fields: [
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: '头像',
        },
        {
          name: 'name',
          type: 'text',
          label: '名字',
        },
        {
          name: 'role',
          type: 'text',
          label: '职位',
        },
        {
          name: 'description',
          type: 'textarea',
          label: '描述',
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
      label: 'FAQ',
      admin: {
        description: '回答支持少量 HTML，例如 <a> 链接；未填写的问题或回答前台保持为空。',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          label: '问题',
        },
        {
          name: 'answer',
          type: 'textarea',
          label: '回答',
        },
      ],
    },
  ],
}
