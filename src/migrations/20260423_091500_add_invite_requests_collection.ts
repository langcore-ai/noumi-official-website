import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/** 旧临时 invite 申请表名 */
const LEGACY_INVITE_REQUESTS_TABLE = 'temporary_invite_requests'

/**
 * 判断旧临时 invite 申请表是否存在。
 * @param db Drizzle D1 实例
 * @returns 是否存在旧表
 */
async function hasLegacyInviteRequestsTable(db: MigrateUpArgs['db']): Promise<boolean> {
  const result = await db.run(sql`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name = ${LEGACY_INVITE_REQUESTS_TABLE}
    LIMIT 1
  `)
  const rows = ('results' in result && Array.isArray(result.results) ? result.results : []) as unknown[]

  return rows.length > 0
}

/**
 * 新增正式 invite 申请集合表，并迁移旧临时表数据。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`invite_requests\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`source_path\` text,
  	\`ip_address\` text,
  	\`user_agent\` text,
  	\`submitted_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`internal_note\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`invite_requests_email_idx\` ON \`invite_requests\` (\`email\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`invite_requests_status_idx\` ON \`invite_requests\` (\`status\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`invite_requests_submitted_at_idx\` ON \`invite_requests\` (\`submitted_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`invite_requests_updated_at_idx\` ON \`invite_requests\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`invite_requests_created_at_idx\` ON \`invite_requests\` (\`created_at\`);`,
  )

  if (!(await hasLegacyInviteRequestsTable(db))) {
    return
  }

  await db.run(sql`
    INSERT OR IGNORE INTO \`invite_requests\` (
      \`email\`,
      \`status\`,
      \`source_path\`,
      \`ip_address\`,
      \`user_agent\`,
      \`submitted_at\`,
      \`updated_at\`,
      \`created_at\`
    )
    SELECT
      lower(trim(\`email\`)),
      'new',
      \`source_path\`,
      \`ip_address\`,
      \`user_agent\`,
      CASE
        WHEN instr(\`created_at\`, 'T') > 0 THEN \`created_at\`
        ELSE replace(\`created_at\`, ' ', 'T') || 'Z'
      END,
      CASE
        WHEN instr(\`created_at\`, 'T') > 0 THEN \`created_at\`
        ELSE replace(\`created_at\`, ' ', 'T') || 'Z'
      END,
      CASE
        WHEN instr(\`created_at\`, 'T') > 0 THEN \`created_at\`
        ELSE replace(\`created_at\`, ' ', 'T') || 'Z'
      END
    FROM \`temporary_invite_requests\`
    WHERE trim(\`email\`) != '';
  `)
}

/**
 * 回滚正式 invite 申请集合表。
 * 回滚时尽量把数据写回旧表，便于老版本代码继续读取。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`temporary_invite_requests\` (
    \`id\` integer PRIMARY KEY AUTOINCREMENT,
    \`email\` text NOT NULL,
    \`source_path\` text,
    \`ip_address\` text,
    \`user_agent\` text,
    \`created_at\` text NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `)
  await db.run(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS \`idx_temporary_invite_requests_email\`
    ON \`temporary_invite_requests\`(\`email\`);
  `)
  await db.run(sql`
    INSERT OR IGNORE INTO \`temporary_invite_requests\` (
      \`email\`,
      \`source_path\`,
      \`ip_address\`,
      \`user_agent\`,
      \`created_at\`
    )
    SELECT
      \`email\`,
      \`source_path\`,
      \`ip_address\`,
      \`user_agent\`,
      \`submitted_at\`
    FROM \`invite_requests\`;
  `)

  await db.run(sql`DROP TABLE \`invite_requests\`;`)
}
