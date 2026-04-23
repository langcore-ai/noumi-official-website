import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为 Blog 与 Use Case 内容增加 HTML 渲染模式字段。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts\` ADD \`render_mode\` text DEFAULT 'template';`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`html_content\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`version_render_mode\` text DEFAULT 'template';`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_html_content\` text;`)

  await db.run(sql`ALTER TABLE \`use_case_pages\` ADD \`render_mode\` text DEFAULT 'template';`)
  await db.run(sql`ALTER TABLE \`use_case_pages_locales\` ADD \`html_content\` text;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v\` ADD \`version_render_mode\` text DEFAULT 'template';`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v_locales\` ADD \`version_html_content\` text;`)
}

/**
 * 回滚 HTML 渲染模式字段。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_use_case_pages_v_locales\` DROP COLUMN \`version_html_content\`;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v\` DROP COLUMN \`version_render_mode\`;`)
  await db.run(sql`ALTER TABLE \`use_case_pages_locales\` DROP COLUMN \`html_content\`;`)
  await db.run(sql`ALTER TABLE \`use_case_pages\` DROP COLUMN \`render_mode\`;`)

  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_html_content\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`version_render_mode\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`html_content\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts\` DROP COLUMN \`render_mode\`;`)
}
