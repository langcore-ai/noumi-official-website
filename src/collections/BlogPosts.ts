import type { Access, CollectionConfig } from 'payload'

/**
 * 控制博客文章读取权限：
 * - 已登录用户可读取全部状态，便于后台编辑与审核
 * - 匿名请求仅允许读取已发布文章，避免草稿通过公开 API 暴露
 */
const canReadBlogPost: Access = ({ req: { user } }) => {
  // 后台已登录用户保留完整读取能力
  if (user) {
    return true
  }

  // 匿名访问仅允许读取已发布文章
  return {
    status: {
      equals: 'published',
    },
  }
}

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
    defaultColumns: ['title', 'slug', 'publishedAt', 'status'],
    group: 'Content',
  },
  access: {
    /** 公开请求仅可读取已发布内容 */
    read: canReadBlogPost,
    /** 已登录用户可维护内容 */
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
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
    {
      name: 'contentSections',
      type: 'array',
      localized: true,
      admin: {
        description: '文章正文分节；前台按这里的结构渲染。',
      },
      fields: [
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
    },
  ],
}
