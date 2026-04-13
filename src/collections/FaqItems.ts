import type { CollectionConfig } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'

/**
 * FAQ 集合
 */
export const FaqItems: CollectionConfig = {
  slug: 'faq-items',
  labels: {
    singular: 'FAQ Item',
    plural: 'FAQ Items',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'page', 'isActive'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'page',
      type: 'select',
      defaultValue: 'home',
      options: [
        { label: 'Home', value: 'home' },
        { label: 'FAQs', value: 'faqs' },
        { label: 'Pricing', value: 'pricing' },
      ],
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
