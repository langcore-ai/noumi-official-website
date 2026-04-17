/** 邀请申请表名 */
export const TEMPORARY_INVITE_REQUESTS_TABLE = 'temporary_invite_requests'

/** 邀请申请记录 */
export type TemporaryInviteRequestRecord = {
  /** 记录主键 */
  id: number
  /** 用户邮箱 */
  email: string
  /** 提交来源页面 */
  source_path: null | string
  /** 请求来源 IP */
  ip_address: null | string
  /** 请求 User-Agent */
  user_agent: null | string
  /** 写入时间 */
  created_at: string
}

/** 邀请申请表建表 SQL */
const CREATE_TEMPORARY_INVITE_REQUESTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS temporary_invite_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    source_path TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`

/** 邀请申请邮箱唯一索引 SQL */
const CREATE_TEMPORARY_INVITE_REQUESTS_EMAIL_INDEX_SQL = `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_temporary_invite_requests_email
  ON temporary_invite_requests(email);
`

/**
 * 判断邀请申请表是否已存在。
 * @param database Cloudflare D1 实例
 * @returns 是否已创建
 */
async function hasTemporaryInviteRequestTable(database: D1Database): Promise<boolean> {
  const table = await database
    .prepare(
      `
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = ?
        LIMIT 1
      `,
    )
    .bind(TEMPORARY_INVITE_REQUESTS_TABLE)
    .first<{ name: string }>()

  return table?.name === TEMPORARY_INVITE_REQUESTS_TABLE
}

/**
 * 确保临时邀请申请表存在。
 * 这里采用惰性建表，避免这次临时兜底方案额外引入 Payload migration。
 * @param database Cloudflare D1 实例
 */
export async function ensureTemporaryInviteRequestTable(database: D1Database): Promise<void> {
  // D1 在本地开发环境下对 exec 的 DDL 解析不稳定，这里改为 prepare + run。
  await database.prepare(CREATE_TEMPORARY_INVITE_REQUESTS_TABLE_SQL.trim()).run()
  await database.prepare(CREATE_TEMPORARY_INVITE_REQUESTS_EMAIL_INDEX_SQL.trim()).run()
}

/**
 * 读取当前数据库中的邀请申请记录。
 * 若表尚未创建，则直接返回空列表，避免后台首次访问时报错。
 * @param database Cloudflare D1 实例
 * @returns 按时间倒序排列的邀请记录
 */
export async function listTemporaryInviteRequests(
  database: D1Database,
): Promise<TemporaryInviteRequestRecord[]> {
  if (!(await hasTemporaryInviteRequestTable(database))) {
    return []
  }

  const result = await database
    .prepare(
      `
        SELECT
          id,
          email,
          source_path,
          ip_address,
          user_agent,
          created_at
        FROM ${TEMPORARY_INVITE_REQUESTS_TABLE}
        ORDER BY created_at DESC, id DESC
      `,
    )
    .all<TemporaryInviteRequestRecord>()

  return result.results ?? []
}
