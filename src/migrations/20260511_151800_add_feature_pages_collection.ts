import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 新增 Feature 子页集合。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`feature_pages_sections_bullets\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_sections_bullets_order_idx\` ON \`feature_pages_sections_bullets\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_sections_bullets_parent_id_idx\` ON \`feature_pages_sections_bullets\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_sections_bullets_locale_idx\` ON \`feature_pages_sections_bullets\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`feature_pages_sections\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`title\` text,
    \`description\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_sections_order_idx\` ON \`feature_pages_sections\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_sections_parent_id_idx\` ON \`feature_pages_sections\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_sections_locale_idx\` ON \`feature_pages_sections\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`feature_pages\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`render_mode\` text DEFAULT 'template',
    \`slug\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`feature_pages_slug_idx\` ON \`feature_pages\` (\`slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_updated_at_idx\` ON \`feature_pages\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_created_at_idx\` ON \`feature_pages\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages__status_idx\` ON \`feature_pages\` (\`_status\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`feature_pages_locales\` (
    \`html_content\` text,
    \`navigation_label\` text,
    \`hero_eyebrow\` text,
    \`hero_title\` text,
    \`hero_description\` text,
    \`hero_primary_cta_label\` text,
    \`hero_primary_cta_href\` text,
    \`summary\` text,
    \`cta_title\` text,
    \`cta_description\` text,
    \`cta_label\` text,
    \`cta_href\` text,
    \`meta_title\` text,
    \`meta_description\` text,
    \`meta_image_id\` integer,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`feature_pages_meta_meta_image_idx\` ON \`feature_pages_locales\` (\`meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`feature_pages_locales_locale_parent_id_unique\` ON \`feature_pages_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_feature_pages_v_version_sections_bullets\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`text\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_version_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_sections_bullets_order_idx\` ON \`_feature_pages_v_version_sections_bullets\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_sections_bullets_parent_id_idx\` ON \`_feature_pages_v_version_sections_bullets\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_sections_bullets_locale_idx\` ON \`_feature_pages_v_version_sections_bullets\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_feature_pages_v_version_sections\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_locale\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`title\` text,
    \`description\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_sections_order_idx\` ON \`_feature_pages_v_version_sections\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_sections_parent_id_idx\` ON \`_feature_pages_v_version_sections\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_sections_locale_idx\` ON \`_feature_pages_v_version_sections\` (\`_locale\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_feature_pages_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`parent_id\` integer,
    \`version_render_mode\` text DEFAULT 'template',
    \`version_slug\` text,
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`version__status\` text DEFAULT 'draft',
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`snapshot\` integer,
    \`published_locale\` text,
    \`latest\` integer,
    \`autosave\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_parent_idx\` ON \`_feature_pages_v\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_version_slug_idx\` ON \`_feature_pages_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_version_updated_at_idx\` ON \`_feature_pages_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_version_created_at_idx\` ON \`_feature_pages_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_version__status_idx\` ON \`_feature_pages_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_created_at_idx\` ON \`_feature_pages_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_updated_at_idx\` ON \`_feature_pages_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_snapshot_idx\` ON \`_feature_pages_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_published_locale_idx\` ON \`_feature_pages_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_latest_idx\` ON \`_feature_pages_v\` (\`latest\`);`,
  )

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_feature_pages_v_locales\` (
    \`version_html_content\` text,
    \`version_navigation_label\` text,
    \`version_hero_eyebrow\` text,
    \`version_hero_title\` text,
    \`version_hero_description\` text,
    \`version_hero_primary_cta_label\` text,
    \`version_hero_primary_cta_href\` text,
    \`version_summary\` text,
    \`version_cta_title\` text,
    \`version_cta_description\` text,
    \`version_cta_label\` text,
    \`version_cta_href\` text,
    \`version_meta_title\` text,
    \`version_meta_description\` text,
    \`version_meta_image_id\` integer,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_feature_pages_v_version_meta_version_meta_image_idx\` ON \`_feature_pages_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_feature_pages_v_locales_locale_parent_id_unique\` ON \`_feature_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`feature_pages_id\` integer REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade;`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_feature_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`feature_pages_id\`);`,
  )
}

/**
 * 回滚 Feature 子页集合。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_feature_pages_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`feature_pages_id\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_feature_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_feature_pages_v_version_sections_bullets\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_feature_pages_v_version_sections\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_feature_pages_v\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`feature_pages_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`feature_pages_sections_bullets\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`feature_pages_sections\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`feature_pages\`;`)
}
