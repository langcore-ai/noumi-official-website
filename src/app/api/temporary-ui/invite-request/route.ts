import { NextResponse } from 'next/server'
import { getProjectCloudflareContext } from '@/lib/cloudflare/context'
import {
  ensureTemporaryInviteRequestTable,
  TEMPORARY_INVITE_REQUESTS_TABLE,
} from '@/lib/site/temporary-invite-requests'

/** 接口依赖运行时 D1 绑定，避免构建期静态化 */
export const dynamic = 'force-dynamic'

/**
 * 校验邮箱格式，避免明显错误数据落库。
 * @param value 邮箱文本
 * @returns 是否合法
 */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * 写入邀请申请。
 * 同一邮箱重复提交时仅刷新上下文信息，不重复插入新行。
 * @param request 当前请求
 * @returns 写入结果
 */
export async function POST(request: Request) {
  const cloudflare = await getProjectCloudflareContext()
  const database = cloudflare.env?.D1

  if (!database) {
    return NextResponse.json({ message: 'D1 binding is unavailable.', ok: false }, { status: 500 })
  }

  const body = (await request.json().catch((): null => null)) as null | {
    email?: string
    sourcePath?: string
  }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const sourcePath = typeof body?.sourcePath === 'string' ? body.sourcePath.trim() : ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Invalid email address.', ok: false }, { status: 400 })
  }

  await ensureTemporaryInviteRequestTable(database)

  const headers = request.headers
  const ipAddress =
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    ''
  const userAgent = headers.get('user-agent') ?? ''

  await database
    .prepare(
      `
        INSERT INTO ${TEMPORARY_INVITE_REQUESTS_TABLE} (
          email,
          source_path,
          ip_address,
          user_agent
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          source_path = excluded.source_path,
          ip_address = excluded.ip_address,
          user_agent = excluded.user_agent,
          created_at = CURRENT_TIMESTAMP
      `,
    )
    .bind(email, sourcePath || request.headers.get('referer') || '', ipAddress, userAgent)
    .run()

  return NextResponse.json({ ok: true })
}
