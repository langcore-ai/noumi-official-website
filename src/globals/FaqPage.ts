import type { GlobalConfig } from 'payload'

import { contentUpdateAccess } from '@/access/cms'
import { createHtmlContentField, createRenderModeField } from '@/fields/htmlRenderMode'
import {
  buildPreviewURL,
  getGlobalPreviewPath,
  marketingGlobalReadAccess,
  PUBLIC_GLOBAL_VERSIONS,
} from '@/lib/site/publishing'

/**
 * FAQ 页面配置
 * 默认模板继续读取 FAQ Item；HTML 模式用于整页 HTML 迁移。
 */
export const FaqPage: GlobalConfig = {
  slug: 'faq-page',
  label: 'FAQ Page',
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
        path: getGlobalPreviewPath('faq-page'),
      }),
  },
  fields: [
    createRenderModeField('默认模板模式继续读取 FAQ 条目；HTML 模式只需要 HTML 内容。'),
    createHtmlContentField(),
  ],
}
