import Link from 'next/link'

import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import type { User } from '@/payload-types'

/** Payload 后台 invite 申请记录页地址 */
const INVITE_ADMIN_ROUTE = '/admin/invite'

type InviteAdminNavLinkProps = {
  /** Payload 注入到 Admin 自定义组件的当前用户 */
  user?: null | User
}

/**
 * 渲染 Payload Admin 左侧导航中的 invite 申请入口。
 * 当前 invite 记录仍来自临时 D1 表，因此这里只提供入口，不扩大为 Payload collection 能力。
 * @param props Payload Admin 自定义导航组件属性
 * @returns 管理员可见的 invite 导航链接
 */
export default function InviteAdminNavLink({ user }: InviteAdminNavLinkProps) {
  if (!hasAnyCmsRole(user, CMS_ADMIN_ROLES)) {
    return null
  }

  return (
    <div className="nav-group" id="nav-group-invite-requests">
      <div
        className="nav-group__label"
        style={{
          color: 'var(--theme-elevation-400)',
          marginBottom: 'calc(var(--base) * 0.25)',
        }}
      >
        运营
      </div>
      <Link className="nav__link" href={INVITE_ADMIN_ROUTE} id="nav-invite-requests" prefetch={false}>
        <span className="nav__link-label">Invite 申请记录</span>
      </Link>
    </div>
  )
}
