import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为 Blog Markdown 模式增加本地化 Markdown 原稿字段。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`markdown_content\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_markdown_content\` text;`)
}

/**
 * 回滚 Blog Markdown 原稿字段。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_markdown_content\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`markdown_content\`;`)
}
