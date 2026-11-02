'use client'
import Link from 'next/link'
import { useAuth } from '@payloadcms/ui'
import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import type { User } from '@/payload-types'

export default function ReplayNav() {
  const { user } = useAuth<User>()
  if (!hasAnyCmsRole(user, CMS_ADMIN_ROLES)) return null
  return (
    <Link className="nav__link" href="/admin/visit-replays">
      Visitors and conversions
    </Link>
  )
}
