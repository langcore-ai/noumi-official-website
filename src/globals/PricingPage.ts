import type { GlobalConfig } from 'payload'

/**
 * Pricing 页面全局配置
 */
export const PricingPage: GlobalConfig = {
  slug: 'pricing-page',
  label: 'Pricing Page',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: 'Pages',
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
