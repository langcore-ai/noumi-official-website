import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { notFound } from 'next/navigation'
import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import { ReplayDashboard } from './ReplayDashboard'
import { ConversionDashboard } from './ConversionDashboard'

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
      <nav className="official-replay official-replay__actions" aria-label="Journey navigation">
        <Link href="/admin/visit-replays?view=conversions">Visitors and conversions</Link>
        <Link href="/admin/visit-replays?view=replays">Website replays</Link>
      </nav>
      {props.searchParams?.view === 'conversions' ||
      (!props.searchParams?.view && !props.searchParams?.visitor) ? (
        <ConversionDashboard />
      ) : (
        <ReplayDashboard
          initialVisitor={
            typeof props.searchParams?.visitor === 'string' ? props.searchParams.visitor : ''
          }
        />
      )}
    </DefaultTemplate>
  )
}
