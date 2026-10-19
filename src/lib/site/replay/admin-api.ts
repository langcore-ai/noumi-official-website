import 'server-only'
import { z } from 'zod'
import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import { getSitePayloadClient } from '@/lib/site/payload-client'
import { readReplayConfig } from './config'
import {
  assertRecordingScope,
  listProductVisits,
  ProductAnalyticsCloudError,
  readProductPlayerUrl,
  readProductRecordingEvents,
  readProductVisit,
} from './cloud'

const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }
function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers })
}

/** 所有 Cloud 读取均由此入口校验当前数据库中的管理员角色。 */
export async function replayAdminRequest(request: Request, path: string[]): Promise<Response> {
  try {
    const payload = await getSitePayloadClient()
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) return json({ error: 'unauthorized' }, 401)
    // 不依赖前端菜单或 JWT 中可能已经过期的角色。
    const current = await payload.findByID({ collection: 'users', id: user.id, depth: 0 })
    if (!hasAnyCmsRole(current, CMS_ADMIN_ROLES)) return json({ error: 'forbidden' }, 403)
    const config = await readReplayConfig()
    const url = new URL(request.url)
    if (path.length === 1 && path[0] === 'visits') {
      const offset = z.coerce
        .number()
        .int()
        .min(0)
        .max(100_000)
        .safeParse(url.searchParams.get('offset') ?? 0)
      const anonymous = z
        .union([z.literal(''), z.uuid()])
        .safeParse(url.searchParams.get('anonymousId') ?? '')
      if (!offset.success || !anonymous.success) return json({ error: 'invalid_request' }, 400)
      if (!config.secretKey) return json({ configured: false, items: [], nextOffset: null })
      return json(
        await listProductVisits(
          config.secretKey,
          config.scope,
          offset.data,
          anonymous.data,
          request.signal,
        ),
      )
    }
    if (!config.secretKey) return json({ error: 'analytics_not_configured' }, 503)
    const id = z.uuid().safeParse(path[1])
    if (!id.success) return json({ error: 'invalid_request' }, 400)
    if (path[0] === 'visits' && path.length === 2) {
      const includeEvents = z
        .enum(['true', 'false'])
        .safeParse(url.searchParams.get('includeEvents') ?? 'false')
      if (!includeEvents.success) return json({ error: 'invalid_request' }, 400)
      return json(
        await readProductVisit(
          config.secretKey,
          id.data,
          config.scope,
          request.signal,
          includeEvents.data === 'true',
        ),
      )
    }
    if (path[0] === 'recordings' && path.length === 3 && ['events', 'player'].includes(path[2])) {
      await assertRecordingScope(config.secretKey, config.scope, id.data, request.signal)
      return path[2] === 'events'
        ? json(await readProductRecordingEvents(config.secretKey, id.data, request.signal))
        : json({ url: await readProductPlayerUrl(config.secretKey, id.data, request.signal) })
    }
    return json({ error: 'not_found' }, 404)
  } catch (error) {
    if (error instanceof ProductAnalyticsCloudError)
      return json({ error: error.code }, error.code === 'analytics_recording_not_found' ? 404 : 502)
    return json({ error: 'analytics_unavailable' }, 502)
  }
}
