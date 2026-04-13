import type { GlobalConfig } from 'payload'

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
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'missionParagraphs',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'storyParagraphs',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'recognition',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'contactTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'contactBody',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'contactEmail',
      type: 'text',
    },
  ],
}
