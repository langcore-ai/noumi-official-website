import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 为 FAQ、Privacy 与 Terms 页面增加 HTML 渲染模式。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`faq_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`render_mode\` text DEFAULT 'template',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`faq_page__status_idx\` ON \`faq_page\` (\`_status\`);`,
  )
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`faq_page_locales\` (
  	\`html_content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`faq_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`faq_page_locales_locale_parent_id_unique\` ON \`faq_page_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_faq_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_render_mode\` text DEFAULT 'template',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_faq_page_v_version_version__status_idx\` ON \`_faq_page_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_faq_page_v_created_at_idx\` ON \`_faq_page_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_faq_page_v_updated_at_idx\` ON \`_faq_page_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_faq_page_v_snapshot_idx\` ON \`_faq_page_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_faq_page_v_published_locale_idx\` ON \`_faq_page_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_faq_page_v_latest_idx\` ON \`_faq_page_v\` (\`latest\`);`,
  )
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_faq_page_v_locales\` (
  	\`version_html_content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_faq_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_faq_page_v_locales_locale_parent_id_unique\` ON \`_faq_page_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`ALTER TABLE \`privacy_page\` ADD \`render_mode\` text DEFAULT 'template';`)
  await db.run(sql`ALTER TABLE \`privacy_page_locales\` ADD \`html_content\` text;`)
  await db.run(
    sql`ALTER TABLE \`_privacy_page_v\` ADD \`version_render_mode\` text DEFAULT 'template';`,
  )
  await db.run(sql`ALTER TABLE \`_privacy_page_v_locales\` ADD \`version_html_content\` text;`)

  await db.run(sql`ALTER TABLE \`terms_page\` ADD \`render_mode\` text DEFAULT 'template';`)
  await db.run(sql`ALTER TABLE \`terms_page_locales\` ADD \`html_content\` text;`)
  await db.run(
    sql`ALTER TABLE \`_terms_page_v\` ADD \`version_render_mode\` text DEFAULT 'template';`,
  )
  await db.run(sql`ALTER TABLE \`_terms_page_v_locales\` ADD \`version_html_content\` text;`)
}

/**
 * 回滚 FAQ、Privacy 与 Terms 页面的 HTML 渲染模式字段。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`_terms_page_v_locales\` DROP COLUMN \`version_html_content\`;`)
  await db.run(sql`ALTER TABLE \`_terms_page_v\` DROP COLUMN \`version_render_mode\`;`)
  await db.run(sql`ALTER TABLE \`terms_page_locales\` DROP COLUMN \`html_content\`;`)
  await db.run(sql`ALTER TABLE \`terms_page\` DROP COLUMN \`render_mode\`;`)

  await db.run(sql`ALTER TABLE \`_privacy_page_v_locales\` DROP COLUMN \`version_html_content\`;`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v\` DROP COLUMN \`version_render_mode\`;`)
  await db.run(sql`ALTER TABLE \`privacy_page_locales\` DROP COLUMN \`html_content\`;`)
  await db.run(sql`ALTER TABLE \`privacy_page\` DROP COLUMN \`render_mode\`;`)

  await db.run(sql`DROP TABLE \`_faq_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_faq_page_v\`;`)
  await db.run(sql`DROP TABLE \`faq_page_locales\`;`)
  await db.run(sql`DROP TABLE \`faq_page\`;`)
}
