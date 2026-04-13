import type { CollectionConfig } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: contentUpdateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
}
