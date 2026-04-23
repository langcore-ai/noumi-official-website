import type { CollectionConfig } from 'payload'

import { adminOnlyAccess } from '@/access/cms'

/**
 * Invite 申请集合。
 * 表单入口通过受控 API 写入，后台只允许管理员查看、处理和删除。
 */
export const InviteRequests: CollectionConfig = {
  slug: 'invite-requests',
  labels: {
    singular: 'Invite Request',
    plural: 'Invite Requests',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'sourcePath', 'submittedAt'],
    group: 'Operations',
  },
  access: {
    read: adminOnlyAccess,
    create: adminOnlyAccess,
    update: adminOnlyAccess,
    delete: adminOnlyAccess,
  },
  // Invite 申请不需要协同编辑锁，关闭后也避免额外维护 locked_documents 关联列。
  lockDocuments: false,
  fields: [
    {
      name: 'email',
      type: 'email',
      index: true,
      unique: true,
      required: true,
      admin: {
        description: '申请 invite 的邮箱；同一邮箱重复提交时会刷新上下文信息。',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Invited', value: 'invited' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        description: '后台处理状态，用于后续筛选和跟进。',
      },
    },
    {
      name: 'sourcePath',
      type: 'text',
      admin: {
        description: '用户提交申请时所在页面路径。',
        readOnly: true,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: '提交请求来源 IP，仅用于排查异常提交。',
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'textarea',
      admin: {
        description: '提交请求的 User-Agent，仅用于排查异常提交。',
        readOnly: true,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      index: true,
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: '最近一次提交时间；重复提交会刷新该时间。',
        readOnly: true,
      },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      admin: {
        description: '管理员内部备注，不会展示给用户。',
      },
    },
  ],
  timestamps: true,
}
