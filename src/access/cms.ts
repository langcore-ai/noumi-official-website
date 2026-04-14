import type { Access } from 'payload'

import type { User } from '@/payload-types'

/** CMS 后台可分配的角色列表 */
export const CMS_USER_ROLES = ['admin', 'content-editor', 'legal-editor', 'translator', 'viewer'] as const

/** CMS 用户角色 */
export type CmsUserRole = (typeof CMS_USER_ROLES)[number]

/** 请求上下文里访问控制所需的最小用户结构 */
type CmsRequestUser = ({ id?: User['id']; roles?: CmsUserRole[] | null }) | null | undefined

/** 具备管理员能力的角色 */
export const CMS_ADMIN_ROLES = ['admin'] as const
/** 具备营销内容新增/删除能力的角色 */
export const CMS_CONTENT_CREATE_ROLES = ['content-editor'] as const
/** 具备营销内容更新能力的角色 */
export const CMS_CONTENT_UPDATE_ROLES = ['content-editor', 'translator'] as const
/** 具备法律内容更新能力的角色 */
export const CMS_LEGAL_UPDATE_ROLES = ['legal-editor', 'translator'] as const

/**
 * 归一化当前用户的角色列表
 * @param user 当前请求用户
 * @returns 去重后的合法角色集合
 */
export function getUserRoles(user: CmsRequestUser): CmsUserRole[] {
  if (!Array.isArray(user?.roles)) {
    return []
  }

  // 仅保留受支持的角色值，避免脏数据绕过权限判断
  return user.roles.filter((role, index, roles): role is CmsUserRole => {
    return CMS_USER_ROLES.includes(role) && roles.indexOf(role) === index
  })
}

/**
 * 判断当前用户是否具备任一目标角色
 * `admin` 默认拥有所有后台能力，不需要在每次调用时重复写入。
 * @param user 当前请求用户
 * @param roles 目标角色列表
 * @returns 是否命中任一角色
 */
export function hasAnyCmsRole(user: CmsRequestUser, roles: readonly CmsUserRole[]): boolean {
  const userRoles = getUserRoles(user)

  return userRoles.includes('admin') || roles.some((role) => userRoles.includes(role))
}

/**
 * 生成基于角色的访问控制函数
 * @param roles 允许访问的角色列表
 * @returns Payload Access 函数
 */
export function createRoleAccess(roles: readonly CmsUserRole[]): Access {
  return ({ req: { user } }) => hasAnyCmsRole(user as CmsRequestUser, roles)
}

/** 仅管理员可访问 */
export const adminOnlyAccess = createRoleAccess(CMS_ADMIN_ROLES)

/**
 * 管理员可访问任意用户，自身仅可读取/更新自己的用户资料
 */
export const adminOrSelfAccess: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  if (hasAnyCmsRole(user as CmsRequestUser, CMS_ADMIN_ROLES)) {
    return true
  }

  return {
    id: {
      equals: user.id,
    },
  }
}

/** 营销内容创建权限 */
export const contentCreateAccess = createRoleAccess(CMS_CONTENT_CREATE_ROLES)
/** 营销内容更新权限 */
export const contentUpdateAccess = createRoleAccess(CMS_CONTENT_UPDATE_ROLES)
/** 法律内容更新权限 */
export const legalUpdateAccess = createRoleAccess(CMS_LEGAL_UPDATE_ROLES)
