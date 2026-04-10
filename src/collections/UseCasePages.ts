import type { CollectionConfig } from 'payload'

/**
 * Use Case 页面集合
 */
export const UseCasePages: CollectionConfig = {
  slug: 'use-case-pages',
  labels: {
    singular: 'Use Case Page',
    plural: 'Use Case Pages',
  },
  admin: {
    useAsTitle: 'heroTitle',
    defaultColumns: ['heroTitle', 'slug'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Use case 路由 slug；应与固定外部 URL 保持一致。',
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
    {
      name: 'roleLabel',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'heroTitle',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'heroLead',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'painPoints',
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
      ],
    },
    {
      name: 'solutionSections',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'paragraphs',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
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
