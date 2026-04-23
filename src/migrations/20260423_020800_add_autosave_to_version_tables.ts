import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为启用 drafts.autosave 的 Payload 版本表补齐 autosave 标记列。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`autosave\` integer;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v\` ADD \`autosave\` integer;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`autosave\` integer;`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v\` ADD \`autosave\` integer;`)
  await db.run(sql`ALTER TABLE \`_terms_page_v\` ADD \`autosave\` integer;`)
}

/**
 * 回滚 Payload 版本表 autosave 标记列。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_terms_page_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`autosave\`;`)
}
