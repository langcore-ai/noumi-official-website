import configPromise from '@payload-config'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { CSSProperties, ReactNode } from 'react'

import { CMS_ADMIN_ROLES, hasAnyCmsRole } from '@/access/cms'
import { getProjectCloudflareContext } from '@/lib/cloudflare/context'
import {
  listTemporaryInviteRequests,
  type TemporaryInviteRequestRecord,
} from '@/lib/site/temporary-invite-requests'

/** 该页面依赖实时鉴权与 D1 查询，禁止静态化。 */
export const dynamic = 'force-dynamic'

/** 后台 invite 页面回跳地址 */
const INVITE_ADMIN_ROUTE = '/admin/invite'

/**
 * 将数据库时间格式化为便于后台阅读的本地时间。
 * @param value D1 中的时间文本
 * @returns 格式化后的展示文案
 */
function formatInviteCreatedAt(value: string): string {
  const parsed = Date.parse(value.replace(' ', 'T') + 'Z')

  if (Number.isNaN(parsed)) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  }).format(new Date(parsed))
}

/**
 * 将可能为空的数据库字段转换为统一占位文案。
 * @param value 数据库字段值
 * @returns 适合后台表格展示的文本
 */
function formatInviteField(value: null | string): string {
  const normalizedValue = value?.trim()

  return normalizedValue ? normalizedValue : '—'
}

/**
 * 校验当前访问者是否为后台管理员。
 * 未登录时跳回后台登录页；已登录但不是管理员时返回 404，避免暴露敏感入口。
 */
async function assertCmsAdminAccess(): Promise<void> {
  const payload = await getPayload({
    config: configPromise,
  })
  const requestHeaders = await headers()
  const authResult = await payload.auth({
    headers: requestHeaders,
  })

  if (!authResult.user) {
    redirect('/admin')
  }

  if (!hasAnyCmsRole(authResult.user, CMS_ADMIN_ROLES)) {
    notFound()
  }
}

/**
 * 渲染 invite 申请管理页。
 * 当前仅提供只读查看能力，便于管理员核对静态 invite 页面收集到的申请信息。
 */
export default async function InviteAdminPage() {
  await assertCmsAdminAccess()

  const cloudflare = await getProjectCloudflareContext()
  const database = cloudflare.env?.D1

  if (!database) {
    return (
      <div style={{ padding: '32px' }}>
        <div
          style={{
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-error-250)',
            borderRadius: '12px',
            color: 'var(--theme-error-500)',
            padding: '20px 24px',
          }}
        >
          D1 数据库绑定不可用，暂时无法读取 invite 申请记录。
        </div>
      </div>
    )
  }

  const inviteRequests = await listTemporaryInviteRequests(database)
  const latestRequest = inviteRequests[0]

  return (
    <div style={{ display: 'grid', gap: '24px', padding: '32px' }}>
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: '16px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: '8px' }}>
          <div
            style={{
              color: 'var(--theme-text)',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Invite 申请记录
          </div>
          <div style={{ color: 'var(--theme-text-secondary)', maxWidth: '760px' }}>
            查看临时 invite 页面收集到的邮箱申请。当前页面仅管理员可见，数据直接来自 D1 中的
            <code style={{ marginInline: '4px' }}>temporary_invite_requests</code>
            表。
          </div>
        </div>
        <Link
          href="/admin"
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '999px',
            color: 'var(--theme-text)',
            padding: '10px 14px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          返回后台首页
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <section
          style={{
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: '12px',
            padding: '20px 24px',
          }}
        >
          <div style={{ color: 'var(--theme-text-secondary)', fontSize: '14px' }}>当前记录数</div>
          <div
            style={{
              color: 'var(--theme-text)',
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1.2,
              marginTop: '10px',
            }}
          >
            {inviteRequests.length}
          </div>
        </section>

        <section
          style={{
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: '12px',
            padding: '20px 24px',
          }}
        >
          <div style={{ color: 'var(--theme-text-secondary)', fontSize: '14px' }}>最近一次提交</div>
          <div
            style={{
              color: 'var(--theme-text)',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: 1.5,
              marginTop: '10px',
              wordBreak: 'break-word',
            }}
          >
            {latestRequest ? latestRequest.email : '暂无数据'}
          </div>
          <div style={{ color: 'var(--theme-text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            {latestRequest ? formatInviteCreatedAt(latestRequest.created_at) : '等待首条 invite 申请写入'}
          </div>
        </section>
      </div>

      <section
        style={{
          background: 'var(--theme-elevation-0)',
          border: '1px solid var(--theme-elevation-100)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            borderBottom: '1px solid var(--theme-elevation-100)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '18px 24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ color: 'var(--theme-text)', fontSize: '18px', fontWeight: 600 }}>提交明细</div>
          <div style={{ color: 'var(--theme-text-secondary)', fontSize: '14px' }}>
            路径:
            <code style={{ marginInlineStart: '6px' }}>{INVITE_ADMIN_ROUTE}</code>
          </div>
        </div>

        {inviteRequests.length === 0 ? (
          <div style={{ color: 'var(--theme-text-secondary)', padding: '24px' }}>
            还没有收到 invite 表单提交记录。
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: '1100px', width: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--theme-elevation-50)' }}>
                  <InviteTableHeadCell>邮箱</InviteTableHeadCell>
                  <InviteTableHeadCell>来源路径</InviteTableHeadCell>
                  <InviteTableHeadCell>IP 地址</InviteTableHeadCell>
                  <InviteTableHeadCell>User-Agent</InviteTableHeadCell>
                  <InviteTableHeadCell>提交时间</InviteTableHeadCell>
                </tr>
              </thead>
              <tbody>
                {inviteRequests.map((inviteRequest) => (
                  <InviteTableRow inviteRequest={inviteRequest} key={inviteRequest.id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

/**
 * 邀请记录表头单元格。
 * @param props 组件属性
 * @returns 表头单元格
 */
function InviteTableHeadCell({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      style={{
        borderBottom: '1px solid var(--theme-elevation-100)',
        color: 'var(--theme-text-secondary)',
        fontSize: '13px',
        fontWeight: 600,
        padding: '14px 16px',
        textAlign: 'left',
      }}
    >
      {children}
    </th>
  )
}

/**
 * 邀请记录表格行。
 * @param props 组件属性
 * @returns 单行邀请记录
 */
function InviteTableRow({
  inviteRequest,
}: {
  inviteRequest: TemporaryInviteRequestRecord
}) {
  return (
    <tr>
      <td style={inviteTableCellStyle}>
        <strong style={{ color: 'var(--theme-text)' }}>{inviteRequest.email}</strong>
      </td>
      <td style={inviteTableCellStyle}>
        <code>{formatInviteField(inviteRequest.source_path)}</code>
      </td>
      <td style={inviteTableCellStyle}>{formatInviteField(inviteRequest.ip_address)}</td>
      <td style={inviteTableCellStyle}>
        <div style={{ maxWidth: '420px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {formatInviteField(inviteRequest.user_agent)}
        </div>
      </td>
      <td style={inviteTableCellStyle}>
        <time dateTime={inviteRequest.created_at}>{formatInviteCreatedAt(inviteRequest.created_at)}</time>
      </td>
    </tr>
  )
}

/** 邀请记录表格单元格样式 */
const inviteTableCellStyle: CSSProperties = {
  borderBottom: '1px solid var(--theme-elevation-100)',
  color: 'var(--theme-text-secondary)',
  fontSize: '14px',
  lineHeight: 1.5,
  padding: '16px',
  verticalAlign: 'top',
}
