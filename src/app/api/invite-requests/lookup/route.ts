import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { findInviteRequestByEmail } from '@/lib/site/invite-requests'
import { lookupProductInviteApplicant } from '@/lib/site/product-invite-lookup'

/** 接口依赖 Payload/D1 与产品服务，避免构建期静态化。 */
export const dynamic = 'force-dynamic'

/** 官网 invite 页可执行的下一步动作。 */
type InviteLookupAction = 'login' | 'register' | 'duplicate' | 'request'

/**
 * 校验邮箱格式，避免明显错误输入触发服务间请求。
 *
 * @param value 邮箱文本
 * @returns 是否合法
 */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * 生成日志用邮箱摘要，避免输出完整邮箱。
 *
 * @param email 已规范化的邮箱
 * @returns 脱敏后的邮箱摘要
 */
function maskEmailForLog(email: string): string {
  const [name = '', domain = ''] = email.split('@')
  return `${name.slice(0, 2)}***@${domain || 'unknown'}`
}

/**
 * 输出官网 invite lookup 路由日志。
 *
 * @param event 事件名
 * @param context 日志上下文
 */
function logInviteLookupRoute(event: string, context: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      context,
      event,
      scope: 'official.invite.lookupRoute',
    }),
  )
}

/**
 * 反查 invite 页当前邮箱的产品侧与官网 waitlist 状态。
 *
 * @param request 当前请求
 * @returns 页面按钮状态与必要跳转链接
 */
export async function POST(request: Request) {
  const body = (await request.json().catch((): null => null)) as null | {
    email?: string
  }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Invalid email address.', ok: false }, { status: 400 })
  }

  const emailMasked = maskEmailForLog(email)
  logInviteLookupRoute('requestReceived', {
    email: emailMasked,
  })

  let productResult: Awaited<ReturnType<typeof lookupProductInviteApplicant>>
  try {
    productResult = await lookupProductInviteApplicant(email)
  } catch (error) {
    logInviteLookupRoute('productLookupFailed', {
      email: emailMasked,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        message: 'Product invite lookup failed.',
        ok: false,
      },
      { status: 502 },
    )
  }

  logInviteLookupRoute('productLookupCompleted', {
    email: emailMasked,
    state: productResult?.state ?? null,
  })

  if (productResult?.state === 'registered') {
    return NextResponse.json({
      action: 'login' satisfies InviteLookupAction,
      loginUrl: productResult.loginUrl,
      ok: true,
    })
  }

  if (productResult?.state === 'approved') {
    return NextResponse.json({
      action: 'register' satisfies InviteLookupAction,
      ok: true,
      registrationUrl: productResult.registrationUrl,
    })
  }

  if (productResult?.state === 'waitlisted') {
    return NextResponse.json({
      action: 'duplicate' satisfies InviteLookupAction,
      ok: true,
      status: productResult.status,
    })
  }

  const payload = await getPayload({
    config: configPromise,
  })
  const existingRequest = await findInviteRequestByEmail(payload, email)

  if (existingRequest) {
    logInviteLookupRoute('officialWaitlistMatched', {
      email: emailMasked,
      status: existingRequest.status,
    })

    return NextResponse.json({
      action: 'duplicate' satisfies InviteLookupAction,
      ok: true,
      status: existingRequest.status,
    })
  }

  logInviteLookupRoute('requestAllowed', {
    email: emailMasked,
  })

  return NextResponse.json({
    action: 'request' satisfies InviteLookupAction,
    ok: true,
  })
}
