import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/** 为文章及历史版本添加本地化 SEO JSON 数据。 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`meta_structured_data\` text;`)
  await db.run(
    sql`ALTER TABLE \`_blog_posts_v_locales\` ADD \`version_meta_structured_data\` text;`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`_blog_posts_v_locales\` DROP COLUMN \`version_meta_structured_data\`;`,
  )
  await db.run(sql`ALTER TABLE \`blog_posts_locales\` DROP COLUMN \`meta_structured_data\`;`)
}
