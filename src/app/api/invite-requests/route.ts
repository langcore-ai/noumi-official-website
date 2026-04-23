import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getPayload } from 'payload'

import {
  listInviteRequestsForSync,
  recordInviteRequest,
  updateInviteRequestsStatus,
} from '@/lib/site/invite-requests'

/** 接口依赖 Payload/D1 运行时，避免构建期静态化。 */
export const dynamic = 'force-dynamic'

const WAITLIST_SYNC_AUTH_HEADER = 'authorization'

/**
 * 读取服务间 waitlist 同步 token。
 * 本地优先从 `process.env` 读取；Cloudflare 运行时则兼容 secret/binding 注入。
 *
 * @returns 当前环境配置的 waitlist 同步 token；未配置时返回空串
 */
async function getWaitlistSyncToken(): Promise<string> {
  const processToken = process.env.OFFICIAL_WAITLIST_SYNC_TOKEN?.trim()
  if (processToken) {
    return processToken
  }

  try {
    const cloudflare = await getCloudflareContext({ async: true })
    const cloudflareToken = (
      cloudflare.env as typeof cloudflare.env & {
        OFFICIAL_WAITLIST_SYNC_TOKEN?: string
      }
    ).OFFICIAL_WAITLIST_SYNC_TOKEN?.trim()

    return cloudflareToken || ''
  } catch {
    return ''
  }
}

/**
 * 从 `Authorization: Bearer <token>` 中提取 token。
 *
 * @param request 当前请求
 * @returns 请求携带的 Bearer token；未携带时返回空串
 */
function getBearerToken(request: Request): string {
  const authorization = request.headers.get(WAITLIST_SYNC_AUTH_HEADER)?.trim() || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)

  return match?.[1]?.trim() || ''
}

/**
 * 统一校验服务间 Bearer token。
 *
 * @param request 当前请求
 * @returns 当前请求是否通过校验
 */
async function isAuthorizedWaitlistSyncRequest(request: Request): Promise<boolean> {
  const expectedToken = await getWaitlistSyncToken()
  const receivedToken = getBearerToken(request)

  return Boolean(expectedToken) && receivedToken === expectedToken
}

/**
 * 校验邮箱格式，避免明显错误数据落库。
 * @param value 邮箱文本
 * @returns 是否合法
 */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * 读取请求来源 IP。
 * @param headers 请求头
 * @returns 归一化后的 IP 文本
 */
function getRequestIpAddress(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    ''
  )
}

/**
 * 写入 invite 申请。
 * 同一邮箱重复提交时仅刷新上下文信息，不重复插入新行。
 * @param request 当前请求
 * @returns 写入结果
 */
export async function POST(request: Request) {
  const body = (await request.json().catch((): null => null)) as null | {
    email?: string
    sourcePath?: string
  }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const sourcePath = typeof body?.sourcePath === 'string' ? body.sourcePath.trim() : ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Invalid email address.', ok: false }, { status: 400 })
  }

  const headers = request.headers
  const payload = await getPayload({
    config: configPromise,
  })

  await recordInviteRequest(payload, {
    email,
    ipAddress: getRequestIpAddress(headers),
    sourcePath: sourcePath || headers.get('referer') || '',
    userAgent: headers.get('user-agent') ?? '',
  })

  return NextResponse.json({ ok: true })
}

/**
 * 供 noumi-server 拉取官网 waitlist。
 * 该接口仅允许携带共享 token 的服务端请求访问。
 *
 * @param request 当前请求
 * @returns waitlist 数据
 */
export async function GET(request: Request) {
  if (!(await isAuthorizedWaitlistSyncRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized.', ok: false }, { status: 401 })
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const items = await listInviteRequestsForSync(payload)

  return NextResponse.json({
    items,
    ok: true,
  })
}

/**
 * 供 noumi-server 回写官网 waitlist 状态。
 * 支持单条 `{ id, status }` 或批量 `{ items: [{ id, status }] }`。
 *
 * @param request 当前请求
 * @returns 更新结果
 */
export async function PATCH(request: Request) {
  if (!(await isAuthorizedWaitlistSyncRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized.', ok: false }, { status: 401 })
  }

  const body = (await request.json().catch((): null => null)) as
    | null
    | {
        id?: number | string
        items?: Array<{
          id?: number | string
          status?: string
        }>
        status?: string
      }

  const rawItems = Array.isArray(body?.items)
    ? body.items
    : body?.id !== undefined && typeof body?.status === 'string'
      ? [{ id: body.id, status: body.status }]
      : []

  const items = rawItems.flatMap((item) => {
    const id = typeof item?.id === 'number' || typeof item?.id === 'string' ? item.id : ''
    const status = typeof item?.status === 'string' ? item.status.trim() : ''
    if (!id || !['new', 'contacted', 'invited', 'archived'].includes(status)) {
      return []
    }

    return [
      {
        id,
        status: status as 'new' | 'contacted' | 'invited' | 'archived',
      },
    ]
  })

  if (items.length === 0) {
    return NextResponse.json({ message: 'Invalid waitlist status payload.', ok: false }, { status: 400 })
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const updatedItems = await updateInviteRequestsStatus(payload, items)

  return NextResponse.json({
    items: updatedItems,
    ok: true,
  })
}
