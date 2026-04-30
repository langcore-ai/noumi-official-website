import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 新增 Use Cases 聚合页全局配置。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`use_cases_page_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`target_use_case_id\` integer,
    \`tone\` text DEFAULT 'pm',
    \`avatar_preset\` text,
    \`avatar_image_id\` integer,
    \`title\` text,
    \`description\` text,
    \`cta_label\` text,
    FOREIGN KEY (\`target_use_case_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`avatar_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_cases_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_cards_order_idx\` ON \`use_cases_page_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_cards_parent_id_idx\` ON \`use_cases_page_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_cards_locale_idx\` ON \`use_cases_page_cards\` (\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_cards_target_use_case_idx\` ON \`use_cases_page_cards\` (\`target_use_case_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_cards_avatar_image_idx\` ON \`use_cases_page_cards\` (\`avatar_image_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`use_cases_page_coming_soon_roles\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_cases_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_coming_soon_roles_order_idx\` ON \`use_cases_page_coming_soon_roles\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_coming_soon_roles_parent_id_idx\` ON \`use_cases_page_coming_soon_roles\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_coming_soon_roles_locale_idx\` ON \`use_cases_page_coming_soon_roles\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`use_cases_page_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_cases_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_faq_items_order_idx\` ON \`use_cases_page_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_faq_items_parent_id_idx\` ON \`use_cases_page_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_faq_items_locale_idx\` ON \`use_cases_page_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`use_cases_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_status\` text DEFAULT 'draft',
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page__status_idx\` ON \`use_cases_page\` (\`_status\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`use_cases_page_locales\` (
    \`meta_title\` text,
    \`meta_description\` text,
    \`og_image_id\` integer,
    \`more_title\` text,
    \`more_description\` text,
    \`faq_eyebrow\` text,
    \`faq_title\` text,
    \`faq_description\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_cases_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`use_cases_page_og_image_idx\` ON \`use_cases_page_locales\` (\`og_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`use_cases_page_locales_locale_parent_id_unique\` ON \`use_cases_page_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_use_cases_page_v_version_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`target_use_case_id\` integer,
    \`tone\` text DEFAULT 'pm',
    \`avatar_preset\` text,
    \`avatar_image_id\` integer,
    \`title\` text,
    \`description\` text,
    \`cta_label\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`target_use_case_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`avatar_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_cases_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_cards_order_idx\` ON \`_use_cases_page_v_version_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_cards_parent_id_idx\` ON \`_use_cases_page_v_version_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_cards_locale_idx\` ON \`_use_cases_page_v_version_cards\` (\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_cards_target_use_case_idx\` ON \`_use_cases_page_v_version_cards\` (\`target_use_case_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_cards_avatar_image_idx\` ON \`_use_cases_page_v_version_cards\` (\`avatar_image_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_use_cases_page_v_version_coming_soon_roles\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_cases_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_coming_soon_roles_order_idx\` ON \`_use_cases_page_v_version_coming_soon_roles\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_coming_soon_roles_parent_id_idx\` ON \`_use_cases_page_v_version_coming_soon_roles\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_coming_soon_roles_locale_idx\` ON \`_use_cases_page_v_version_coming_soon_roles\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_use_cases_page_v_version_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_cases_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_faq_items_order_idx\` ON \`_use_cases_page_v_version_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_faq_items_parent_id_idx\` ON \`_use_cases_page_v_version_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_faq_items_locale_idx\` ON \`_use_cases_page_v_version_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_use_cases_page_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
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
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_version__status_idx\` ON \`_use_cases_page_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_created_at_idx\` ON \`_use_cases_page_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_updated_at_idx\` ON \`_use_cases_page_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_snapshot_idx\` ON \`_use_cases_page_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_published_locale_idx\` ON \`_use_cases_page_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_latest_idx\` ON \`_use_cases_page_v\` (\`latest\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_use_cases_page_v_locales\` (
    \`version_meta_title\` text,
    \`version_meta_description\` text,
    \`version_og_image_id\` integer,
    \`version_more_title\` text,
    \`version_more_description\` text,
    \`version_faq_eyebrow\` text,
    \`version_faq_title\` text,
    \`version_faq_description\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_cases_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_use_cases_page_v_version_version_og_image_idx\` ON \`_use_cases_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_use_cases_page_v_locales_locale_parent_id_unique\` ON \`_use_cases_page_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
}

/**
 * 回滚 Use Cases 聚合页全局配置。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_use_cases_page_v_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_use_cases_page_v_version_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_use_cases_page_v_version_coming_soon_roles\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_use_cases_page_v_version_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_use_cases_page_v\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`use_cases_page_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`use_cases_page_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`use_cases_page_coming_soon_roles\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`use_cases_page_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`use_cases_page\`;`)
}
