import type { GlobalConfig } from 'payload'

import { contentUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  marketingGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/**
 * 站点级设置
 * 用于统一维护官网品牌、导航与基础 SEO 默认值。
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '站点设置',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    /** 前台默认仅读取已发布配置；后台用户仍可读取草稿与历史版本 */
    read: marketingGlobalReadAccess,
    /** 仅内容编辑与翻译角色可在后台更新站点配置 */
    update: contentUpdateAccess,
  },
  admin: {
    group: '设置',
    preview: (_doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getGlobalPreviewPath('site-settings'),
      }),
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: '站点名称',
      required: true,
      admin: {
        description: '站点展示名称，用于默认 SEO 标题拼接。',
      },
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: '站点地址',
      required: true,
      admin: {
        description: '站点完整访问地址，例如 https://www.noumi.ai 。',
      },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      label: '默认描述',
      localized: true,
      admin: {
        description: '页面未提供更具体描述时的默认 SEO 描述。',
      },
    },
    {
      name: 'contactEmail',
      type: 'text',
      label: '联系邮箱',
      admin: {
        description: '官网统一联系邮箱；本项目默认使用 official@noumi.ai。',
      },
    },
    {
      name: 'navCtaText',
      type: 'text',
      label: '导航按钮文案',
      localized: true,
      admin: {
        description: '导航右侧按钮文案。',
      },
    },
    {
      name: 'navCtaHref',
      type: 'text',
      label: '导航按钮链接',
      localized: true,
      admin: {
        description: '导航右侧按钮链接；未填写时前台不展示该按钮。',
      },
    },
    {
      name: 'footerDescription',
      type: 'textarea',
      label: '页脚说明',
      localized: true,
      admin: {
        description: '页脚品牌说明文案。',
      },
    },
    {
      name: 'footerCopyright',
      type: 'text',
      label: '页脚版权文案',
      localized: true,
      admin: {
        description: '页脚版权文案。',
      },
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      label: '默认 OG 图片',
      admin: {
        description: '默认分享图；未配置页面级图片时可回退使用。',
      },
    },
    {
      name: 'navLinks',
      type: 'array',
      label: '导航链接',
      localized: true,
      admin: {
        description: '顶部导航配置；前台会直接读取这里的内容。',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '文案',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: '链接地址',
        },
        {
          name: 'children',
          type: 'array',
          label: '子菜单',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: '文案',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              label: '链接地址',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'footerColumns',
      type: 'array',
      label: '页脚栏目',
      localized: true,
      admin: {
        description: '页脚列配置；前台会直接读取这里的内容。',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '栏目标题',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          label: '链接列表',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: '文案',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              label: '链接地址',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
