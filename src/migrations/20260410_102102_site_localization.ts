import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`blog_posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_order_idx\` ON \`blog_posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_parent_id_idx\` ON \`blog_posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_locale_idx\` ON \`blog_posts_tags\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_content_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_order_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_parent_id_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_paragraphs_locale_idx\` ON \`blog_posts_content_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_content_sections_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_content_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_order_idx\` ON \`blog_posts_content_sections_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_parent_id_idx\` ON \`blog_posts_content_sections_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_bullets_locale_idx\` ON \`blog_posts_content_sections_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_content_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_order_idx\` ON \`blog_posts_content_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_parent_id_idx\` ON \`blog_posts_content_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_content_sections_locale_idx\` ON \`blog_posts_content_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`og_image_id\` integer,
  	\`published_at\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_slug_idx\` ON \`blog_posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_og_image_idx\` ON \`blog_posts\` (\`og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_locales\` (
  	\`title\` text NOT NULL,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`excerpt\` text,
  	\`author\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_meta_meta_image_idx\` ON \`blog_posts_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_locales_locale_parent_id_unique\` ON \`blog_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_summary_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_order_idx\` ON \`feature_pages_summary_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_parent_id_idx\` ON \`feature_pages_summary_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_summary_bullets_locale_idx\` ON \`feature_pages_summary_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_body_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_order_idx\` ON \`feature_pages_body_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_parent_id_idx\` ON \`feature_pages_body_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_paragraphs_locale_idx\` ON \`feature_pages_body_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_body_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_order_idx\` ON \`feature_pages_body_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_parent_id_idx\` ON \`feature_pages_body_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_cards_locale_idx\` ON \`feature_pages_body_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_body_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_body\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_order_idx\` ON \`feature_pages_body_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_parent_id_idx\` ON \`feature_pages_body_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_bullets_locale_idx\` ON \`feature_pages_body_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_body_order_idx\` ON \`feature_pages_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_parent_id_idx\` ON \`feature_pages_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_body_locale_idx\` ON \`feature_pages_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`og_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_slug_idx\` ON \`feature_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_og_image_idx\` ON \`feature_pages\` (\`og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_updated_at_idx\` ON \`feature_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_created_at_idx\` ON \`feature_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`hero_label\` text NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_emphasis\` text,
  	\`hero_lead\` text NOT NULL,
  	\`cta_title\` text,
  	\`cta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_meta_meta_image_idx\` ON \`feature_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_locales_locale_parent_id_unique\` ON \`feature_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`feature_pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_rels_order_idx\` ON \`feature_pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_rels_parent_idx\` ON \`feature_pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_rels_path_idx\` ON \`feature_pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_rels_feature_pages_id_idx\` ON \`feature_pages_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_pain_points\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_order_idx\` ON \`use_case_pages_pain_points\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_parent_id_idx\` ON \`use_case_pages_pain_points\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_pain_points_locale_idx\` ON \`use_case_pages_pain_points\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_solution_sections_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_solution_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_order_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_parent_id_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_paragraphs_locale_idx\` ON \`use_case_pages_solution_sections_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_solution_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_order_idx\` ON \`use_case_pages_solution_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_parent_id_idx\` ON \`use_case_pages_solution_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_solution_sections_locale_idx\` ON \`use_case_pages_solution_sections\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`og_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_slug_idx\` ON \`use_case_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_og_image_idx\` ON \`use_case_pages\` (\`og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_updated_at_idx\` ON \`use_case_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_created_at_idx\` ON \`use_case_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`role_label\` text NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_lead\` text NOT NULL,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_meta_meta_image_idx\` ON \`use_case_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_locales_locale_parent_id_unique\` ON \`use_case_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`feature_pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_rels_order_idx\` ON \`use_case_pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_rels_parent_idx\` ON \`use_case_pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_rels_path_idx\` ON \`use_case_pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_rels_feature_pages_id_idx\` ON \`use_case_pages_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE TABLE \`faq_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`page\` text DEFAULT 'home' NOT NULL,
  	\`sort_order\` numeric DEFAULT 0,
  	\`is_active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`faq_items_updated_at_idx\` ON \`faq_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`faq_items_created_at_idx\` ON \`faq_items\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`faq_items_locales\` (
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`faq_items_locales_locale_parent_id_unique\` ON \`faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to_type\` text DEFAULT 'reference',
  	\`to_url\` text,
  	\`type\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`blog_posts_id\` integer,
  	\`feature_pages_id\` integer,
  	\`use_case_pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_posts_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`use_case_pages_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`redirects_rels_order_idx\` ON \`redirects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_parent_idx\` ON \`redirects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_path_idx\` ON \`redirects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_blog_posts_id_idx\` ON \`redirects_rels\` (\`blog_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_feature_pages_id_idx\` ON \`redirects_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_use_case_pages_id_idx\` ON \`redirects_rels\` (\`use_case_pages_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_nav_links_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_nav_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_order_idx\` ON \`site_settings_nav_links_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_parent_id_idx\` ON \`site_settings_nav_links_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_children_locale_idx\` ON \`site_settings_nav_links_children\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_nav_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_order_idx\` ON \`site_settings_nav_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_parent_id_idx\` ON \`site_settings_nav_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_links_locale_idx\` ON \`site_settings_nav_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_order_idx\` ON \`site_settings_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_parent_id_idx\` ON \`site_settings_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_links_locale_idx\` ON \`site_settings_footer_columns_links\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_order_idx\` ON \`site_settings_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_parent_id_idx\` ON \`site_settings_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_locale_idx\` ON \`site_settings_footer_columns\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_home_problems_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_home_problems\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_order_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_parent_id_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_paragraphs_locale_idx\` ON \`site_settings_home_problems_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_home_problems\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_order_idx\` ON \`site_settings_home_problems\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_parent_id_idx\` ON \`site_settings_home_problems\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_problems_locale_idx\` ON \`site_settings_home_problems\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_home_how_it_works\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_order_idx\` ON \`site_settings_home_how_it_works\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_parent_id_idx\` ON \`site_settings_home_how_it_works\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_home_how_it_works_locale_idx\` ON \`site_settings_home_how_it_works\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text NOT NULL,
  	\`site_url\` text NOT NULL,
  	\`contact_email\` text,
  	\`default_og_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_default_og_image_idx\` ON \`site_settings\` (\`default_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`default_description\` text,
  	\`nav_cta_text\` text,
  	\`nav_cta_href\` text,
  	\`footer_description\` text,
  	\`footer_copyright\` text,
  	\`home_hero_label\` text,
  	\`home_hero_title\` text,
  	\`home_hero_subtitle\` text,
  	\`home_hero_intro\` text,
  	\`home_hero_roles\` text,
  	\`home_hero_primary_cta_label\` text,
  	\`home_hero_primary_cta_href\` text,
  	\`home_hero_secondary_cta_label\` text,
  	\`home_hero_secondary_cta_href\` text,
  	\`home_feature_intro\` text,
  	\`home_final_cta_title\` text,
  	\`home_final_cta_description\` text,
  	\`home_final_cta_primary_cta_label\` text,
  	\`home_final_cta_primary_cta_href\` text,
  	\`home_final_cta_secondary_cta_label\` text,
  	\`home_final_cta_secondary_cta_href\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_meta_meta_image_idx\` ON \`site_settings_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_mission_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_order_idx\` ON \`about_page_mission_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_parent_id_idx\` ON \`about_page_mission_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_paragraphs_locale_idx\` ON \`about_page_mission_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_story_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_order_idx\` ON \`about_page_story_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_parent_id_idx\` ON \`about_page_story_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_story_paragraphs_locale_idx\` ON \`about_page_story_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_stats_order_idx\` ON \`about_page_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_stats_parent_id_idx\` ON \`about_page_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_stats_locale_idx\` ON \`about_page_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_recognition\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_recognition_order_idx\` ON \`about_page_recognition\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_parent_id_idx\` ON \`about_page_recognition\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_recognition_locale_idx\` ON \`about_page_recognition\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`contact_email\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`about_page_locales\` (
  	\`intro\` text,
  	\`contact_title\` text,
  	\`contact_body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_locales_locale_parent_id_unique\` ON \`about_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_plans_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_order_idx\` ON \`pricing_page_plans_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_parent_id_idx\` ON \`pricing_page_plans_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_highlights_locale_idx\` ON \`pricing_page_plans_highlights\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_order_idx\` ON \`pricing_page_plans\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_parent_id_idx\` ON \`pricing_page_plans\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_plans_locale_idx\` ON \`pricing_page_plans\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`pricing_page_locales\` (
  	\`intro\` text,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pricing_page_locales_locale_parent_id_unique\` ON \`pricing_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`legal_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`legal_pages_locales\` (
  	\`privacy_policy_markdown\` text,
  	\`terms_of_service_markdown\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`legal_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`legal_pages_locales_locale_parent_id_unique\` ON \`legal_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`blog_posts_id\` integer REFERENCES blog_posts(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`feature_pages_id\` integer REFERENCES feature_pages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`use_case_pages_id\` integer REFERENCES use_case_pages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`faq_items_id\` integer REFERENCES faq_items(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`redirects_id\` integer REFERENCES redirects(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_feature_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_use_case_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`use_case_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faq_items_id_idx\` ON \`payload_locked_documents_rels\` (\`faq_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`blog_posts_tags\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_content_sections\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_summary_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_cards\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_body\`;`)
  await db.run(sql`DROP TABLE \`feature_pages\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_rels\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_pain_points\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_solution_sections_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_solution_sections\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_rels\`;`)
  await db.run(sql`DROP TABLE \`faq_items\`;`)
  await db.run(sql`DROP TABLE \`faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`redirects_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links_children\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_problems_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_problems\`;`)
  await db.run(sql`DROP TABLE \`site_settings_home_how_it_works\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_mission_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_story_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_stats\`;`)
  await db.run(sql`DROP TABLE \`about_page_recognition\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`about_page_locales\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_plans_highlights\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_plans\`;`)
  await db.run(sql`DROP TABLE \`pricing_page\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_locales\`;`)
  await db.run(sql`DROP TABLE \`legal_pages\`;`)
  await db.run(sql`DROP TABLE \`legal_pages_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
