import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { recordInviteRequest } from '@/lib/site/invite-requests'

/** 接口依赖 Payload/D1 运行时，避免构建期静态化。 */
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
