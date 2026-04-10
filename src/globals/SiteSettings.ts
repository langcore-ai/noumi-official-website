import type { GlobalConfig } from 'payload'

/**
 * 站点级设置
 * 用于统一维护官网品牌、导航与基础 SEO 默认值。
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '站点设置',
  access: {
    /** 允许前台或服务端读取站点配置 */
    read: () => true,
    /** 仅登录用户可在后台更新站点配置 */
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: '设置',
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
    {
      name: 'homeHero',
      type: 'group',
      label: '首页首屏',
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: '角标文案',
        },
        {
          name: 'title',
          type: 'text',
          label: '标题',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          label: '副标题',
        },
        {
          name: 'intro',
          type: 'textarea',
          label: '简介',
        },
        {
          name: 'roles',
          type: 'textarea',
          label: '角色列表文案',
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
        {
          name: 'secondaryCtaLabel',
          type: 'text',
          label: '次按钮文案',
        },
        {
          name: 'secondaryCtaHref',
          type: 'text',
          label: '次按钮链接',
        },
      ],
    },
    {
      name: 'homeProblems',
      type: 'array',
      label: '首页问题卡片',
      localized: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '标题',
          required: true,
        },
        {
          name: 'paragraphs',
          type: 'array',
          label: '段落列表',
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: '内容',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'homeFeatureIntro',
      type: 'textarea',
      label: '首页功能导语',
      localized: true,
    },
    {
      name: 'homeHowItWorks',
      type: 'array',
      label: '首页工作方式',
      localized: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '标题',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          label: '内容',
          required: true,
        },
      ],
    },
    {
      name: 'homeFinalCta',
      type: 'group',
      label: '首页底部行动区',
      localized: true,
      fields: [
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
        {
          name: 'secondaryCtaLabel',
          type: 'text',
          label: '次按钮文案',
        },
        {
          name: 'secondaryCtaHref',
          type: 'text',
          label: '次按钮链接',
        },
      ],
    },
  ],
}
