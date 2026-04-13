import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 将历史主表内容标记为已发布
 * 旧内容在引入 drafts 前没有 `_status`，需要在迁移时显式回填，避免官网内容被默认隐藏。
 * @param db 当前迁移事务中的数据库实例
 * @param tableName 目标表名
 */
async function markTableAsPublished(
  db: MigrateUpArgs['db'],
  tableName:
    | 'about_page'
    | 'feature_pages'
    | 'legal_pages'
    | 'pricing_page'
    | 'site_settings'
    | 'use_case_pages',
): Promise<void> {
  await db.run(sql.raw(`UPDATE \`${tableName}\` SET \`_status\` = 'published';`))
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_tags_order_idx\` ON \`_blog_posts_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_tags_parent_id_idx\` ON \`_blog_posts_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_tags_locale_idx\` ON \`_blog_posts_v_version_tags\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_content_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_version_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_paragraphs_order_idx\` ON \`_blog_posts_v_version_content_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_paragraphs_parent_id_idx\` ON \`_blog_posts_v_version_content_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_paragraphs_locale_idx\` ON \`_blog_posts_v_version_content_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_content_sections_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_version_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_bullets_order_idx\` ON \`_blog_posts_v_version_content_sections_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_bullets_parent_id_idx\` ON \`_blog_posts_v_version_content_sections_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_bullets_locale_idx\` ON \`_blog_posts_v_version_content_sections_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_content_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_order_idx\` ON \`_blog_posts_v_version_content_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_parent_id_idx\` ON \`_blog_posts_v_version_content_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_content_sections_locale_idx\` ON \`_blog_posts_v_version_content_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_published_at\` text,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_parent_idx\` ON \`_blog_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_slug_idx\` ON \`_blog_posts_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_updated_at_idx\` ON \`_blog_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_created_at_idx\` ON \`_blog_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version__status_idx\` ON \`_blog_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_created_at_idx\` ON \`_blog_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_updated_at_idx\` ON \`_blog_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_snapshot_idx\` ON \`_blog_posts_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_published_locale_idx\` ON \`_blog_posts_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_latest_idx\` ON \`_blog_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_autosave_idx\` ON \`_blog_posts_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_locales\` (
  	\`version_title\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_excerpt\` text,
  	\`version_og_image_id\` integer,
  	\`version_author\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_version_og_image_idx\` ON \`_blog_posts_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_version_meta_version_meta_image_idx\` ON \`_blog_posts_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_blog_posts_v_locales_locale_parent_id_unique\` ON \`_blog_posts_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_version_summary_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_summary_bullets_order_idx\` ON \`_feature_pages_v_version_summary_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_summary_bullets_parent_id_idx\` ON \`_feature_pages_v_version_summary_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_summary_bullets_locale_idx\` ON \`_feature_pages_v_version_summary_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_version_body_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_version_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_paragraphs_order_idx\` ON \`_feature_pages_v_version_body_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_paragraphs_parent_id_idx\` ON \`_feature_pages_v_version_body_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_paragraphs_locale_idx\` ON \`_feature_pages_v_version_body_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_version_body_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_version_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_cards_order_idx\` ON \`_feature_pages_v_version_body_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_cards_parent_id_idx\` ON \`_feature_pages_v_version_body_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_cards_locale_idx\` ON \`_feature_pages_v_version_body_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_version_body_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_version_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_bullets_order_idx\` ON \`_feature_pages_v_version_body_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_bullets_parent_id_idx\` ON \`_feature_pages_v_version_body_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_bullets_locale_idx\` ON \`_feature_pages_v_version_body_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_version_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_order_idx\` ON \`_feature_pages_v_version_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_parent_id_idx\` ON \`_feature_pages_v_version_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_body_locale_idx\` ON \`_feature_pages_v_version_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
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
  await db.run(sql`CREATE INDEX \`_feature_pages_v_parent_idx\` ON \`_feature_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_version_slug_idx\` ON \`_feature_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_version_updated_at_idx\` ON \`_feature_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_version_created_at_idx\` ON \`_feature_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_version__status_idx\` ON \`_feature_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_created_at_idx\` ON \`_feature_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_updated_at_idx\` ON \`_feature_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_snapshot_idx\` ON \`_feature_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_published_locale_idx\` ON \`_feature_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_latest_idx\` ON \`_feature_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_autosave_idx\` ON \`_feature_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_hero_label\` text,
  	\`version_hero_title\` text,
  	\`version_hero_emphasis\` text,
  	\`version_hero_lead\` text,
  	\`version_cta_title\` text,
  	\`version_cta_description\` text,
  	\`version_og_image_id\` integer,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_version_og_image_idx\` ON \`_feature_pages_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_version_meta_version_meta_image_idx\` ON \`_feature_pages_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_feature_pages_v_locales_locale_parent_id_unique\` ON \`_feature_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`feature_pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_rels_order_idx\` ON \`_feature_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_rels_parent_idx\` ON \`_feature_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_rels_path_idx\` ON \`_feature_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_rels_feature_pages_id_idx\` ON \`_feature_pages_v_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_version_pain_points\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_pain_points_order_idx\` ON \`_use_case_pages_v_version_pain_points\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_pain_points_parent_id_idx\` ON \`_use_case_pages_v_version_pain_points\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_pain_points_locale_idx\` ON \`_use_case_pages_v_version_pain_points\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_version_solution_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_version_solution_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_solution_sections_paragraphs_order_idx\` ON \`_use_case_pages_v_version_solution_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_solution_sections_paragraphs_parent_id_idx\` ON \`_use_case_pages_v_version_solution_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_solution_sections_paragraphs_locale_idx\` ON \`_use_case_pages_v_version_solution_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_version_solution_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_solution_sections_order_idx\` ON \`_use_case_pages_v_version_solution_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_solution_sections_parent_id_idx\` ON \`_use_case_pages_v_version_solution_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_solution_sections_locale_idx\` ON \`_use_case_pages_v_version_solution_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_parent_idx\` ON \`_use_case_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_version_slug_idx\` ON \`_use_case_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_version_updated_at_idx\` ON \`_use_case_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_version_created_at_idx\` ON \`_use_case_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_version__status_idx\` ON \`_use_case_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_created_at_idx\` ON \`_use_case_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_updated_at_idx\` ON \`_use_case_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_snapshot_idx\` ON \`_use_case_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_published_locale_idx\` ON \`_use_case_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_latest_idx\` ON \`_use_case_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_autosave_idx\` ON \`_use_case_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_role_label\` text,
  	\`version_hero_title\` text,
  	\`version_hero_lead\` text,
  	\`version_og_image_id\` integer,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_version_og_image_idx\` ON \`_use_case_pages_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_version_meta_version_meta_image_idx\` ON \`_use_case_pages_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_use_case_pages_v_locales_locale_parent_id_unique\` ON \`_use_case_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`feature_pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_rels_order_idx\` ON \`_use_case_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_rels_parent_idx\` ON \`_use_case_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_rels_path_idx\` ON \`_use_case_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_rels_feature_pages_id_idx\` ON \`_use_case_pages_v_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_nav_links_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_nav_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_nav_links_children_order_idx\` ON \`_site_settings_v_version_nav_links_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_nav_links_children_parent_id_idx\` ON \`_site_settings_v_version_nav_links_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_nav_links_children_locale_idx\` ON \`_site_settings_v_version_nav_links_children\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_nav_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_nav_links_order_idx\` ON \`_site_settings_v_version_nav_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_nav_links_parent_id_idx\` ON \`_site_settings_v_version_nav_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_nav_links_locale_idx\` ON \`_site_settings_v_version_nav_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_columns_links_order_idx\` ON \`_site_settings_v_version_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_columns_links_parent_id_idx\` ON \`_site_settings_v_version_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_columns_links_locale_idx\` ON \`_site_settings_v_version_footer_columns_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_columns_order_idx\` ON \`_site_settings_v_version_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_columns_parent_id_idx\` ON \`_site_settings_v_version_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_columns_locale_idx\` ON \`_site_settings_v_version_footer_columns\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_home_problems_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_home_problems\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_problems_paragraphs_order_idx\` ON \`_site_settings_v_version_home_problems_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_problems_paragraphs_parent_id_idx\` ON \`_site_settings_v_version_home_problems_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_problems_paragraphs_locale_idx\` ON \`_site_settings_v_version_home_problems_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_home_problems\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_problems_order_idx\` ON \`_site_settings_v_version_home_problems\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_problems_parent_id_idx\` ON \`_site_settings_v_version_home_problems\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_problems_locale_idx\` ON \`_site_settings_v_version_home_problems\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_home_how_it_works\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_how_it_works_order_idx\` ON \`_site_settings_v_version_home_how_it_works\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_how_it_works_parent_id_idx\` ON \`_site_settings_v_version_home_how_it_works\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_home_how_it_works_locale_idx\` ON \`_site_settings_v_version_home_how_it_works\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_site_name\` text,
  	\`version_site_url\` text,
  	\`version_contact_email\` text,
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
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_snapshot_idx\` ON \`_site_settings_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_published_locale_idx\` ON \`_site_settings_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_autosave_idx\` ON \`_site_settings_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_locales\` (
  	\`version_default_description\` text,
  	\`version_nav_cta_text\` text,
  	\`version_nav_cta_href\` text,
  	\`version_footer_description\` text,
  	\`version_footer_copyright\` text,
  	\`version_default_og_image_id\` integer,
  	\`version_home_hero_label\` text,
  	\`version_home_hero_title\` text,
  	\`version_home_hero_subtitle\` text,
  	\`version_home_hero_intro\` text,
  	\`version_home_hero_roles\` text,
  	\`version_home_hero_primary_cta_label\` text,
  	\`version_home_hero_primary_cta_href\` text,
  	\`version_home_hero_secondary_cta_label\` text,
  	\`version_home_hero_secondary_cta_href\` text,
  	\`version_home_feature_intro\` text,
  	\`version_home_final_cta_title\` text,
  	\`version_home_final_cta_description\` text,
  	\`version_home_final_cta_primary_cta_label\` text,
  	\`version_home_final_cta_primary_cta_href\` text,
  	\`version_home_final_cta_secondary_cta_label\` text,
  	\`version_home_final_cta_secondary_cta_href\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_default_og_image_idx\` ON \`_site_settings_v_locales\` (\`version_default_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_meta_version_meta_image_idx\` ON \`_site_settings_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_site_settings_v_locales_locale_parent_id_unique\` ON \`_site_settings_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_mission_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_mission_paragraphs_order_idx\` ON \`_about_page_v_version_mission_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_mission_paragraphs_parent_id_idx\` ON \`_about_page_v_version_mission_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_mission_paragraphs_locale_idx\` ON \`_about_page_v_version_mission_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_story_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_story_paragraphs_order_idx\` ON \`_about_page_v_version_story_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_story_paragraphs_parent_id_idx\` ON \`_about_page_v_version_story_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_story_paragraphs_locale_idx\` ON \`_about_page_v_version_story_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_stats_order_idx\` ON \`_about_page_v_version_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_stats_parent_id_idx\` ON \`_about_page_v_version_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_stats_locale_idx\` ON \`_about_page_v_version_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_recognition\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`item\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_recognition_order_idx\` ON \`_about_page_v_version_recognition\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_recognition_parent_id_idx\` ON \`_about_page_v_version_recognition\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_recognition_locale_idx\` ON \`_about_page_v_version_recognition\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_contact_email\` text,
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
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version__status_idx\` ON \`_about_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_created_at_idx\` ON \`_about_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_updated_at_idx\` ON \`_about_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_snapshot_idx\` ON \`_about_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_published_locale_idx\` ON \`_about_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_latest_idx\` ON \`_about_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_autosave_idx\` ON \`_about_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_locales\` (
  	\`version_intro\` text,
  	\`version_contact_title\` text,
  	\`version_contact_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_locales_locale_parent_id_unique\` ON \`_about_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_version_plans_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_version_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_plans_highlights_order_idx\` ON \`_pricing_page_v_version_plans_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_plans_highlights_parent_id_idx\` ON \`_pricing_page_v_version_plans_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_plans_highlights_locale_idx\` ON \`_pricing_page_v_version_plans_highlights\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_version_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_plans_order_idx\` ON \`_pricing_page_v_version_plans\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_plans_parent_id_idx\` ON \`_pricing_page_v_version_plans\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_plans_locale_idx\` ON \`_pricing_page_v_version_plans\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v\` (
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
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_version__status_idx\` ON \`_pricing_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_created_at_idx\` ON \`_pricing_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_updated_at_idx\` ON \`_pricing_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_snapshot_idx\` ON \`_pricing_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_published_locale_idx\` ON \`_pricing_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_latest_idx\` ON \`_pricing_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_autosave_idx\` ON \`_pricing_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_locales\` (
  	\`version_intro\` text,
  	\`version_note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pricing_page_v_locales_locale_parent_id_unique\` ON \`_pricing_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_legal_pages_v\` (
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
  await db.run(sql`CREATE INDEX \`_legal_pages_v_version_version__status_idx\` ON \`_legal_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_legal_pages_v_created_at_idx\` ON \`_legal_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_legal_pages_v_updated_at_idx\` ON \`_legal_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_legal_pages_v_snapshot_idx\` ON \`_legal_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_legal_pages_v_published_locale_idx\` ON \`_legal_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_legal_pages_v_latest_idx\` ON \`_legal_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_legal_pages_v_autosave_idx\` ON \`_legal_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_legal_pages_v_locales\` (
  	\`version_privacy_policy_markdown\` text,
  	\`version_terms_of_service_markdown\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_legal_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_legal_pages_v_locales_locale_parent_id_unique\` ON \`_legal_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_tags\`("_order", "_parent_id", "_locale", "id", "tag") SELECT "_order", "_parent_id", "_locale", "id", "tag" FROM \`blog_posts_tags\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_tags\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_tags\` RENAME TO \`blog_posts_tags\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_order_idx\` ON \`blog_posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_parent_id_idx\` ON \`blog_posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_locale_idx\` ON \`blog_posts_tags\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_content_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_content_sections_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_content_sections_paragraphs\` RENAME TO \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_order_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_parent_id_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_locale_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_content_sections_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_content_sections_bullets\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_content_sections_bullets\` RENAME TO \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_order_idx\` ON \`blog_posts_content_sections_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_parent_id_idx\` ON \`blog_posts_content_sections_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_locale_idx\` ON \`blog_posts_content_sections_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_content_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_content_sections\`("_order", "_parent_id", "_locale", "id", "title") SELECT "_order", "_parent_id", "_locale", "id", "title" FROM \`blog_posts_content_sections\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_content_sections\` RENAME TO \`blog_posts_content_sections\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_order_idx\` ON \`blog_posts_content_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_parent_id_idx\` ON \`blog_posts_content_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_locale_idx\` ON \`blog_posts_content_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`published_at\` text,
  	\`status\` text DEFAULT 'draft',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts\`("id", "slug", "published_at", "status", "updated_at", "created_at", "_status") SELECT "id", "slug", "published_at", "status", "updated_at", "created_at", "_status" FROM \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts\` RENAME TO \`blog_posts\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_slug_idx\` ON \`blog_posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts__status_idx\` ON \`blog_posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_locales\` (
  	\`title\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`excerpt\` text,
  	\`og_image_id\` integer,
  	\`author\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_locales\`("title", "meta_title", "meta_description", "excerpt", "og_image_id", "author", "meta_image_id", "id", "_locale", "_parent_id") SELECT "title", "meta_title", "meta_description", "excerpt", "og_image_id", "author", "meta_image_id", "id", "_locale", "_parent_id" FROM \`blog_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_locales\` RENAME TO \`blog_posts_locales\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_og_image_idx\` ON \`blog_posts_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_meta_meta_image_idx\` ON \`blog_posts_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_locales_locale_parent_id_unique\` ON \`blog_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_summary_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_summary_bullets\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`feature_pages_summary_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_summary_bullets\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_summary_bullets\` RENAME TO \`feature_pages_summary_bullets\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_order_idx\` ON \`feature_pages_summary_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_parent_id_idx\` ON \`feature_pages_summary_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_locale_idx\` ON \`feature_pages_summary_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body_paragraphs\` RENAME TO \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_order_idx\` ON \`feature_pages_body_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_parent_id_idx\` ON \`feature_pages_body_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_locale_idx\` ON \`feature_pages_body_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body_cards\`("_order", "_parent_id", "_locale", "id", "title", "body") SELECT "_order", "_parent_id", "_locale", "id", "title", "body" FROM \`feature_pages_body_cards\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_cards\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body_cards\` RENAME TO \`feature_pages_body_cards\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_order_idx\` ON \`feature_pages_body_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_parent_id_idx\` ON \`feature_pages_body_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_locale_idx\` ON \`feature_pages_body_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body_bullets\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`feature_pages_body_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_bullets\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body_bullets\` RENAME TO \`feature_pages_body_bullets\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_order_idx\` ON \`feature_pages_body_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_parent_id_idx\` ON \`feature_pages_body_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_locale_idx\` ON \`feature_pages_body_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body\`("_order", "_parent_id", "_locale", "id", "label", "title") SELECT "_order", "_parent_id", "_locale", "id", "label", "title" FROM \`feature_pages_body\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body\` RENAME TO \`feature_pages_body\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_order_idx\` ON \`feature_pages_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_parent_id_idx\` ON \`feature_pages_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_locale_idx\` ON \`feature_pages_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages\`("id", "slug", "updated_at", "created_at", "_status") SELECT "id", "slug", "updated_at", "created_at", "_status" FROM \`feature_pages\`;`)
  await db.run(sql`DROP TABLE \`feature_pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages\` RENAME TO \`feature_pages\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_slug_idx\` ON \`feature_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_updated_at_idx\` ON \`feature_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_created_at_idx\` ON \`feature_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages__status_idx\` ON \`feature_pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`hero_label\` text,
  	\`hero_title\` text,
  	\`hero_emphasis\` text,
  	\`hero_lead\` text,
  	\`cta_title\` text,
  	\`cta_description\` text,
  	\`og_image_id\` integer,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_locales\`("meta_title", "meta_description", "hero_label", "hero_title", "hero_emphasis", "hero_lead", "cta_title", "cta_description", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "hero_label", "hero_title", "hero_emphasis", "hero_lead", "cta_title", "cta_description", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id" FROM \`feature_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_locales\` RENAME TO \`feature_pages_locales\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_og_image_idx\` ON \`feature_pages_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_meta_meta_image_idx\` ON \`feature_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_locales_locale_parent_id_unique\` ON \`feature_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_pain_points\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_pain_points\`("_order", "_parent_id", "_locale", "id", "title", "description") SELECT "_order", "_parent_id", "_locale", "id", "title", "description" FROM \`use_case_pages_pain_points\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_pain_points\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_pain_points\` RENAME TO \`use_case_pages_pain_points\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_order_idx\` ON \`use_case_pages_pain_points\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_parent_id_idx\` ON \`use_case_pages_pain_points\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_locale_idx\` ON \`use_case_pages_pain_points\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_solution_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_solution_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_solution_sections_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_solution_sections_paragraphs\` RENAME TO \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_order_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_parent_id_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_locale_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_solution_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_solution_sections\`("_order", "_parent_id", "_locale", "id", "label", "title") SELECT "_order", "_parent_id", "_locale", "id", "label", "title" FROM \`use_case_pages_solution_sections\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_solution_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_solution_sections\` RENAME TO \`use_case_pages_solution_sections\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_order_idx\` ON \`use_case_pages_solution_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_parent_id_idx\` ON \`use_case_pages_solution_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_locale_idx\` ON \`use_case_pages_solution_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages\`("id", "slug", "updated_at", "created_at", "_status") SELECT "id", "slug", "updated_at", "created_at", "_status" FROM \`use_case_pages\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages\` RENAME TO \`use_case_pages\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_slug_idx\` ON \`use_case_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_updated_at_idx\` ON \`use_case_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_created_at_idx\` ON \`use_case_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages__status_idx\` ON \`use_case_pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`role_label\` text,
  	\`hero_title\` text,
  	\`hero_lead\` text,
  	\`og_image_id\` integer,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_locales\`("meta_title", "meta_description", "role_label", "hero_title", "hero_lead", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "role_label", "hero_title", "hero_lead", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id" FROM \`use_case_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_locales\` RENAME TO \`use_case_pages_locales\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_og_image_idx\` ON \`use_case_pages_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_meta_meta_image_idx\` ON \`use_case_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_locales_locale_parent_id_unique\` ON \`use_case_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_nav_links_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_nav_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_nav_links_children\`("_order", "_parent_id", "_locale", "id", "label", "href") SELECT "_order", "_parent_id", "_locale", "id", "label", "href" FROM \`site_settings_nav_links_children\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links_children\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_nav_links_children\` RENAME TO \`site_settings_nav_links_children\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_order_idx\` ON \`site_settings_nav_links_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_parent_id_idx\` ON \`site_settings_nav_links_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_locale_idx\` ON \`site_settings_nav_links_children\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_nav_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_nav_links\`("_order", "_parent_id", "_locale", "id", "label", "href") SELECT "_order", "_parent_id", "_locale", "id", "label", "href" FROM \`site_settings_nav_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_nav_links\` RENAME TO \`site_settings_nav_links\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_order_idx\` ON \`site_settings_nav_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_parent_id_idx\` ON \`site_settings_nav_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_locale_idx\` ON \`site_settings_nav_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_footer_columns_links\`("_order", "_parent_id", "_locale", "id", "label", "href") SELECT "_order", "_parent_id", "_locale", "id", "label", "href" FROM \`site_settings_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns_links\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_footer_columns_links\` RENAME TO \`site_settings_footer_columns_links\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_order_idx\` ON \`site_settings_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_parent_id_idx\` ON \`site_settings_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_locale_idx\` ON \`site_settings_footer_columns_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_footer_columns\`("_order", "_parent_id", "_locale", "id", "title") SELECT "_order", "_parent_id", "_locale", "id", "title" FROM \`site_settings_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_footer_columns\` RENAME TO \`site_settings_footer_columns\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_order_idx\` ON \`site_settings_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_parent_id_idx\` ON \`site_settings_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_locale_idx\` ON \`site_settings_footer_columns\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_home_problems_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_home_problems\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_home_problems_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_home_problems_paragraphs\` RENAME TO \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_order_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_parent_id_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_locale_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_home_problems\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_home_problems\`("_order", "_parent_id", "_locale", "id", "title") SELECT "_order", "_parent_id", "_locale", "id", "title" FROM \`site_settings_home_problems\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_problems\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_home_problems\` RENAME TO \`site_settings_home_problems\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_order_idx\` ON \`site_settings_home_problems\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_parent_id_idx\` ON \`site_settings_home_problems\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_locale_idx\` ON \`site_settings_home_problems\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_home_how_it_works\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_home_how_it_works\`("_order", "_parent_id", "_locale", "id", "title", "body") SELECT "_order", "_parent_id", "_locale", "id", "title", "body" FROM \`site_settings_home_how_it_works\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_how_it_works\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_home_how_it_works\` RENAME TO \`site_settings_home_how_it_works\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_order_idx\` ON \`site_settings_home_how_it_works\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_parent_id_idx\` ON \`site_settings_home_how_it_works\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_locale_idx\` ON \`site_settings_home_how_it_works\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text,
  	\`site_url\` text,
  	\`contact_email\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "site_url", "contact_email", "_status", "updated_at", "created_at") SELECT "id", "site_name", "site_url", "contact_email", "_status", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_mission_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_mission_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`about_page_mission_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_mission_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_mission_paragraphs\` RENAME TO \`about_page_mission_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_order_idx\` ON \`about_page_mission_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_parent_id_idx\` ON \`about_page_mission_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_locale_idx\` ON \`about_page_mission_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_story_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_story_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`about_page_story_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_story_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_story_paragraphs\` RENAME TO \`about_page_story_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_order_idx\` ON \`about_page_story_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_parent_id_idx\` ON \`about_page_story_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_locale_idx\` ON \`about_page_story_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`value\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_stats\`("_order", "_parent_id", "_locale", "id", "label", "value") SELECT "_order", "_parent_id", "_locale", "id", "label", "value" FROM \`about_page_stats\`;`)
  await db.run(sql`DROP TABLE \`about_page_stats\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_stats\` RENAME TO \`about_page_stats\`;`)
  await db.run(sql`CREATE INDEX \`about_page_stats_order_idx\` ON \`about_page_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_stats_parent_id_idx\` ON \`about_page_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_stats_locale_idx\` ON \`about_page_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_recognition\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_recognition\`("_order", "_parent_id", "_locale", "id", "item") SELECT "_order", "_parent_id", "_locale", "id", "item" FROM \`about_page_recognition\`;`)
  await db.run(sql`DROP TABLE \`about_page_recognition\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_recognition\` RENAME TO \`about_page_recognition\`;`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_order_idx\` ON \`about_page_recognition\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_parent_id_idx\` ON \`about_page_recognition\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_locale_idx\` ON \`about_page_recognition\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_pricing_page_plans_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pricing_page_plans_highlights\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`pricing_page_plans_highlights\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_plans_highlights\`;`)
  await db.run(sql`ALTER TABLE \`__new_pricing_page_plans_highlights\` RENAME TO \`pricing_page_plans_highlights\`;`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_order_idx\` ON \`pricing_page_plans_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_parent_id_idx\` ON \`pricing_page_plans_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_locale_idx\` ON \`pricing_page_plans_highlights\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_pricing_page_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pricing_page_plans\`("_order", "_parent_id", "_locale", "id", "title", "description") SELECT "_order", "_parent_id", "_locale", "id", "title", "description" FROM \`pricing_page_plans\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_plans\`;`)
  await db.run(sql`ALTER TABLE \`__new_pricing_page_plans\` RENAME TO \`pricing_page_plans\`;`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_order_idx\` ON \`pricing_page_plans\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_parent_id_idx\` ON \`pricing_page_plans\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_locale_idx\` ON \`pricing_page_plans\` (\`_locale\`);`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`CREATE INDEX \`about_page__status_idx\` ON \`about_page\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`pricing_page\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`CREATE INDEX \`pricing_page__status_idx\` ON \`pricing_page\` (\`_status\`);`)
  await db.run(sql`ALTER TABLE \`legal_pages\` ADD \`_status\` text DEFAULT 'draft';`)
  await db.run(sql`CREATE INDEX \`legal_pages__status_idx\` ON \`legal_pages\` (\`_status\`);`)

  // 旧博客已经通过手写 status 控制公开性，这里沿用既有语义完成首次回填。
  await db.run(sql.raw(`
    UPDATE blog_posts
    SET _status = CASE
      WHEN status = 'published' THEN 'published'
      ELSE 'draft'
    END;
  `))

  // 其余页面和全局配置在旧系统中都是改完即生效，因此存量数据应视为已发布。
  await markTableAsPublished(db, 'feature_pages')
  await markTableAsPublished(db, 'use_case_pages')
  await markTableAsPublished(db, 'site_settings')
  await markTableAsPublished(db, 'about_page')
  await markTableAsPublished(db, 'pricing_page')
  await markTableAsPublished(db, 'legal_pages')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_content_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_content_sections_bullets\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_content_sections\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_version_summary_bullets\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_version_body_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_version_body_cards\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_version_body_bullets\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_version_body\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_version_pain_points\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_version_solution_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_version_solution_sections\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_nav_links_children\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_nav_links\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_home_problems_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_home_problems\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_home_how_it_works\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_mission_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_story_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_stats\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_recognition\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_version_plans_highlights\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_version_plans\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_legal_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_legal_pages_v_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`published_at\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts\`("id", "slug", "published_at", "status", "updated_at", "created_at") SELECT "id", "slug", "published_at", "status", "updated_at", "created_at" FROM \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts\` RENAME TO \`blog_posts\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_slug_idx\` ON \`blog_posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages\`("id", "slug", "updated_at", "created_at") SELECT "id", "slug", "updated_at", "created_at" FROM \`feature_pages\`;`)
  await db.run(sql`DROP TABLE \`feature_pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages\` RENAME TO \`feature_pages\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_slug_idx\` ON \`feature_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_updated_at_idx\` ON \`feature_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_created_at_idx\` ON \`feature_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages\`("id", "slug", "updated_at", "created_at") SELECT "id", "slug", "updated_at", "created_at" FROM \`use_case_pages\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages\` RENAME TO \`use_case_pages\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_slug_idx\` ON \`use_case_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_updated_at_idx\` ON \`use_case_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_created_at_idx\` ON \`use_case_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text NOT NULL,
  	\`site_url\` text NOT NULL,
  	\`contact_email\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "site_url", "contact_email", "updated_at", "created_at") SELECT "id", "site_name", "site_url", "contact_email", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`DROP INDEX \`about_page__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX \`pricing_page__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`pricing_page\` DROP COLUMN \`_status\`;`)
  await db.run(sql`DROP INDEX \`legal_pages__status_idx\`;`)
  await db.run(sql`ALTER TABLE \`legal_pages\` DROP COLUMN \`_status\`;`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_tags\`("_order", "_parent_id", "_locale", "id", "tag") SELECT "_order", "_parent_id", "_locale", "id", "tag" FROM \`blog_posts_tags\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_tags\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_tags\` RENAME TO \`blog_posts_tags\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_order_idx\` ON \`blog_posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_parent_id_idx\` ON \`blog_posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_locale_idx\` ON \`blog_posts_tags\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_content_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_content_sections_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_content_sections_paragraphs\` RENAME TO \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_order_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_parent_id_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_locale_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_content_sections_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_content_sections_bullets\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_content_sections_bullets\` RENAME TO \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_order_idx\` ON \`blog_posts_content_sections_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_parent_id_idx\` ON \`blog_posts_content_sections_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_locale_idx\` ON \`blog_posts_content_sections_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_content_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_content_sections\`("_order", "_parent_id", "_locale", "id", "title") SELECT "_order", "_parent_id", "_locale", "id", "title" FROM \`blog_posts_content_sections\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_content_sections\` RENAME TO \`blog_posts_content_sections\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_order_idx\` ON \`blog_posts_content_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_parent_id_idx\` ON \`blog_posts_content_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_locale_idx\` ON \`blog_posts_content_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_locales\` (
  	\`title\` text NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`excerpt\` text,
  	\`og_image_id\` integer,
  	\`author\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blog_posts_locales\`("title", "meta_title", "meta_description", "excerpt", "og_image_id", "author", "meta_image_id", "id", "_locale", "_parent_id") SELECT "title", "meta_title", "meta_description", "excerpt", "og_image_id", "author", "meta_image_id", "id", "_locale", "_parent_id" FROM \`blog_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_locales\` RENAME TO \`blog_posts_locales\`;`)
  await db.run(sql`CREATE INDEX \`blog_posts_og_image_idx\` ON \`blog_posts_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_meta_meta_image_idx\` ON \`blog_posts_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_locales_locale_parent_id_unique\` ON \`blog_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_summary_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_summary_bullets\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`feature_pages_summary_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_summary_bullets\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_summary_bullets\` RENAME TO \`feature_pages_summary_bullets\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_order_idx\` ON \`feature_pages_summary_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_parent_id_idx\` ON \`feature_pages_summary_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_locale_idx\` ON \`feature_pages_summary_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body_paragraphs\` RENAME TO \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_order_idx\` ON \`feature_pages_body_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_parent_id_idx\` ON \`feature_pages_body_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_locale_idx\` ON \`feature_pages_body_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body_cards\`("_order", "_parent_id", "_locale", "id", "title", "body") SELECT "_order", "_parent_id", "_locale", "id", "title", "body" FROM \`feature_pages_body_cards\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_cards\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body_cards\` RENAME TO \`feature_pages_body_cards\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_order_idx\` ON \`feature_pages_body_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_parent_id_idx\` ON \`feature_pages_body_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_locale_idx\` ON \`feature_pages_body_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body_bullets\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`feature_pages_body_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_bullets\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body_bullets\` RENAME TO \`feature_pages_body_bullets\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_order_idx\` ON \`feature_pages_body_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_parent_id_idx\` ON \`feature_pages_body_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_locale_idx\` ON \`feature_pages_body_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_body\`("_order", "_parent_id", "_locale", "id", "label", "title") SELECT "_order", "_parent_id", "_locale", "id", "label", "title" FROM \`feature_pages_body\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_body\` RENAME TO \`feature_pages_body\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_order_idx\` ON \`feature_pages_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_parent_id_idx\` ON \`feature_pages_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_locale_idx\` ON \`feature_pages_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`hero_label\` text NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_emphasis\` text,
  	\`hero_lead\` text NOT NULL,
  	\`cta_title\` text,
  	\`cta_description\` text,
  	\`og_image_id\` integer,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_feature_pages_locales\`("meta_title", "meta_description", "hero_label", "hero_title", "hero_emphasis", "hero_lead", "cta_title", "cta_description", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "hero_label", "hero_title", "hero_emphasis", "hero_lead", "cta_title", "cta_description", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id" FROM \`feature_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_locales\` RENAME TO \`feature_pages_locales\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_og_image_idx\` ON \`feature_pages_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_meta_meta_image_idx\` ON \`feature_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_locales_locale_parent_id_unique\` ON \`feature_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_pain_points\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_pain_points\`("_order", "_parent_id", "_locale", "id", "title", "description") SELECT "_order", "_parent_id", "_locale", "id", "title", "description" FROM \`use_case_pages_pain_points\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_pain_points\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_pain_points\` RENAME TO \`use_case_pages_pain_points\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_order_idx\` ON \`use_case_pages_pain_points\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_parent_id_idx\` ON \`use_case_pages_pain_points\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_locale_idx\` ON \`use_case_pages_pain_points\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_solution_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_solution_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_solution_sections_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_solution_sections_paragraphs\` RENAME TO \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_order_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_parent_id_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_locale_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_solution_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_solution_sections\`("_order", "_parent_id", "_locale", "id", "label", "title") SELECT "_order", "_parent_id", "_locale", "id", "label", "title" FROM \`use_case_pages_solution_sections\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_solution_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_solution_sections\` RENAME TO \`use_case_pages_solution_sections\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_order_idx\` ON \`use_case_pages_solution_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_parent_id_idx\` ON \`use_case_pages_solution_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_locale_idx\` ON \`use_case_pages_solution_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`role_label\` text NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_lead\` text NOT NULL,
  	\`og_image_id\` integer,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_use_case_pages_locales\`("meta_title", "meta_description", "role_label", "hero_title", "hero_lead", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "role_label", "hero_title", "hero_lead", "og_image_id", "meta_image_id", "id", "_locale", "_parent_id" FROM \`use_case_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_locales\` RENAME TO \`use_case_pages_locales\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_og_image_idx\` ON \`use_case_pages_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_meta_meta_image_idx\` ON \`use_case_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_locales_locale_parent_id_unique\` ON \`use_case_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_nav_links_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_nav_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_nav_links_children\`("_order", "_parent_id", "_locale", "id", "label", "href") SELECT "_order", "_parent_id", "_locale", "id", "label", "href" FROM \`site_settings_nav_links_children\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links_children\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_nav_links_children\` RENAME TO \`site_settings_nav_links_children\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_order_idx\` ON \`site_settings_nav_links_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_parent_id_idx\` ON \`site_settings_nav_links_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_locale_idx\` ON \`site_settings_nav_links_children\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_nav_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_nav_links\`("_order", "_parent_id", "_locale", "id", "label", "href") SELECT "_order", "_parent_id", "_locale", "id", "label", "href" FROM \`site_settings_nav_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_nav_links\` RENAME TO \`site_settings_nav_links\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_order_idx\` ON \`site_settings_nav_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_parent_id_idx\` ON \`site_settings_nav_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_locale_idx\` ON \`site_settings_nav_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_footer_columns_links\`("_order", "_parent_id", "_locale", "id", "label", "href") SELECT "_order", "_parent_id", "_locale", "id", "label", "href" FROM \`site_settings_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns_links\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_footer_columns_links\` RENAME TO \`site_settings_footer_columns_links\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_order_idx\` ON \`site_settings_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_parent_id_idx\` ON \`site_settings_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_locale_idx\` ON \`site_settings_footer_columns_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_footer_columns\`("_order", "_parent_id", "_locale", "id", "title") SELECT "_order", "_parent_id", "_locale", "id", "title" FROM \`site_settings_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_footer_columns\` RENAME TO \`site_settings_footer_columns\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_order_idx\` ON \`site_settings_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_parent_id_idx\` ON \`site_settings_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_locale_idx\` ON \`site_settings_footer_columns\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_home_problems_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_home_problems\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_home_problems_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_home_problems_paragraphs\` RENAME TO \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_order_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_parent_id_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_locale_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_home_problems\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_home_problems\`("_order", "_parent_id", "_locale", "id", "title") SELECT "_order", "_parent_id", "_locale", "id", "title" FROM \`site_settings_home_problems\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_problems\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_home_problems\` RENAME TO \`site_settings_home_problems\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_order_idx\` ON \`site_settings_home_problems\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_parent_id_idx\` ON \`site_settings_home_problems\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_locale_idx\` ON \`site_settings_home_problems\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_home_how_it_works\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings_home_how_it_works\`("_order", "_parent_id", "_locale", "id", "title", "body") SELECT "_order", "_parent_id", "_locale", "id", "title", "body" FROM \`site_settings_home_how_it_works\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_how_it_works\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_home_how_it_works\` RENAME TO \`site_settings_home_how_it_works\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_order_idx\` ON \`site_settings_home_how_it_works\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_parent_id_idx\` ON \`site_settings_home_how_it_works\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_locale_idx\` ON \`site_settings_home_how_it_works\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_mission_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_mission_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`about_page_mission_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_mission_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_mission_paragraphs\` RENAME TO \`about_page_mission_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_order_idx\` ON \`about_page_mission_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_parent_id_idx\` ON \`about_page_mission_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_locale_idx\` ON \`about_page_mission_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_story_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_story_paragraphs\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`about_page_story_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_story_paragraphs\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_story_paragraphs\` RENAME TO \`about_page_story_paragraphs\`;`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_order_idx\` ON \`about_page_story_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_parent_id_idx\` ON \`about_page_story_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_locale_idx\` ON \`about_page_story_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_stats\`("_order", "_parent_id", "_locale", "id", "label", "value") SELECT "_order", "_parent_id", "_locale", "id", "label", "value" FROM \`about_page_stats\`;`)
  await db.run(sql`DROP TABLE \`about_page_stats\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_stats\` RENAME TO \`about_page_stats\`;`)
  await db.run(sql`CREATE INDEX \`about_page_stats_order_idx\` ON \`about_page_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_stats_parent_id_idx\` ON \`about_page_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_stats_locale_idx\` ON \`about_page_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_recognition\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_recognition\`("_order", "_parent_id", "_locale", "id", "item") SELECT "_order", "_parent_id", "_locale", "id", "item" FROM \`about_page_recognition\`;`)
  await db.run(sql`DROP TABLE \`about_page_recognition\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_recognition\` RENAME TO \`about_page_recognition\`;`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_order_idx\` ON \`about_page_recognition\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_parent_id_idx\` ON \`about_page_recognition\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_locale_idx\` ON \`about_page_recognition\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_pricing_page_plans_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pricing_page_plans_highlights\`("_order", "_parent_id", "_locale", "id", "text") SELECT "_order", "_parent_id", "_locale", "id", "text" FROM \`pricing_page_plans_highlights\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_plans_highlights\`;`)
  await db.run(sql`ALTER TABLE \`__new_pricing_page_plans_highlights\` RENAME TO \`pricing_page_plans_highlights\`;`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_order_idx\` ON \`pricing_page_plans_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_parent_id_idx\` ON \`pricing_page_plans_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_locale_idx\` ON \`pricing_page_plans_highlights\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`__new_pricing_page_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pricing_page_plans\`("_order", "_parent_id", "_locale", "id", "title", "description") SELECT "_order", "_parent_id", "_locale", "id", "title", "description" FROM \`pricing_page_plans\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_plans\`;`)
  await db.run(sql`ALTER TABLE \`__new_pricing_page_plans\` RENAME TO \`pricing_page_plans\`;`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_order_idx\` ON \`pricing_page_plans\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_parent_id_idx\` ON \`pricing_page_plans\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_locale_idx\` ON \`pricing_page_plans\` (\`_locale\`);`)
}
