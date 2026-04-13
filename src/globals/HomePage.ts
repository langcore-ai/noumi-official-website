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
 * 首页内容全局配置
 * 站点配置与页面正文分离后，首页文案统一收敛到该 global 中管理。
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
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
        path: getGlobalPreviewPath('home-page'),
      }),
  },
  fields: [...MARKETING_PAGE_SEO_FIELDS, MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD],
}
