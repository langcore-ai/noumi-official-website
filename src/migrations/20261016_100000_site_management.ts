import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`seo_configs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`path\` text,
  	\`image_id\` integer,
  	\`canonical\` text,
  	\`no_index\` integer DEFAULT false,
  	\`no_follow\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`seo_configs_path_idx\` ON \`seo_configs\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`seo_configs_image_idx\` ON \`seo_configs\` (\`image_id\`);`)
  await db.run(
    sql`CREATE INDEX \`seo_configs_updated_at_idx\` ON \`seo_configs\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`seo_configs_created_at_idx\` ON \`seo_configs\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`seo_configs__status_idx\` ON \`seo_configs\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`seo_configs_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`keywords\` text,
  	\`og_title\` text,
  	\`og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`seo_configs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`seo_configs_locales_locale_parent_id_unique\` ON \`seo_configs_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_seo_configs_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_path\` text,
  	\`version_image_id\` integer,
  	\`version_canonical\` text,
  	\`version_no_index\` integer DEFAULT false,
  	\`version_no_follow\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  \`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`seo_configs\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_parent_idx\` ON \`_seo_configs_v\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_version_version_path_idx\` ON \`_seo_configs_v\` (\`version_path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_version_version_image_idx\` ON \`_seo_configs_v\` (\`version_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_version_version_updated_at_idx\` ON \`_seo_configs_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_version_version_created_at_idx\` ON \`_seo_configs_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_version_version__status_idx\` ON \`_seo_configs_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_created_at_idx\` ON \`_seo_configs_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_updated_at_idx\` ON \`_seo_configs_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_snapshot_idx\` ON \`_seo_configs_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_seo_configs_v_published_locale_idx\` ON \`_seo_configs_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_seo_configs_v_latest_idx\` ON \`_seo_configs_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_seo_configs_v_locales\` (
  	\`version_title\` text,
  	\`version_description\` text,
  	\`version_keywords\` text,
  	\`version_og_title\` text,
  	\`version_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_seo_configs_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_seo_configs_v_locales_locale_parent_id_unique\` ON \`_seo_configs_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_redirects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_from\` text,
  	\`version_to_type\` text DEFAULT 'reference',
  	\`version_to_url\` text,
  	\`version_type\` text,
  	\`version_resolved_target\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  \`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_redirects_v_parent_idx\` ON \`_redirects_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_redirects_v_version_version_from_idx\` ON \`_redirects_v\` (\`version_from\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_version_version_updated_at_idx\` ON \`_redirects_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_version_version_created_at_idx\` ON \`_redirects_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_version_version__status_idx\` ON \`_redirects_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_created_at_idx\` ON \`_redirects_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_updated_at_idx\` ON \`_redirects_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_redirects_v_snapshot_idx\` ON \`_redirects_v\` (\`snapshot\`);`)
  await db.run(
    sql`CREATE INDEX \`_redirects_v_published_locale_idx\` ON \`_redirects_v\` (\`published_locale\`);`,
  )
  await db.run(sql`CREATE INDEX \`_redirects_v_latest_idx\` ON \`_redirects_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_redirects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`blog_posts_id\` integer,
  	\`feature_pages_id\` integer,
  	\`use_case_pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_redirects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_posts_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`use_case_pages_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_redirects_v_rels_order_idx\` ON \`_redirects_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_rels_parent_idx\` ON \`_redirects_v_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_rels_path_idx\` ON \`_redirects_v_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_rels_blog_posts_id_idx\` ON \`_redirects_v_rels\` (\`blog_posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_rels_feature_pages_id_idx\` ON \`_redirects_v_rels\` (\`feature_pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_redirects_v_rels_use_case_pages_id_idx\` ON \`_redirects_v_rels\` (\`use_case_pages_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`menu_settings_header_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`hidden\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menu_settings_header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`menu_settings_header_children_order_idx\` ON \`menu_settings_header_children\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`menu_settings_header_children_parent_id_idx\` ON \`menu_settings_header_children\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`menu_settings_header\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`hidden\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menu_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`menu_settings_header_order_idx\` ON \`menu_settings_header\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`menu_settings_header_parent_id_idx\` ON \`menu_settings_header\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`menu_settings_footer_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`hidden\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menu_settings_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`menu_settings_footer_links_order_idx\` ON \`menu_settings_footer_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`menu_settings_footer_links_parent_id_idx\` ON \`menu_settings_footer_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`menu_settings_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`hidden\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menu_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`menu_settings_footer_order_idx\` ON \`menu_settings_footer\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`menu_settings_footer_parent_id_idx\` ON \`menu_settings_footer\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`menu_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT false,
  	\`cta_label\` text DEFAULT 'Try Noumi Free',
  	\`cta_href\` text,
  	\`description\` text DEFAULT 'A personal AI workspace built for Business & Solutions professionals',
  	\`copyright\` text DEFAULT '© 2026 Noumi. All rights reserved.',
  	\`email\` text DEFAULT 'official@noumi.ai',
  	\`phone\` text,
  	\`address\` text,
  	\`icp\` text,
  	\`public_security\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`menu_settings__status_idx\` ON \`menu_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_menu_settings_v_version_header_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`hidden\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_menu_settings_v_version_header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_header_children_order_idx\` ON \`_menu_settings_v_version_header_children\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_header_children_parent_id_idx\` ON \`_menu_settings_v_version_header_children\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_menu_settings_v_version_header\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`hidden\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_menu_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_header_order_idx\` ON \`_menu_settings_v_version_header\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_header_parent_id_idx\` ON \`_menu_settings_v_version_header\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_menu_settings_v_version_footer_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`hidden\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_menu_settings_v_version_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_footer_links_order_idx\` ON \`_menu_settings_v_version_footer_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_footer_links_parent_id_idx\` ON \`_menu_settings_v_version_footer_links\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_menu_settings_v_version_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`hidden\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_menu_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_footer_order_idx\` ON \`_menu_settings_v_version_footer\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_version_footer_parent_id_idx\` ON \`_menu_settings_v_version_footer\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_menu_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_enabled\` integer DEFAULT false,
  	\`version_cta_label\` text DEFAULT 'Try Noumi Free',
  	\`version_cta_href\` text,
  	\`version_description\` text DEFAULT 'A personal AI workspace built for Business & Solutions professionals',
  	\`version_copyright\` text DEFAULT '© 2026 Noumi. All rights reserved.',
  	\`version_email\` text DEFAULT 'official@noumi.ai',
  	\`version_phone\` text,
  	\`version_address\` text,
  	\`version_icp\` text,
  	\`version_public_security\` text,
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
    sql`CREATE INDEX \`_menu_settings_v_version_version__status_idx\` ON \`_menu_settings_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_created_at_idx\` ON \`_menu_settings_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_updated_at_idx\` ON \`_menu_settings_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_snapshot_idx\` ON \`_menu_settings_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_published_locale_idx\` ON \`_menu_settings_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_menu_settings_v_latest_idx\` ON \`_menu_settings_v\` (\`latest\`);`,
  )
  await db.run(sql`ALTER TABLE \`redirects\` ADD \`resolved_target\` text;`)
  await db.run(sql`ALTER TABLE \`redirects\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`CREATE INDEX \`redirects__status_idx\` ON \`redirects\` (\`_status\`);`)
  await db.run(
    sql`ALTER TABLE \`redirects_rels\` ADD \`feature_pages_id\` integer REFERENCES \`feature_pages\`(\`id\`) ON DELETE cascade;`,
  )
  await db.run(
    sql`CREATE INDEX \`redirects_rels_feature_pages_id_idx\` ON \`redirects_rels\` (\`feature_pages_id\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`seo_configs_id\` integer REFERENCES \`seo_configs\`(\`id\`) ON DELETE cascade;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_seo_configs_id_idx\` ON \`payload_locked_documents_rels\` (\`seo_configs_id\`);`,
  )
  await db.run(
    sql`UPDATE \`redirects\` SET \`resolved_target\` = \`to_url\` WHERE \`to_type\` = 'custom';`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`payload_locked_documents_rels_seo_configs_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`seo_configs_id\`;`)
  await db.run(sql`DROP INDEX \`redirects_rels_feature_pages_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`redirects_rels\` DROP COLUMN \`feature_pages_id\`;`)
  await db.run(sql`DROP INDEX \`redirects__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`redirects\` DROP COLUMN \`_status\`;`)
  await db.run(sql`ALTER TABLE \`redirects\` DROP COLUMN \`resolved_target\`;`)
  await db.run(sql`DROP TABLE \`_menu_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_menu_settings_v_version_footer\`;`)
  await db.run(sql`DROP TABLE \`_menu_settings_v_version_footer_links\`;`)
  await db.run(sql`DROP TABLE \`_menu_settings_v_version_header\`;`)
  await db.run(sql`DROP TABLE \`_menu_settings_v_version_header_children\`;`)
  await db.run(sql`DROP TABLE \`menu_settings\`;`)
  await db.run(sql`DROP TABLE \`menu_settings_footer\`;`)
  await db.run(sql`DROP TABLE \`menu_settings_footer_links\`;`)
  await db.run(sql`DROP TABLE \`menu_settings_header\`;`)
  await db.run(sql`DROP TABLE \`menu_settings_header_children\`;`)
  await db.run(sql`DROP TABLE \`_redirects_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_redirects_v\`;`)
  await db.run(sql`DROP TABLE \`_seo_configs_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_seo_configs_v\`;`)
  await db.run(sql`DROP TABLE \`seo_configs_locales\`;`)
  await db.run(sql`DROP TABLE \`seo_configs\`;`)
}
