import type { GlobalConfig } from 'payload'

import {
  MARKETING_HERO_FIELD,
  MARKETING_PAGE_SEO_FIELDS,
  MARKETING_SECTIONS_FIELD,
} from '@/fields/marketingContent'
import { legalUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  legalGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/**
 * 服务条款页面配置
 */
export const TermsPage: GlobalConfig = {
  slug: 'terms-page',
  label: 'Terms Page',
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
        path: getGlobalPreviewPath('terms-page'),
      }),
  },
  fields: [...MARKETING_PAGE_SEO_FIELDS, MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD],
}
