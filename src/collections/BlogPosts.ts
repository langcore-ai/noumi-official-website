import type { CollectionConfig } from 'payload'

import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import { MARKETING_SECTIONS_FIELD } from '@/fields/marketingContent'
import {
  buildPreviewURL,
  contentDocumentReadAccess,
  getCollectionPreviewPath,
  PUBLIC_COLLECTION_VERSIONS,
} from '@/lib/site/publishing'

/**
 * Blog 文章集合
 */
export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'status', 'publishedAt'],
    group: 'Content',
    preview: (doc, options) =>
      buildPreviewURL({
        locale: options.locale,
        path: getCollectionPreviewPath('blog-posts', doc),
      }),
  },
  versions: PUBLIC_COLLECTION_VERSIONS,
  access: {
    /** 公开请求仅可读取已发布内容 */
    read: contentDocumentReadAccess,
    /** 内容编辑可创建文章；翻译仅允许更新现有内容 */
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: '文章标题，同时可作为默认 H1。',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: '文章 URL slug；上线后应谨慎变更，避免 SEO 权重丢失。',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      admin: {
        description: '可选 SEO 标题；未填写时前台可回退到 title。',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description: '文章 meta description，建议控制在 160 字符以内。',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: '列表页摘要与分享描述。',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      admin: {
        description: '文章分享图；如未上传，前台可回退到站点默认 OG 图。',
      },
    },
    {
      name: 'author',
      type: 'text',
      localized: true,
      admin: {
        description: '作者展示名。',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    MARKETING_SECTIONS_FIELD,
  ],
}
