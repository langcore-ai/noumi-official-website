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

/** 对外同步 waitlist 时返回的最小字段集合 */
export type InviteRequestSyncItem = {
  /** 官网侧 invite request 主键 */
  id: number | string
  /** 申请邮箱 */
  email: string
  /** 官网后台原始状态 */
  status: InviteRequest['status']
  /** 最近一次提交时间 */
  submittedAt: string
  /** 提交来源页面 */
  sourcePath: string | null
  /** 记录更新时间 */
  updatedAt: string
}

/** 服务间同步允许写回的官网 invite 状态。 */
export type InviteRequestSyncStatus = InviteRequest['status']

/** waitlist 状态回写参数。 */
export type UpdateInviteRequestStatusInput = {
  /** 官网侧 invite request 主键 */
  id: number | string
  /** 要写回的官网状态 */
  status: InviteRequestSyncStatus
}

/**
 * 读取单个邮箱对应的 invite request。
 *
 * @param payload Payload 实例
 * @param email 已规范化的邮箱
 * @returns 命中的 invite request；不存在时返回 null
 */
export async function findInviteRequestByEmail(
  payload: Payload,
  email: string,
): Promise<InviteRequest | null> {
  const response = await payload.find({
    collection: 'invite-requests',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: email,
      },
    },
  })

  return response.docs[0] ?? null
}

/**
 * 规范化 Payload 文档 ID。
 * 官方站当前主键是数字，但这里仍兼容字符串，避免后续切换主键类型时影响服务联调。
 *
 * @param value 原始文档 ID
 * @returns 传给 Payload Local API 的文档 ID
 */
function normalizeInviteRequestId(value: number | string): number | string {
  const stringValue = String(value).trim()
  if (/^\d+$/.test(stringValue)) {
    return Number(stringValue)
  }

  return stringValue
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

/**
 * 读取供 noumi-server 同步的 waitlist 数据。
 * 这里只返回联调所需字段，避免把后台内部备注等内容暴露给外部系统。
 *
 * @param payload Payload 实例
 * @returns 供服务间同步的 invite request 列表
 */
export async function listInviteRequestsForSync(payload: Payload): Promise<InviteRequestSyncItem[]> {
  const response = await payload.find({
    collection: 'invite-requests',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    sort: '-submittedAt',
  })

  return response.docs.map((doc) => ({
    id: doc.id,
    email: doc.email,
    sourcePath: doc.sourcePath || null,
    status: doc.status,
    submittedAt: doc.submittedAt,
    updatedAt: doc.updatedAt,
  }))
}

/**
 * 批量回写官网 invite request 状态。
 * 该能力仅供 noumi-server 以共享 token 调用，用于把审批结果同步回官网后台。
 *
 * @param payload Payload 实例
 * @param inputs 待更新的状态列表
 * @returns 更新后的最小字段集合
 */
export async function updateInviteRequestsStatus(
  payload: Payload,
  inputs: UpdateInviteRequestStatusInput[],
): Promise<InviteRequestSyncItem[]> {
  const results: InviteRequestSyncItem[] = []

  for (const input of inputs) {
    const doc = await payload.update({
      collection: 'invite-requests',
      id: normalizeInviteRequestId(input.id),
      data: {
        status: input.status,
      },
      overrideAccess: true,
    })

    results.push({
      id: doc.id,
      email: doc.email,
      sourcePath: doc.sourcePath || null,
      status: doc.status,
      submittedAt: doc.submittedAt,
      updatedAt: doc.updatedAt,
    })
  }

  return results
}
