import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为友情链接新增 HTML 自动提取所需字段。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`friendly_links\` ADD \`input_mode\` text DEFAULT 'manual';`)
  await db.run(sql`ALTER TABLE \`friendly_links\` ADD \`html_snippet\` text;`)
  await db.run(sql`ALTER TABLE \`friendly_links\` ADD \`avatar_url\` text;`)
}

/**
 * 回滚 HTML 自动提取字段。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`friendly_links\` DROP COLUMN \`avatar_url\`;`)
  await db.run(sql`ALTER TABLE \`friendly_links\` DROP COLUMN \`html_snippet\`;`)
  await db.run(sql`ALTER TABLE \`friendly_links\` DROP COLUMN \`input_mode\`;`)
}
