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
 * Pricing 页面全局配置
 */
export const PricingPage: GlobalConfig = {
  slug: 'pricing-page',
  label: 'Pricing Page',
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
        path: getGlobalPreviewPath('pricing-page'),
      }),
  },
  fields: [...MARKETING_PAGE_SEO_FIELDS, MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD],
}
