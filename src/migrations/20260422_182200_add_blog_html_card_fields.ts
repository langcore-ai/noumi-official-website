import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为 Blog HTML 模式增加列表卡片配置字段。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`html_card_image_id\` integer;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`html_card_tag\` text;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`html_card_title\` text;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`html_card_description\` text;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`html_card_reading_time\` text;`)

  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_html_card_image_id\` integer;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_html_card_tag\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_html_card_title\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_html_card_description\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_html_card_reading_time\` text;`)
}

/**
 * 回滚 Blog HTML 模式列表卡片配置字段。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_html_card_reading_time\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_html_card_description\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_html_card_title\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_html_card_tag\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_html_card_image_id\`;`)

  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`html_card_reading_time\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`html_card_description\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`html_card_title\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`html_card_tag\`;`)
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`html_card_image_id\`;`)
}
