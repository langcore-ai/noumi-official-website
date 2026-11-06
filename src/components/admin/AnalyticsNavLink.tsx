import Link from 'next/link'
import type { ServerProps } from 'payload'
import { hasAnyCmsRole } from '@/access/cms'

export function AnalyticsNavLink({ user, payload }: ServerProps) {
  if (!hasAnyCmsRole(user, ['content-editor', 'viewer'])) return null
  return (
    <Link className="nav__link" href={`${payload.config.routes.admin}/analytics`}>
      数据分析
    </Link>
  )
}
