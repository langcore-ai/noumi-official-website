import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import {
  adminOnlyAccess,
  adminOrSelfAccess,
  CMS_ADMIN_ROLES,
  getUserRoles,
  hasAnyCmsRole,
} from '@/access/cms'

/**
 * 兜底补齐用户角色，避免历史账号升级后直接失去后台权限。
 * 首个用户自动成为管理员，其余新用户默认降为只读账号，需管理员显式授予角色。
 * @param args Payload beforeChange 上下文
 * @returns 写回后的用户数据
 */
const assignDefaultUserRoles: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') {
    return data
  }

  const nextRoles = getUserRoles(data ?? null)

  if (nextRoles.length > 0) {
    return {
      ...data,
      roles: nextRoles,
    }
  }

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    req,
  })

  return {
    ...data,
    roles: totalDocs === 0 ? ['admin'] : ['viewer'],
  }
}

/**
 * 仅管理员可直接创建用户；系统首个用户注册场景例外。
 * @param args Payload access 上下文
 * @returns 是否允许创建
 */
const createUserAccess: CollectionConfig['access']['create'] = async ({ req }) => {
  if (hasAnyCmsRole(req.user, CMS_ADMIN_ROLES)) {
    return true
  }

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    req,
  })

  return totalDocs === 0
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'roles', 'updatedAt'],
  },
  auth: true,
  access: {
    read: adminOrSelfAccess,
    create: createUserAccess,
    update: adminOrSelfAccess,
    delete: adminOnlyAccess,
  },
  hooks: {
    beforeChange: [assignDefaultUserRoles],
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      saveToJWT: true,
      defaultValue: ['viewer'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Content Editor', value: 'content-editor' },
        { label: 'Legal Editor', value: 'legal-editor' },
        { label: 'Translator', value: 'translator' },
        { label: 'Viewer', value: 'viewer' },
      ],
      access: {
        read: ({ req: { user }, doc }) => {
          return hasAnyCmsRole(user, CMS_ADMIN_ROLES) || user?.id === doc?.id
        },
        create: ({ req: { user } }) => hasAnyCmsRole(user, CMS_ADMIN_ROLES),
        update: ({ req: { user } }) => hasAnyCmsRole(user, CMS_ADMIN_ROLES),
      },
      admin: {
        description: '后台角色用于隔离内容、法务、翻译与管理员权限；默认新账号仅具备 viewer 权限。',
      },
    },
  ],
}
