import type { GlobalConfig } from 'payload'

import {
  authenticatedAccess,
  buildPreviewURL,
  getGlobalPreviewPath,
  PUBLIC_GLOBAL_VERSIONS,
  publishedGlobalReadAccess,
} from '@/lib/site/publishing'

/**
 * Pricing 页面全局配置
 */
export const PricingPage: GlobalConfig = {
  slug: 'pricing-page',
  label: 'Pricing Page',
  versions: PUBLIC_GLOBAL_VERSIONS,
  access: {
    read: publishedGlobalReadAccess,
    update: authenticatedAccess,
  },
  admin: {
    group: 'Pages',
    preview: (_doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getGlobalPreviewPath('pricing-page'),
      }),
  },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'plans',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'highlights',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      localized: true,
    },
  ],
}
