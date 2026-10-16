import { APIError, type CollectionConfig } from 'payload'
import { contentCreateAccess, contentUpdateAccess } from '@/access/cms'
import { contentDocumentReadAccess, PUBLIC_COLLECTION_VERSIONS } from '@/lib/site/publishing'
import { blogStructuredDataField } from '@/fields/blogStructuredData'
import { publicPath } from '@/lib/site/managed-routing'

export const SeoConfigs: CollectionConfig = {
  slug: 'seo-configs',
  labels: { singular: 'SEO 配置', plural: 'SEO 配置' },
  admin: {
    group: '网站管理',
    useAsTitle: 'path',
    defaultColumns: ['path', 'title', '_status', 'updatedAt'],
    description:
      '按公开路径配置 SEO，覆盖固定页面、原型页面及内容页。空字段沿用页面原值；发布后生效。',
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
      name: 'path',
      label: '公开路径',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            try {
              return value ? publicPath(value) : value
            } catch (error) {
              throw new APIError(error instanceof Error ? error.message : '无效路径', 400)
            }
          },
        ],
      },
    },
    { name: 'title', label: 'Meta Title', type: 'text', localized: true },
    { name: 'description', label: 'Meta Description', type: 'textarea', localized: true },
    { name: 'keywords', label: 'Meta Keywords（逗号分隔）', type: 'text', localized: true },
    { name: 'ogTitle', label: 'OG Title', type: 'text', localized: true },
    { name: 'ogDescription', label: 'OG Description', type: 'textarea', localized: true },
    {
      name: 'ogImageUrl',
      label: '外部 OG 图片 URL（优先于上传图片）',
      type: 'text',
      validate: (value: string) =>
        !value || /^https?:\/\/[^\s]+$/.test(value) || '请输入完整 http(s) URL',
    },
    {
      ...blogStructuredDataField,
      name: 'jsonLd',
      localized: false,
      admin: {
        description: '填写 JSON 对象或对象数组，发布后覆盖该页面默认 JSON-LD；留空沿用默认值。',
      },
    },
    { name: 'image', label: '分享图片', type: 'upload', relationTo: 'media' },
    {
      name: 'canonical',
      label: 'Canonical URL',
      type: 'text',
      validate: (value: string) =>
        !value || /^https?:\/\/[^\s]+$/.test(value) || '请输入完整 http(s) URL',
    },
    { name: 'noIndex', label: '禁止搜索引擎索引', type: 'checkbox', defaultValue: false },
    { name: 'noFollow', label: '禁止跟踪链接', type: 'checkbox', defaultValue: false },
  ],
}
