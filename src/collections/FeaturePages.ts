import type { CollectionConfig } from 'payload'

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
    {
      name: 'heroLabel',
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
      name: 'heroEmphasis',
      type: 'text',
      localized: true,
    },
    {
      name: 'heroLead',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'summaryBullets',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'body',
      type: 'array',
      label: 'Sections',
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
        {
          name: 'cards',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'body',
              type: 'textarea',
              required: true,
            },
          ],
        },
        {
          name: 'bullets',
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
      admin: {
        description: 'Feature 页面主体分节；前台直接按这里的结构渲染。',
      },
    },
    {
      name: 'relatedFeatures',
      type: 'relationship',
      relationTo: 'feature-pages',
      hasMany: true,
    },
    {
      name: 'ctaTitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'ctaDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
    },
  ],
}
