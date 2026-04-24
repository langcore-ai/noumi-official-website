import type { GlobalConfig } from 'payload'

import {
  MARKETING_HERO_FIELD,
  MARKETING_PAGE_SEO_FIELDS,
  MARKETING_SECTIONS_FIELD,
} from '@/fields/marketingContent'
import {
  createHtmlContentField,
  createRenderModeField,
  withTemplateCondition,
} from '@/fields/htmlRenderMode'
import { legalUpdateAccess } from '@/access/cms'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  legalGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/**
 * 隐私政策页面配置
 */
export const PrivacyPage: GlobalConfig = {
  slug: 'privacy-page',
  label: 'Privacy Page',
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
        path: getGlobalPreviewPath('privacy-page'),
      }),
  },
  fields: [
    ...MARKETING_PAGE_SEO_FIELDS,
    createRenderModeField('默认模板模式沿用当前法律页结构；HTML 模式只需要 HTML 内容。'),
    createHtmlContentField(),
    withTemplateCondition(MARKETING_HERO_FIELD),
    withTemplateCondition(MARKETING_SECTIONS_FIELD),
  ],
}
