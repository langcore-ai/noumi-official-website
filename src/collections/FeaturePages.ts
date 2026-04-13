import type { CollectionConfig } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import { MARKETING_HERO_FIELD, MARKETING_SECTIONS_FIELD } from '@/fields/marketingContent'
import {
  buildPreviewURL,
  contentDocumentReadAccess,
  getCollectionPreviewPath,
  PUBLIC_COLLECTION_VERSIONS,
} from '@/lib/site/publishing'

/**
 * Feature 页面集合
 */
export const FeaturePages: CollectionConfig = {
  slug: 'feature-pages',
  labels: {
    singular: 'Feature Page',
    plural: 'Feature Pages',
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', '_status', 'updatedAt'],
    group: 'Content',
    preview: (doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getCollectionPreviewPath('feature-pages', doc),
      }),
  },
  versions: PUBLIC_COLLECTION_VERSIONS,
  access: {
    read: contentDocumentReadAccess,
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Feature 路由 slug；应与前台固定 URL 保持一致。',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
    },
    MARKETING_HERO_FIELD,
    MARKETING_SECTIONS_FIELD,
    {
      name: 'relatedFeatures',
      type: 'relationship',
      relationTo: 'feature-pages',
      hasMany: true,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
    },
  ],
}
