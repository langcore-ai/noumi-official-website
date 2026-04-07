import type { GlobalConfig } from 'payload'

/**
 * 站点级设置
 * 用于集中维护官网的基础信息，并作为 SEO 插件的挂载对象。
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    /** 允许前台或服务端读取站点配置 */
    read: () => true,
    /** 仅登录用户可在后台更新站点配置 */
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Site Name',
      required: true,
      admin: {
        description: '站点展示名称，用于默认 SEO 标题拼接。',
      },
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: 'Site URL',
      required: true,
      admin: {
        description: '站点完整访问地址，例如 https://example.com 。',
      },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      label: 'Default Description',
      admin: {
        description: '当页面或文档未提供更具体描述时，可作为默认 SEO 描述。',
      },
    },
  ],
}
