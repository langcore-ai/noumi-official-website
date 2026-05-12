import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 新增 Features 页面全局配置。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_feature_cards_supported_features\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page_feature_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_feature_cards_supported_features_order_idx\` ON \`features_page_feature_cards_supported_features\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_feature_cards_supported_features_parent_id_idx\` ON \`features_page_feature_cards_supported_features\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_feature_cards_supported_features_locale_idx\` ON \`features_page_feature_cards_supported_features\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_feature_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`tone\` text DEFAULT 'memory',
    \`title\` text,
    \`description\` text,
    \`cta_label\` text,
    \`cta_href\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_feature_cards_order_idx\` ON \`features_page_feature_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_feature_cards_parent_id_idx\` ON \`features_page_feature_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_feature_cards_locale_idx\` ON \`features_page_feature_cards\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_ability_cards_tags\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page_ability_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_ability_cards_tags_order_idx\` ON \`features_page_ability_cards_tags\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_ability_cards_tags_parent_id_idx\` ON \`features_page_ability_cards_tags\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_ability_cards_tags_locale_idx\` ON \`features_page_ability_cards_tags\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_ability_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text,
    \`description\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_ability_cards_order_idx\` ON \`features_page_ability_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_ability_cards_parent_id_idx\` ON \`features_page_ability_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_ability_cards_locale_idx\` ON \`features_page_ability_cards\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_role_cards\` (
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
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_role_cards_order_idx\` ON \`features_page_role_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_role_cards_parent_id_idx\` ON \`features_page_role_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_role_cards_locale_idx\` ON \`features_page_role_cards\` (\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_role_cards_target_use_case_idx\` ON \`features_page_role_cards\` (\`target_use_case_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_role_cards_avatar_image_idx\` ON \`features_page_role_cards\` (\`avatar_image_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_faq_items_order_idx\` ON \`features_page_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_faq_items_parent_id_idx\` ON \`features_page_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_faq_items_locale_idx\` ON \`features_page_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_status\` text DEFAULT 'draft',
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page__status_idx\` ON \`features_page\` (\`_status\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`features_page_locales\` (
    \`meta_title\` text,
    \`meta_description\` text,
    \`og_image_id\` integer,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`features_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`features_page_og_image_idx\` ON \`features_page_locales\` (\`og_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`features_page_locales_locale_parent_id_unique\` ON \`features_page_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_version_feature_cards_supported_features\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v_version_feature_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_feature_cards_supported_features_order_idx\` ON \`_features_page_v_version_feature_cards_supported_features\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_feature_cards_supported_features_parent_id_idx\` ON \`_features_page_v_version_feature_cards_supported_features\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_feature_cards_supported_features_locale_idx\` ON \`_features_page_v_version_feature_cards_supported_features\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_version_feature_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`tone\` text DEFAULT 'memory',
    \`title\` text,
    \`description\` text,
    \`cta_label\` text,
    \`cta_href\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_feature_cards_order_idx\` ON \`_features_page_v_version_feature_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_feature_cards_parent_id_idx\` ON \`_features_page_v_version_feature_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_feature_cards_locale_idx\` ON \`_features_page_v_version_feature_cards\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_version_ability_cards_tags\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v_version_ability_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_ability_cards_tags_order_idx\` ON \`_features_page_v_version_ability_cards_tags\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_ability_cards_tags_parent_id_idx\` ON \`_features_page_v_version_ability_cards_tags\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_ability_cards_tags_locale_idx\` ON \`_features_page_v_version_ability_cards_tags\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_version_ability_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text,
    \`description\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_ability_cards_order_idx\` ON \`_features_page_v_version_ability_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_ability_cards_parent_id_idx\` ON \`_features_page_v_version_ability_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_ability_cards_locale_idx\` ON \`_features_page_v_version_ability_cards\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_version_role_cards\` (
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
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_role_cards_order_idx\` ON \`_features_page_v_version_role_cards\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_role_cards_parent_id_idx\` ON \`_features_page_v_version_role_cards\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_role_cards_locale_idx\` ON \`_features_page_v_version_role_cards\` (\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_role_cards_target_use_case_idx\` ON \`_features_page_v_version_role_cards\` (\`target_use_case_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_role_cards_avatar_image_idx\` ON \`_features_page_v_version_role_cards\` (\`avatar_image_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_version_faq_items\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`question\` text,
    \`answer\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_faq_items_order_idx\` ON \`_features_page_v_version_faq_items\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_faq_items_parent_id_idx\` ON \`_features_page_v_version_faq_items\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_faq_items_locale_idx\` ON \`_features_page_v_version_faq_items\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v\` (
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
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_version__status_idx\` ON \`_features_page_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_created_at_idx\` ON \`_features_page_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_updated_at_idx\` ON \`_features_page_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_snapshot_idx\` ON \`_features_page_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_published_locale_idx\` ON \`_features_page_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_latest_idx\` ON \`_features_page_v\` (\`latest\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_features_page_v_locales\` (
    \`version_meta_title\` text,
    \`version_meta_description\` text,
    \`version_og_image_id\` integer,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_features_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_features_page_v_version_version_og_image_idx\` ON \`_features_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_features_page_v_locales_locale_parent_id_unique\` ON \`_features_page_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
}

/**
 * 回滚 Features 页面全局配置。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v_version_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v_version_role_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v_version_ability_cards_tags\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v_version_ability_cards\`;`)
  await db.run(
    sql`DROP TABLE IF EXISTS \`_features_page_v_version_feature_cards_supported_features\`;`,
  )
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v_version_feature_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_features_page_v\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_faq_items\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_role_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_ability_cards_tags\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_ability_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_feature_cards_supported_features\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page_feature_cards\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`features_page\`;`)
}
