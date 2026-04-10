import type { GlobalConfig } from 'payload'

/**
 * 法律页原稿配置
 */
export const LegalPages: GlobalConfig = {
  slug: 'legal-pages',
  label: 'Legal Pages',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      name: 'privacyPolicyMarkdown',
      type: 'textarea',
      localized: true,
      admin: {
        description: '隐私政策 Markdown 原稿；前台会直接读取这里的内容。',
      },
    },
    {
      name: 'termsOfServiceMarkdown',
      type: 'textarea',
      localized: true,
      admin: {
        description: '服务条款 Markdown 原稿；前台会直接读取这里的内容。',
      },
    },
  ],
}
