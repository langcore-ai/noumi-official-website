import type { Access, CollectionConfig } from 'payload'

import {
  CMS_CONTENT_UPDATE_ROLES,
  contentCreateAccess,
  contentUpdateAccess,
  hasAnyCmsRole,
} from '@/access/cms'

/**
 * 友情链接公开读取权限。
 * 后台内容角色可读取全部条目，匿名前台只读取启用中的条目，避免未启用链接被公开 API 暴露。
 */
const friendlyLinkReadAccess: Access = ({ req: { user } }) => {
  if (hasAnyCmsRole(user, CMS_CONTENT_UPDATE_ROLES)) {
    return true
  }

  return {
    isActive: {
      equals: true,
    },
  }
}

/**
 * 友情链接集合。
 * 用于驱动 `/links` 外链目录页，后台可任意增删并维护头像、标题、描述与外链地址。
 */
export const FriendlyLinks: CollectionConfig = {
  slug: 'friendly-links',
  labels: {
    singular: 'Friendly Link',
    plural: 'Friendly Links',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'description', 'href', 'sortOrder', 'isActive'],
    group: 'Content',
  },
  access: {
    read: friendlyLinkReadAccess,
    create: contentCreateAccess,
    update: contentUpdateAccess,
    delete: contentCreateAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      admin: {
        description: '卡片主标题，通常填写站点域名，例如 twelve.tools。',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '描述',
      required: true,
      admin: {
        description: '卡片副标题或一句简短说明。',
      },
    },
    {
      name: 'href',
      type: 'text',
      label: '链接',
      required: true,
      admin: {
        description: '完整外链地址，前台仅展示 http/https 链接。',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
      admin: {
        description: '可选头像图片；未上传时前台不展示头像。',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      index: true,
      admin: {
        description: '数字越小越靠前。',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
      index: true,
    },
  ],
  timestamps: true,
}
