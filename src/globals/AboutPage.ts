import type { GlobalConfig } from 'payload'

import {
  MARKETING_HERO_FIELD,
  MARKETING_PAGE_SEO_FIELDS,
  MARKETING_SECTIONS_FIELD,
} from '@/fields/marketingContent'
import { contentUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  marketingGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/**
 * About 页面全局配置
 */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    read: marketingGlobalReadAccess,
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
  fields: [...MARKETING_PAGE_SEO_FIELDS, MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD],
}
