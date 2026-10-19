import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { notFound } from 'next/navigation'
import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import { ReplayDashboard } from './ReplayDashboard'

/** Payload 自定义页面同样限制管理员，不只依赖 API 鉴权。 */
export default function ReplayView(props: AdminViewServerProps) {
  // Payload 自定义视图的权限和 locale 由 initPageResult 提供，顶层并未传入。
  const { req, visibleEntities, permissions, locale } = props.initPageResult
  if (!hasAnyCmsRole(req.user, CMS_ADMIN_ROLES)) notFound()
  return (
    <DefaultTemplate
      i18n={props.i18n}
      locale={locale}
      params={props.params}
      payload={props.payload}
      permissions={permissions}
      searchParams={props.searchParams}
      user={req.user}
      req={req}
      visibleEntities={visibleEntities}
    >
      <ReplayDashboard />
    </DefaultTemplate>
  )
}
