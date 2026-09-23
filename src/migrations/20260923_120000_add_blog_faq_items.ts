import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为 Blog Markdown 模式增加本地化 FAQ 条目（原型文章页的 FAQ 手风琴）。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`blog_posts_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`blog_posts_faq_items_order_idx\` ON \`blog_posts_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`blog_posts_faq_items_parent_id_idx\` ON \`blog_posts_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`blog_posts_faq_items_locale_idx\` ON \`blog_posts_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_blog_posts_v_version_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_blog_posts_v_version_faq_items_order_idx\` ON \`_blog_posts_v_version_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_blog_posts_v_version_faq_items_parent_id_idx\` ON \`_blog_posts_v_version_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_blog_posts_v_version_faq_items_locale_idx\` ON \`_blog_posts_v_version_faq_items\` (\`_locale\`);`,
  )
}

/**
 * 回滚 Blog FAQ 条目。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_blog_posts_v_version_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`blog_posts_faq_items\`;`)
}
