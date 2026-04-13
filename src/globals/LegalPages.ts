import type { GlobalConfig } from 'payload'

import { legalUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  legalGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/**
 * 法律页原稿配置
 */
export const LegalPages: GlobalConfig = {
  slug: 'legal-pages',
  label: 'Legal Pages',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    read: legalGlobalReadAccess,
    update: legalUpdateAccess,
  },
  admin: {
    group: 'Pages',
    preview: (_doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getGlobalPreviewPath('legal-pages'),
      }),
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
