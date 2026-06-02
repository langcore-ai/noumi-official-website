import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

import { CMS_CONTENT_UPDATE_ROLES, CMS_LEGAL_UPDATE_ROLES, hasAnyCmsRole } from '@/access/cms'
import { refreshOfficialSiteSnapshots } from '@/lib/site/official-cms'
import {
  acquireOfficialSnapshotRefreshLock,
  getOfficialSnapshotRefreshState,
  isOfficialSnapshotRuntimeAvailable,
  readOfficialSnapshotManifest,
  readOfficialSnapshotSettings,
  releaseOfficialSnapshotRefreshLock,
  writeOfficialSnapshotSettings,
} from '@/lib/site/official-snapshot-store'
import { getSitePayloadClient } from '@/lib/site/payload-client'

/** 快照刷新需要运行时访问 Payload/D1 与 R2。 */
export const dynamic = 'force-dynamic'

/** 快照刷新鉴权 header。 */
const SNAPSHOT_REFRESH_AUTH_HEADER = 'authorization'
/** 后台可操作快照的 CMS 角色。 */
const SNAPSHOT_ADMIN_ROLES = [...CMS_CONTENT_UPDATE_ROLES, ...CMS_LEGAL_UPDATE_ROLES] as const
/** 后台允许配置的最小自动刷新间隔，单位秒；0 表示关闭定时刷新。 */
const MIN_SNAPSHOT_REFRESH_SECONDS = 300
/** 后台允许配置的最大自动刷新间隔，单位秒。 */
const MAX_SNAPSHOT_REFRESH_SECONDS = 7 * 24 * 60 * 60

/**
 * 读取快照刷新 token。
 * @returns token；未配置时返回空串
 */
async function getSnapshotRefreshToken(): Promise<string> {
  const processToken =
    process.env.OFFICIAL_SNAPSHOT_REFRESH_TOKEN?.trim() || process.env.PAYLOAD_SECRET?.trim()

  if (processToken) {
    return processToken
  }

  try {
    const cloudflare = await getCloudflareContext({ async: true })
    const env = cloudflare.env as typeof cloudflare.env & {
      OFFICIAL_SNAPSHOT_REFRESH_TOKEN?: string
      PAYLOAD_SECRET?: string
    }

    return env.OFFICIAL_SNAPSHOT_REFRESH_TOKEN?.trim() || env.PAYLOAD_SECRET?.trim() || ''
  } catch {
    return ''
  }
}

/**
 * 提取 Bearer token。
 * @param request 当前请求
 * @returns token
 */
function getBearerToken(request: Request): string {
  const authorization = request.headers.get(SNAPSHOT_REFRESH_AUTH_HEADER)?.trim() || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)

  return match?.[1]?.trim() || ''
}

/**
 * 校验快照刷新请求。
 * @param request 当前请求
 * @returns 是否通过鉴权
 */
async function isAuthorizedSnapshotRefreshRequest(request: Request): Promise<boolean> {
  const expectedToken = await getSnapshotRefreshToken()
  const receivedToken = getBearerToken(request)

  if (expectedToken && receivedToken === expectedToken) {
    return true
  }

  try {
    const payload = await getSitePayloadClient()
    const { user } = await payload.auth({ headers: request.headers })

    return hasAnyCmsRole(user as Parameters<typeof hasAnyCmsRole>[0], SNAPSHOT_ADMIN_ROLES)
  } catch {
    return false
  }
}

/**
 * 读取请求 JSON。
 * @param request 当前请求
 * @returns JSON 对象
 */
async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown

    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/**
 * 解析后台填写的刷新间隔。
 * @param value 原始值
 * @returns 合法秒数；非法时返回 null
 */
function parseSnapshotRefreshSeconds(value: unknown): number | null {
  const numberValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!Number.isInteger(numberValue)) {
    return null
  }

  if (numberValue === 0) {
    return 0
  }

  if (numberValue < MIN_SNAPSHOT_REFRESH_SECONDS || numberValue > MAX_SNAPSHOT_REFRESH_SECONDS) {
    return null
  }

  return numberValue
}

/**
 * 查询当前快照状态。
 * @param request 当前请求
 * @returns manifest 与刷新状态
 */
export async function GET(request: Request) {
  if (!(await isAuthorizedSnapshotRefreshRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized.', ok: false }, { status: 401 })
  }

  const [manifest, refreshState] = await Promise.all([
    readOfficialSnapshotManifest(),
    getOfficialSnapshotRefreshState(),
  ])
  const [runtimeAvailable, settings] = await Promise.all([
    isOfficialSnapshotRuntimeAvailable(),
    readOfficialSnapshotSettings(),
  ])

  return NextResponse.json({
    manifest,
    ok: true,
    runtimeAvailable,
    refreshState,
    settings,
  })
}

/**
 * 更新后台配置的快照刷新间隔。
 * @param request 当前请求
 * @returns 保存后的配置与刷新状态
 */
export async function PATCH(request: Request) {
  if (!(await isAuthorizedSnapshotRefreshRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized.', ok: false }, { status: 401 })
  }

  if (!(await isOfficialSnapshotRuntimeAvailable())) {
    return NextResponse.json(
      { message: 'Snapshot R2 runtime is unavailable.', ok: false },
      { status: 503 },
    )
  }

  const body = await readJsonBody(request)
  const refreshSeconds = parseSnapshotRefreshSeconds(body.refreshSeconds)

  if (refreshSeconds == null) {
    return NextResponse.json(
      {
        message: `refreshSeconds must be 0 or an integer between ${MIN_SNAPSHOT_REFRESH_SECONDS} and ${MAX_SNAPSHOT_REFRESH_SECONDS}.`,
        ok: false,
      },
      { status: 400 },
    )
  }

  const settings = await writeOfficialSnapshotSettings({ refreshSeconds })
  const refreshState = await getOfficialSnapshotRefreshState()

  return NextResponse.json({
    ok: true,
    refreshState,
    settings,
  })
}

/**
 * 手动刷新全站 R2 JSON 快照。
 * @param request 当前请求
 * @returns 刷新结果
 */
export async function POST(request: Request) {
  if (!(await isAuthorizedSnapshotRefreshRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized.', ok: false }, { status: 401 })
  }

  const reason = new URL(request.url).searchParams.get('reason')?.trim() || 'manual-api'
  const mode = new URL(request.url).searchParams.get('mode')?.trim()

  if (!(await isOfficialSnapshotRuntimeAvailable())) {
    return NextResponse.json(
      { message: 'Snapshot R2 runtime is unavailable.', ok: false },
      { status: 503 },
    )
  }

  if (mode === 'stale') {
    const refreshState = await getOfficialSnapshotRefreshState()

    if (!refreshState.shouldRefresh) {
      return NextResponse.json({
        ok: true,
        refreshState,
        skipped: true,
      })
    }
  }

  if (!(await acquireOfficialSnapshotRefreshLock(reason))) {
    return NextResponse.json(
      { message: 'Snapshot refresh is already running.', ok: false },
      { status: 409 },
    )
  }

  try {
    const result = await refreshOfficialSiteSnapshots({ reason })

    return NextResponse.json({
      ok: true,
      result,
    })
  } finally {
    await releaseOfficialSnapshotRefreshLock()
  }
}
