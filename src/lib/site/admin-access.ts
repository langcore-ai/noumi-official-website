import 'server-only'
import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import { getSitePayloadClient } from './payload-client'

/** 回放与转化查询复用当前数据库角色校验，不信任过期 JWT 内的角色。 */
export async function denyNonSiteAdmin(request: Request): Promise<Response | null> {
  const payload = await getSitePayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers })
  const current = await payload.findByID({ collection: 'users', id: user.id, depth: 0 })
  return hasAnyCmsRole(current, CMS_ADMIN_ROLES)
    ? null
    : Response.json({ error: 'forbidden' }, { status: 403, headers })
}
