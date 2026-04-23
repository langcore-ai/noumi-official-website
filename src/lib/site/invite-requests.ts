import type { Payload } from 'payload'

import type { InviteRequest } from '@/payload-types'

/** Invite 申请写入参数 */
export type RecordInviteRequestInput = {
  /** 申请 invite 的邮箱 */
  email: string
  /** 提交来源页面 */
  sourcePath: string
  /** 请求来源 IP */
  ipAddress: string
  /** 请求 User-Agent */
  userAgent: string
}

/**
 * 记录 invite 申请。
 * 同一邮箱重复提交时刷新提交上下文，保留后台处理状态和备注。
 * @param payload Payload 实例
 * @param input invite 申请输入
 * @returns 创建或更新后的 invite 申请
 */
export async function recordInviteRequest(
  payload: Payload,
  input: RecordInviteRequestInput,
): Promise<InviteRequest> {
  const submittedAt = new Date().toISOString()
  const existingRequest = await payload.find({
    collection: 'invite-requests',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: input.email,
      },
    },
  })
  const existingDoc = existingRequest.docs[0]

  if (existingDoc) {
    return payload.update({
      collection: 'invite-requests',
      id: existingDoc.id,
      data: {
        ipAddress: input.ipAddress,
        sourcePath: input.sourcePath,
        submittedAt,
        userAgent: input.userAgent,
      },
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'invite-requests',
    data: {
      email: input.email,
      ipAddress: input.ipAddress,
      sourcePath: input.sourcePath,
      status: 'new',
      submittedAt,
      userAgent: input.userAgent,
    },
    overrideAccess: true,
  })
}
