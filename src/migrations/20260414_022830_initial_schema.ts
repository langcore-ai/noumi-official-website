import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_roles\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_roles_order_idx\` ON \`users_roles\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_roles_parent_idx\` ON \`users_roles\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_order_idx\` ON \`blog_posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_parent_id_idx\` ON \`blog_posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_locale_idx\` ON \`blog_posts_tags\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_paragraphs_order_idx\` ON \`blog_posts_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`blog_posts_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_paragraphs_locale_idx\` ON \`blog_posts_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_bullets_order_idx\` ON \`blog_posts_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_bullets_parent_id_idx\` ON \`blog_posts_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_bullets_locale_idx\` ON \`blog_posts_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_order_idx\` ON \`blog_posts_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_parent_id_idx\` ON \`blog_posts_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_path_idx\` ON \`blog_posts_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_rich_text_section_locale_idx\` ON \`blog_posts_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_paragraphs_order_idx\` ON \`blog_posts_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`blog_posts_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_paragraphs_locale_idx\` ON \`blog_posts_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_bullets_order_idx\` ON \`blog_posts_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_bullets_parent_id_idx\` ON \`blog_posts_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_bullets_locale_idx\` ON \`blog_posts_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`blog_posts_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`blog_posts_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`blog_posts_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_bullets_order_idx\` ON \`blog_posts_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`blog_posts_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`blog_posts_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_order_idx\` ON \`blog_posts_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_parent_id_idx\` ON \`blog_posts_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_cards_locale_idx\` ON \`blog_posts_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_order_idx\` ON \`blog_posts_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_parent_id_idx\` ON \`blog_posts_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_path_idx\` ON \`blog_posts_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_card_grid_section_locale_idx\` ON \`blog_posts_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_items_order_idx\` ON \`blog_posts_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_items_parent_id_idx\` ON \`blog_posts_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_items_locale_idx\` ON \`blog_posts_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_order_idx\` ON \`blog_posts_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_parent_id_idx\` ON \`blog_posts_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_path_idx\` ON \`blog_posts_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_bullet_list_section_locale_idx\` ON \`blog_posts_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_cta_section_order_idx\` ON \`blog_posts_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_cta_section_parent_id_idx\` ON \`blog_posts_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_cta_section_path_idx\` ON \`blog_posts_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_cta_section_locale_idx\` ON \`blog_posts_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_markdown_document_order_idx\` ON \`blog_posts_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_markdown_document_parent_id_idx\` ON \`blog_posts_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_markdown_document_path_idx\` ON \`blog_posts_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_markdown_document_locale_idx\` ON \`blog_posts_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`published_at\` text,
  	\`status\` text DEFAULT 'draft',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_slug_idx\` ON \`blog_posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts__status_idx\` ON \`blog_posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_locales\` (
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
  await db.run(sql`CREATE INDEX \`blog_posts_og_image_idx\` ON \`blog_posts_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_meta_meta_image_idx\` ON \`blog_posts_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_locales_locale_parent_id_unique\` ON \`blog_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
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
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_blog_posts_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_blog_posts_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_blog_posts_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_bullets_order_idx\` ON \`_blog_posts_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_blog_posts_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_blog_posts_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_order_idx\` ON \`_blog_posts_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_parent_id_idx\` ON \`_blog_posts_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_path_idx\` ON \`_blog_posts_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_rich_text_section_locale_idx\` ON \`_blog_posts_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_blog_posts_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_blog_posts_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_blog_posts_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_bullets_order_idx\` ON \`_blog_posts_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_blog_posts_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_blog_posts_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_order_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_cards_locale_idx\` ON \`_blog_posts_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_order_idx\` ON \`_blog_posts_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_parent_id_idx\` ON \`_blog_posts_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_path_idx\` ON \`_blog_posts_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_card_grid_section_locale_idx\` ON \`_blog_posts_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_items_order_idx\` ON \`_blog_posts_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_blog_posts_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_items_locale_idx\` ON \`_blog_posts_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_order_idx\` ON \`_blog_posts_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_parent_id_idx\` ON \`_blog_posts_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_path_idx\` ON \`_blog_posts_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_bullet_list_section_locale_idx\` ON \`_blog_posts_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_cta_section_order_idx\` ON \`_blog_posts_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_cta_section_parent_id_idx\` ON \`_blog_posts_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_cta_section_path_idx\` ON \`_blog_posts_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_cta_section_locale_idx\` ON \`_blog_posts_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_markdown_document_order_idx\` ON \`_blog_posts_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_markdown_document_parent_id_idx\` ON \`_blog_posts_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_markdown_document_path_idx\` ON \`_blog_posts_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_markdown_document_locale_idx\` ON \`_blog_posts_v_blocks_markdown_document\` (\`_locale\`);`)
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
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_paragraphs_order_idx\` ON \`feature_pages_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`feature_pages_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_paragraphs_locale_idx\` ON \`feature_pages_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_bullets_order_idx\` ON \`feature_pages_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_bullets_parent_id_idx\` ON \`feature_pages_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_bullets_locale_idx\` ON \`feature_pages_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_order_idx\` ON \`feature_pages_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_parent_id_idx\` ON \`feature_pages_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_path_idx\` ON \`feature_pages_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_rich_text_section_locale_idx\` ON \`feature_pages_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_paragraphs_order_idx\` ON \`feature_pages_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`feature_pages_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_paragraphs_locale_idx\` ON \`feature_pages_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_bullets_order_idx\` ON \`feature_pages_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_bullets_parent_id_idx\` ON \`feature_pages_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_bullets_locale_idx\` ON \`feature_pages_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`feature_pages_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`feature_pages_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`feature_pages_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_bullets_order_idx\` ON \`feature_pages_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`feature_pages_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`feature_pages_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_order_idx\` ON \`feature_pages_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_parent_id_idx\` ON \`feature_pages_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_cards_locale_idx\` ON \`feature_pages_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_order_idx\` ON \`feature_pages_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_parent_id_idx\` ON \`feature_pages_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_path_idx\` ON \`feature_pages_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_card_grid_section_locale_idx\` ON \`feature_pages_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_items_order_idx\` ON \`feature_pages_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_items_parent_id_idx\` ON \`feature_pages_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_items_locale_idx\` ON \`feature_pages_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_order_idx\` ON \`feature_pages_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_parent_id_idx\` ON \`feature_pages_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_path_idx\` ON \`feature_pages_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_bullet_list_section_locale_idx\` ON \`feature_pages_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_cta_section_order_idx\` ON \`feature_pages_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_cta_section_parent_id_idx\` ON \`feature_pages_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_cta_section_path_idx\` ON \`feature_pages_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_cta_section_locale_idx\` ON \`feature_pages_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_markdown_document_order_idx\` ON \`feature_pages_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_markdown_document_parent_id_idx\` ON \`feature_pages_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_markdown_document_path_idx\` ON \`feature_pages_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_markdown_document_locale_idx\` ON \`feature_pages_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_slug_idx\` ON \`feature_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_updated_at_idx\` ON \`feature_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_created_at_idx\` ON \`feature_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages__status_idx\` ON \`feature_pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
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
  await db.run(sql`CREATE INDEX \`feature_pages_og_image_idx\` ON \`feature_pages_locales\` (\`og_image_id\`,\`_locale\`);`)
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
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_feature_pages_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_feature_pages_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_feature_pages_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_bullets_order_idx\` ON \`_feature_pages_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_feature_pages_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_feature_pages_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_order_idx\` ON \`_feature_pages_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_parent_id_idx\` ON \`_feature_pages_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_path_idx\` ON \`_feature_pages_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_rich_text_section_locale_idx\` ON \`_feature_pages_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_feature_pages_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_feature_pages_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_feature_pages_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_bullets_order_idx\` ON \`_feature_pages_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_feature_pages_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_feature_pages_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_order_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_cards_locale_idx\` ON \`_feature_pages_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_order_idx\` ON \`_feature_pages_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_parent_id_idx\` ON \`_feature_pages_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_path_idx\` ON \`_feature_pages_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_card_grid_section_locale_idx\` ON \`_feature_pages_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_items_order_idx\` ON \`_feature_pages_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_feature_pages_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_items_locale_idx\` ON \`_feature_pages_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_order_idx\` ON \`_feature_pages_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_parent_id_idx\` ON \`_feature_pages_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_path_idx\` ON \`_feature_pages_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_bullet_list_section_locale_idx\` ON \`_feature_pages_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_cta_section_order_idx\` ON \`_feature_pages_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_cta_section_parent_id_idx\` ON \`_feature_pages_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_cta_section_path_idx\` ON \`_feature_pages_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_cta_section_locale_idx\` ON \`_feature_pages_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_markdown_document_order_idx\` ON \`_feature_pages_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_markdown_document_parent_id_idx\` ON \`_feature_pages_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_markdown_document_path_idx\` ON \`_feature_pages_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_markdown_document_locale_idx\` ON \`_feature_pages_v_blocks_markdown_document\` (\`_locale\`);`)
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
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
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
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_paragraphs_order_idx\` ON \`use_case_pages_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`use_case_pages_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_paragraphs_locale_idx\` ON \`use_case_pages_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_bullets_order_idx\` ON \`use_case_pages_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_bullets_parent_id_idx\` ON \`use_case_pages_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_bullets_locale_idx\` ON \`use_case_pages_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_order_idx\` ON \`use_case_pages_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_parent_id_idx\` ON \`use_case_pages_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_path_idx\` ON \`use_case_pages_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_rich_text_section_locale_idx\` ON \`use_case_pages_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_paragraphs_order_idx\` ON \`use_case_pages_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`use_case_pages_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_paragraphs_locale_idx\` ON \`use_case_pages_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_bullets_order_idx\` ON \`use_case_pages_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_bullets_parent_id_idx\` ON \`use_case_pages_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_bullets_locale_idx\` ON \`use_case_pages_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`use_case_pages_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`use_case_pages_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`use_case_pages_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_bullets_order_idx\` ON \`use_case_pages_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`use_case_pages_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`use_case_pages_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_order_idx\` ON \`use_case_pages_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_parent_id_idx\` ON \`use_case_pages_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_cards_locale_idx\` ON \`use_case_pages_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_order_idx\` ON \`use_case_pages_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_parent_id_idx\` ON \`use_case_pages_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_path_idx\` ON \`use_case_pages_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_card_grid_section_locale_idx\` ON \`use_case_pages_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_items_order_idx\` ON \`use_case_pages_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_items_parent_id_idx\` ON \`use_case_pages_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_items_locale_idx\` ON \`use_case_pages_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_order_idx\` ON \`use_case_pages_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_parent_id_idx\` ON \`use_case_pages_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_path_idx\` ON \`use_case_pages_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_bullet_list_section_locale_idx\` ON \`use_case_pages_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_cta_section_order_idx\` ON \`use_case_pages_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_cta_section_parent_id_idx\` ON \`use_case_pages_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_cta_section_path_idx\` ON \`use_case_pages_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_cta_section_locale_idx\` ON \`use_case_pages_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_markdown_document_order_idx\` ON \`use_case_pages_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_markdown_document_parent_id_idx\` ON \`use_case_pages_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_markdown_document_path_idx\` ON \`use_case_pages_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_markdown_document_locale_idx\` ON \`use_case_pages_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_slug_idx\` ON \`use_case_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_updated_at_idx\` ON \`use_case_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_created_at_idx\` ON \`use_case_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages__status_idx\` ON \`use_case_pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
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
  await db.run(sql`CREATE INDEX \`use_case_pages_og_image_idx\` ON \`use_case_pages_locales\` (\`og_image_id\`,\`_locale\`);`)
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
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_use_case_pages_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_use_case_pages_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_use_case_pages_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_bullets_order_idx\` ON \`_use_case_pages_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_use_case_pages_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_use_case_pages_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_order_idx\` ON \`_use_case_pages_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_parent_id_idx\` ON \`_use_case_pages_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_path_idx\` ON \`_use_case_pages_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_rich_text_section_locale_idx\` ON \`_use_case_pages_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_bullets_order_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_order_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_cards_locale_idx\` ON \`_use_case_pages_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_order_idx\` ON \`_use_case_pages_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_parent_id_idx\` ON \`_use_case_pages_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_path_idx\` ON \`_use_case_pages_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_card_grid_section_locale_idx\` ON \`_use_case_pages_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_items_order_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_items_locale_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_order_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_parent_id_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_path_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_bullet_list_section_locale_idx\` ON \`_use_case_pages_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_cta_section_order_idx\` ON \`_use_case_pages_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_cta_section_parent_id_idx\` ON \`_use_case_pages_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_cta_section_path_idx\` ON \`_use_case_pages_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_cta_section_locale_idx\` ON \`_use_case_pages_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_markdown_document_order_idx\` ON \`_use_case_pages_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_markdown_document_parent_id_idx\` ON \`_use_case_pages_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_markdown_document_path_idx\` ON \`_use_case_pages_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_markdown_document_locale_idx\` ON \`_use_case_pages_v_blocks_markdown_document\` (\`_locale\`);`)
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
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
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
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`blog_posts_id\` integer,
  	\`feature_pages_id\` integer,
  	\`use_case_pages_id\` integer,
  	\`faq_items_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_posts_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feature_pages_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`use_case_pages_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faq_items_id\`) REFERENCES \`faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_feature_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`feature_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_use_case_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`use_case_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faq_items_id_idx\` ON \`payload_locked_documents_rels\` (\`faq_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_nav_links_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
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
  	\`label\` text,
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
  	\`label\` text,
  	\`href\` text,
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
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_order_idx\` ON \`site_settings_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_parent_id_idx\` ON \`site_settings_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_columns_locale_idx\` ON \`site_settings_footer_columns\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text,
  	\`site_url\` text,
  	\`contact_email\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`default_description\` text,
  	\`nav_cta_text\` text,
  	\`nav_cta_href\` text,
  	\`footer_description\` text,
  	\`footer_copyright\` text,
  	\`default_og_image_id\` integer,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_default_og_image_idx\` ON \`site_settings_locales\` (\`default_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_meta_meta_image_idx\` ON \`site_settings_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
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
  await db.run(sql`CREATE TABLE \`home_page_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_paragraphs_order_idx\` ON \`home_page_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`home_page_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_paragraphs_locale_idx\` ON \`home_page_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_bullets_order_idx\` ON \`home_page_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_bullets_parent_id_idx\` ON \`home_page_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_bullets_locale_idx\` ON \`home_page_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_order_idx\` ON \`home_page_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_parent_id_idx\` ON \`home_page_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_path_idx\` ON \`home_page_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_rich_text_section_locale_idx\` ON \`home_page_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_paragraphs_order_idx\` ON \`home_page_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`home_page_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_paragraphs_locale_idx\` ON \`home_page_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_bullets_order_idx\` ON \`home_page_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_bullets_parent_id_idx\` ON \`home_page_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_bullets_locale_idx\` ON \`home_page_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`home_page_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`home_page_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`home_page_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_bullets_order_idx\` ON \`home_page_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`home_page_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`home_page_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_order_idx\` ON \`home_page_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_parent_id_idx\` ON \`home_page_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_cards_locale_idx\` ON \`home_page_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_order_idx\` ON \`home_page_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_parent_id_idx\` ON \`home_page_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_path_idx\` ON \`home_page_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_card_grid_section_locale_idx\` ON \`home_page_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_items_order_idx\` ON \`home_page_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_items_parent_id_idx\` ON \`home_page_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_items_locale_idx\` ON \`home_page_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_order_idx\` ON \`home_page_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_parent_id_idx\` ON \`home_page_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_path_idx\` ON \`home_page_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_bullet_list_section_locale_idx\` ON \`home_page_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_section_order_idx\` ON \`home_page_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_section_parent_id_idx\` ON \`home_page_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_section_path_idx\` ON \`home_page_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_cta_section_locale_idx\` ON \`home_page_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_markdown_document_order_idx\` ON \`home_page_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_markdown_document_parent_id_idx\` ON \`home_page_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_markdown_document_path_idx\` ON \`home_page_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_markdown_document_locale_idx\` ON \`home_page_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`home_page_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`og_image_id\` integer,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_og_image_idx\` ON \`home_page_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_locales_locale_parent_id_unique\` ON \`home_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_home_page_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_home_page_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_home_page_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_bullets_order_idx\` ON \`_home_page_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_home_page_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_home_page_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_order_idx\` ON \`_home_page_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_parent_id_idx\` ON \`_home_page_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_path_idx\` ON \`_home_page_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_rich_text_section_locale_idx\` ON \`_home_page_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_home_page_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_home_page_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_home_page_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_bullets_order_idx\` ON \`_home_page_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_home_page_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_home_page_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_home_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_home_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_home_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_home_page_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_home_page_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_home_page_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_order_idx\` ON \`_home_page_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_home_page_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_cards_locale_idx\` ON \`_home_page_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_order_idx\` ON \`_home_page_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_parent_id_idx\` ON \`_home_page_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_path_idx\` ON \`_home_page_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_card_grid_section_locale_idx\` ON \`_home_page_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_items_order_idx\` ON \`_home_page_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_home_page_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_items_locale_idx\` ON \`_home_page_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_order_idx\` ON \`_home_page_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_parent_id_idx\` ON \`_home_page_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_path_idx\` ON \`_home_page_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_bullet_list_section_locale_idx\` ON \`_home_page_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_cta_section_order_idx\` ON \`_home_page_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_cta_section_parent_id_idx\` ON \`_home_page_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_cta_section_path_idx\` ON \`_home_page_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_cta_section_locale_idx\` ON \`_home_page_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_markdown_document_order_idx\` ON \`_home_page_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_markdown_document_parent_id_idx\` ON \`_home_page_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_markdown_document_path_idx\` ON \`_home_page_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_markdown_document_locale_idx\` ON \`_home_page_v_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v\` (
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
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_snapshot_idx\` ON \`_home_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_published_locale_idx\` ON \`_home_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_autosave_idx\` ON \`_home_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_og_image_id\` integer,
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version_og_image_idx\` ON \`_home_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_home_page_v_locales_locale_parent_id_unique\` ON \`_home_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_paragraphs_order_idx\` ON \`about_page_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`about_page_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_paragraphs_locale_idx\` ON \`about_page_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_bullets_order_idx\` ON \`about_page_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_bullets_parent_id_idx\` ON \`about_page_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_bullets_locale_idx\` ON \`about_page_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_order_idx\` ON \`about_page_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_parent_id_idx\` ON \`about_page_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_path_idx\` ON \`about_page_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_rich_text_section_locale_idx\` ON \`about_page_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_paragraphs_order_idx\` ON \`about_page_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`about_page_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_paragraphs_locale_idx\` ON \`about_page_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_bullets_order_idx\` ON \`about_page_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_bullets_parent_id_idx\` ON \`about_page_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_bullets_locale_idx\` ON \`about_page_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`about_page_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`about_page_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`about_page_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_bullets_order_idx\` ON \`about_page_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`about_page_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`about_page_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_order_idx\` ON \`about_page_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_parent_id_idx\` ON \`about_page_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_cards_locale_idx\` ON \`about_page_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_order_idx\` ON \`about_page_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_parent_id_idx\` ON \`about_page_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_path_idx\` ON \`about_page_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_card_grid_section_locale_idx\` ON \`about_page_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_items_order_idx\` ON \`about_page_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_items_parent_id_idx\` ON \`about_page_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_items_locale_idx\` ON \`about_page_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_order_idx\` ON \`about_page_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_parent_id_idx\` ON \`about_page_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_path_idx\` ON \`about_page_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_bullet_list_section_locale_idx\` ON \`about_page_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_cta_section_order_idx\` ON \`about_page_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_cta_section_parent_id_idx\` ON \`about_page_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_cta_section_path_idx\` ON \`about_page_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_cta_section_locale_idx\` ON \`about_page_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_markdown_document_order_idx\` ON \`about_page_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_markdown_document_parent_id_idx\` ON \`about_page_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_markdown_document_path_idx\` ON \`about_page_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_markdown_document_locale_idx\` ON \`about_page_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page__status_idx\` ON \`about_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`about_page_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`og_image_id\` integer,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_og_image_idx\` ON \`about_page_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`about_page_locales_locale_parent_id_unique\` ON \`about_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_about_page_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_about_page_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_about_page_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_bullets_order_idx\` ON \`_about_page_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_about_page_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_about_page_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_order_idx\` ON \`_about_page_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_parent_id_idx\` ON \`_about_page_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_path_idx\` ON \`_about_page_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_rich_text_section_locale_idx\` ON \`_about_page_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_about_page_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_about_page_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_about_page_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_bullets_order_idx\` ON \`_about_page_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_about_page_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_about_page_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_about_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_about_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_about_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_about_page_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_about_page_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_about_page_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_order_idx\` ON \`_about_page_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_about_page_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_cards_locale_idx\` ON \`_about_page_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_order_idx\` ON \`_about_page_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_parent_id_idx\` ON \`_about_page_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_path_idx\` ON \`_about_page_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_card_grid_section_locale_idx\` ON \`_about_page_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_items_order_idx\` ON \`_about_page_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_about_page_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_items_locale_idx\` ON \`_about_page_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_order_idx\` ON \`_about_page_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_parent_id_idx\` ON \`_about_page_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_path_idx\` ON \`_about_page_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_bullet_list_section_locale_idx\` ON \`_about_page_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_cta_section_order_idx\` ON \`_about_page_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_cta_section_parent_id_idx\` ON \`_about_page_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_cta_section_path_idx\` ON \`_about_page_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_cta_section_locale_idx\` ON \`_about_page_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_markdown_document_order_idx\` ON \`_about_page_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_markdown_document_parent_id_idx\` ON \`_about_page_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_markdown_document_path_idx\` ON \`_about_page_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_markdown_document_locale_idx\` ON \`_about_page_v_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v\` (
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
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version__status_idx\` ON \`_about_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_created_at_idx\` ON \`_about_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_updated_at_idx\` ON \`_about_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_snapshot_idx\` ON \`_about_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_published_locale_idx\` ON \`_about_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_latest_idx\` ON \`_about_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_autosave_idx\` ON \`_about_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_og_image_id\` integer,
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version_og_image_idx\` ON \`_about_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_about_page_v_locales_locale_parent_id_unique\` ON \`_about_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_paragraphs_order_idx\` ON \`pricing_page_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`pricing_page_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_paragraphs_locale_idx\` ON \`pricing_page_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_bullets_order_idx\` ON \`pricing_page_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_bullets_parent_id_idx\` ON \`pricing_page_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_bullets_locale_idx\` ON \`pricing_page_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_order_idx\` ON \`pricing_page_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_parent_id_idx\` ON \`pricing_page_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_path_idx\` ON \`pricing_page_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_rich_text_section_locale_idx\` ON \`pricing_page_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_paragraphs_order_idx\` ON \`pricing_page_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`pricing_page_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_paragraphs_locale_idx\` ON \`pricing_page_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_bullets_order_idx\` ON \`pricing_page_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_bullets_parent_id_idx\` ON \`pricing_page_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_bullets_locale_idx\` ON \`pricing_page_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`pricing_page_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`pricing_page_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`pricing_page_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_bullets_order_idx\` ON \`pricing_page_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`pricing_page_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`pricing_page_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_order_idx\` ON \`pricing_page_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_parent_id_idx\` ON \`pricing_page_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_cards_locale_idx\` ON \`pricing_page_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_order_idx\` ON \`pricing_page_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_parent_id_idx\` ON \`pricing_page_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_path_idx\` ON \`pricing_page_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_card_grid_section_locale_idx\` ON \`pricing_page_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_items_order_idx\` ON \`pricing_page_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_items_parent_id_idx\` ON \`pricing_page_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_items_locale_idx\` ON \`pricing_page_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_order_idx\` ON \`pricing_page_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_parent_id_idx\` ON \`pricing_page_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_path_idx\` ON \`pricing_page_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_bullet_list_section_locale_idx\` ON \`pricing_page_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_cta_section_order_idx\` ON \`pricing_page_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_cta_section_parent_id_idx\` ON \`pricing_page_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_cta_section_path_idx\` ON \`pricing_page_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_cta_section_locale_idx\` ON \`pricing_page_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_markdown_document_order_idx\` ON \`pricing_page_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_markdown_document_parent_id_idx\` ON \`pricing_page_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_markdown_document_path_idx\` ON \`pricing_page_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_markdown_document_locale_idx\` ON \`pricing_page_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page__status_idx\` ON \`pricing_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`og_image_id\` integer,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_og_image_idx\` ON \`pricing_page_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pricing_page_locales_locale_parent_id_unique\` ON \`pricing_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_pricing_page_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_pricing_page_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_pricing_page_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_bullets_order_idx\` ON \`_pricing_page_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_pricing_page_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_pricing_page_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_order_idx\` ON \`_pricing_page_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_parent_id_idx\` ON \`_pricing_page_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_path_idx\` ON \`_pricing_page_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_rich_text_section_locale_idx\` ON \`_pricing_page_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_pricing_page_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_pricing_page_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_pricing_page_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_bullets_order_idx\` ON \`_pricing_page_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_pricing_page_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_pricing_page_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_order_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_cards_locale_idx\` ON \`_pricing_page_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_order_idx\` ON \`_pricing_page_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_parent_id_idx\` ON \`_pricing_page_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_path_idx\` ON \`_pricing_page_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_card_grid_section_locale_idx\` ON \`_pricing_page_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_items_order_idx\` ON \`_pricing_page_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_pricing_page_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_items_locale_idx\` ON \`_pricing_page_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_order_idx\` ON \`_pricing_page_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_parent_id_idx\` ON \`_pricing_page_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_path_idx\` ON \`_pricing_page_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_bullet_list_section_locale_idx\` ON \`_pricing_page_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_cta_section_order_idx\` ON \`_pricing_page_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_cta_section_parent_id_idx\` ON \`_pricing_page_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_cta_section_path_idx\` ON \`_pricing_page_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_cta_section_locale_idx\` ON \`_pricing_page_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_markdown_document_order_idx\` ON \`_pricing_page_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_markdown_document_parent_id_idx\` ON \`_pricing_page_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_markdown_document_path_idx\` ON \`_pricing_page_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_markdown_document_locale_idx\` ON \`_pricing_page_v_blocks_markdown_document\` (\`_locale\`);`)
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
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_og_image_id\` integer,
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_version_version_og_image_idx\` ON \`_pricing_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_pricing_page_v_locales_locale_parent_id_unique\` ON \`_pricing_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_paragraphs_order_idx\` ON \`privacy_page_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`privacy_page_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_paragraphs_locale_idx\` ON \`privacy_page_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_bullets_order_idx\` ON \`privacy_page_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_bullets_parent_id_idx\` ON \`privacy_page_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_bullets_locale_idx\` ON \`privacy_page_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_order_idx\` ON \`privacy_page_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_parent_id_idx\` ON \`privacy_page_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_path_idx\` ON \`privacy_page_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_rich_text_section_locale_idx\` ON \`privacy_page_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_paragraphs_order_idx\` ON \`privacy_page_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`privacy_page_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_paragraphs_locale_idx\` ON \`privacy_page_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_bullets_order_idx\` ON \`privacy_page_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_bullets_parent_id_idx\` ON \`privacy_page_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_bullets_locale_idx\` ON \`privacy_page_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`privacy_page_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`privacy_page_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`privacy_page_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_bullets_order_idx\` ON \`privacy_page_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`privacy_page_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`privacy_page_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_order_idx\` ON \`privacy_page_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_parent_id_idx\` ON \`privacy_page_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_cards_locale_idx\` ON \`privacy_page_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_order_idx\` ON \`privacy_page_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_parent_id_idx\` ON \`privacy_page_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_path_idx\` ON \`privacy_page_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_card_grid_section_locale_idx\` ON \`privacy_page_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_items_order_idx\` ON \`privacy_page_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_items_parent_id_idx\` ON \`privacy_page_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_items_locale_idx\` ON \`privacy_page_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_order_idx\` ON \`privacy_page_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_parent_id_idx\` ON \`privacy_page_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_path_idx\` ON \`privacy_page_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_bullet_list_section_locale_idx\` ON \`privacy_page_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_cta_section_order_idx\` ON \`privacy_page_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_cta_section_parent_id_idx\` ON \`privacy_page_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_cta_section_path_idx\` ON \`privacy_page_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_cta_section_locale_idx\` ON \`privacy_page_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_markdown_document_order_idx\` ON \`privacy_page_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_markdown_document_parent_id_idx\` ON \`privacy_page_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_markdown_document_path_idx\` ON \`privacy_page_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_markdown_document_locale_idx\` ON \`privacy_page_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page__status_idx\` ON \`privacy_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`og_image_id\` integer,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_og_image_idx\` ON \`privacy_page_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`privacy_page_locales_locale_parent_id_unique\` ON \`privacy_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_privacy_page_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_privacy_page_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_privacy_page_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_bullets_order_idx\` ON \`_privacy_page_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_privacy_page_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_privacy_page_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_order_idx\` ON \`_privacy_page_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_parent_id_idx\` ON \`_privacy_page_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_path_idx\` ON \`_privacy_page_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_rich_text_section_locale_idx\` ON \`_privacy_page_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_privacy_page_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_privacy_page_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_privacy_page_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_bullets_order_idx\` ON \`_privacy_page_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_privacy_page_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_privacy_page_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_order_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_cards_locale_idx\` ON \`_privacy_page_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_order_idx\` ON \`_privacy_page_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_parent_id_idx\` ON \`_privacy_page_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_path_idx\` ON \`_privacy_page_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_card_grid_section_locale_idx\` ON \`_privacy_page_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_items_order_idx\` ON \`_privacy_page_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_privacy_page_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_items_locale_idx\` ON \`_privacy_page_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_order_idx\` ON \`_privacy_page_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_parent_id_idx\` ON \`_privacy_page_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_path_idx\` ON \`_privacy_page_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_bullet_list_section_locale_idx\` ON \`_privacy_page_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_cta_section_order_idx\` ON \`_privacy_page_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_cta_section_parent_id_idx\` ON \`_privacy_page_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_cta_section_path_idx\` ON \`_privacy_page_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_cta_section_locale_idx\` ON \`_privacy_page_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_markdown_document_order_idx\` ON \`_privacy_page_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_markdown_document_parent_id_idx\` ON \`_privacy_page_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_markdown_document_path_idx\` ON \`_privacy_page_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_markdown_document_locale_idx\` ON \`_privacy_page_v_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v\` (
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
  await db.run(sql`CREATE INDEX \`_privacy_page_v_version_version__status_idx\` ON \`_privacy_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_created_at_idx\` ON \`_privacy_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_updated_at_idx\` ON \`_privacy_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_snapshot_idx\` ON \`_privacy_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_published_locale_idx\` ON \`_privacy_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_latest_idx\` ON \`_privacy_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_autosave_idx\` ON \`_privacy_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_og_image_id\` integer,
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_version_version_og_image_idx\` ON \`_privacy_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_privacy_page_v_locales_locale_parent_id_unique\` ON \`_privacy_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_paragraphs_order_idx\` ON \`terms_page_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`terms_page_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_paragraphs_locale_idx\` ON \`terms_page_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_bullets_order_idx\` ON \`terms_page_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_bullets_parent_id_idx\` ON \`terms_page_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_bullets_locale_idx\` ON \`terms_page_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_order_idx\` ON \`terms_page_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_parent_id_idx\` ON \`terms_page_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_path_idx\` ON \`terms_page_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_rich_text_section_locale_idx\` ON \`terms_page_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_paragraphs_order_idx\` ON \`terms_page_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`terms_page_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_paragraphs_locale_idx\` ON \`terms_page_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_bullets_order_idx\` ON \`terms_page_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_bullets_parent_id_idx\` ON \`terms_page_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_bullets_locale_idx\` ON \`terms_page_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`terms_page_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`terms_page_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`terms_page_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_bullets_order_idx\` ON \`terms_page_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`terms_page_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`terms_page_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_order_idx\` ON \`terms_page_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_parent_id_idx\` ON \`terms_page_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_cards_locale_idx\` ON \`terms_page_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_order_idx\` ON \`terms_page_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_parent_id_idx\` ON \`terms_page_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_path_idx\` ON \`terms_page_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_card_grid_section_locale_idx\` ON \`terms_page_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_items_order_idx\` ON \`terms_page_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_items_parent_id_idx\` ON \`terms_page_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_items_locale_idx\` ON \`terms_page_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_order_idx\` ON \`terms_page_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_parent_id_idx\` ON \`terms_page_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_path_idx\` ON \`terms_page_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_bullet_list_section_locale_idx\` ON \`terms_page_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_cta_section_order_idx\` ON \`terms_page_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_cta_section_parent_id_idx\` ON \`terms_page_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_cta_section_path_idx\` ON \`terms_page_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_cta_section_locale_idx\` ON \`terms_page_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_markdown_document_order_idx\` ON \`terms_page_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_markdown_document_parent_id_idx\` ON \`terms_page_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_markdown_document_path_idx\` ON \`terms_page_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_markdown_document_locale_idx\` ON \`terms_page_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page__status_idx\` ON \`terms_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_locales\` (
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`og_image_id\` integer,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text,
  	\`hero_highlight\` text,
  	\`hero_description\` text,
  	\`hero_supporting_text\` text,
  	\`hero_footnote\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_href\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_og_image_idx\` ON \`terms_page_locales\` (\`og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`terms_page_locales_locale_parent_id_unique\` ON \`terms_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_rich_text_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_paragraphs_order_idx\` ON \`_terms_page_v_blocks_rich_text_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_paragraphs_parent_id_idx\` ON \`_terms_page_v_blocks_rich_text_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_paragraphs_locale_idx\` ON \`_terms_page_v_blocks_rich_text_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_rich_text_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_rich_text_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_bullets_order_idx\` ON \`_terms_page_v_blocks_rich_text_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_bullets_parent_id_idx\` ON \`_terms_page_v_blocks_rich_text_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_bullets_locale_idx\` ON \`_terms_page_v_blocks_rich_text_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_rich_text_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_order_idx\` ON \`_terms_page_v_blocks_rich_text_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_parent_id_idx\` ON \`_terms_page_v_blocks_rich_text_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_path_idx\` ON \`_terms_page_v_blocks_rich_text_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_rich_text_section_locale_idx\` ON \`_terms_page_v_blocks_rich_text_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_card_grid_section_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_paragraphs_order_idx\` ON \`_terms_page_v_blocks_card_grid_section_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_paragraphs_parent_id_idx\` ON \`_terms_page_v_blocks_card_grid_section_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_paragraphs_locale_idx\` ON \`_terms_page_v_blocks_card_grid_section_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_card_grid_section_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_bullets_order_idx\` ON \`_terms_page_v_blocks_card_grid_section_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_bullets_parent_id_idx\` ON \`_terms_page_v_blocks_card_grid_section_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_bullets_locale_idx\` ON \`_terms_page_v_blocks_card_grid_section_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_card_grid_section_cards_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_paragraphs_order_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_paragraphs_parent_id_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_paragraphs_locale_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_card_grid_section_cards_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_card_grid_section_cards\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_bullets_order_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_bullets_parent_id_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_bullets_locale_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_card_grid_section_cards\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_card_grid_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_order_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_parent_id_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_cards_locale_idx\` ON \`_terms_page_v_blocks_card_grid_section_cards\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_card_grid_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`columns\` text DEFAULT '2',
  	\`style\` text DEFAULT 'default',
  	\`layout_mode\` text DEFAULT 'auto',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_order_idx\` ON \`_terms_page_v_blocks_card_grid_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_parent_id_idx\` ON \`_terms_page_v_blocks_card_grid_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_path_idx\` ON \`_terms_page_v_blocks_card_grid_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_card_grid_section_locale_idx\` ON \`_terms_page_v_blocks_card_grid_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_bullet_list_section_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_bullet_list_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_items_order_idx\` ON \`_terms_page_v_blocks_bullet_list_section_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_items_parent_id_idx\` ON \`_terms_page_v_blocks_bullet_list_section_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_items_locale_idx\` ON \`_terms_page_v_blocks_bullet_list_section_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_bullet_list_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`style\` text DEFAULT 'panel',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_order_idx\` ON \`_terms_page_v_blocks_bullet_list_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_parent_id_idx\` ON \`_terms_page_v_blocks_bullet_list_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_path_idx\` ON \`_terms_page_v_blocks_bullet_list_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_bullet_list_section_locale_idx\` ON \`_terms_page_v_blocks_bullet_list_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_cta_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`description\` text,
  	\`header_alignment\` text,
  	\`primary_cta_label\` text,
  	\`primary_cta_href\` text,
  	\`secondary_cta_label\` text,
  	\`secondary_cta_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_cta_section_order_idx\` ON \`_terms_page_v_blocks_cta_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_cta_section_parent_id_idx\` ON \`_terms_page_v_blocks_cta_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_cta_section_path_idx\` ON \`_terms_page_v_blocks_cta_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_cta_section_locale_idx\` ON \`_terms_page_v_blocks_cta_section\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_markdown_document\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`header_alignment\` text,
  	\`markdown\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_markdown_document_order_idx\` ON \`_terms_page_v_blocks_markdown_document\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_markdown_document_parent_id_idx\` ON \`_terms_page_v_blocks_markdown_document\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_markdown_document_path_idx\` ON \`_terms_page_v_blocks_markdown_document\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_markdown_document_locale_idx\` ON \`_terms_page_v_blocks_markdown_document\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v\` (
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
  await db.run(sql`CREATE INDEX \`_terms_page_v_version_version__status_idx\` ON \`_terms_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_created_at_idx\` ON \`_terms_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_updated_at_idx\` ON \`_terms_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_snapshot_idx\` ON \`_terms_page_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_published_locale_idx\` ON \`_terms_page_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_latest_idx\` ON \`_terms_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_autosave_idx\` ON \`_terms_page_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_locales\` (
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_og_image_id\` integer,
  	\`version_hero_eyebrow\` text,
  	\`version_hero_title\` text,
  	\`version_hero_highlight\` text,
  	\`version_hero_description\` text,
  	\`version_hero_supporting_text\` text,
  	\`version_hero_footnote\` text,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_href\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_href\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_version_version_og_image_idx\` ON \`_terms_page_v_locales\` (\`version_og_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_terms_page_v_locales_locale_parent_id_unique\` ON \`_terms_page_v_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_roles\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_tags\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`feature_pages\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`faq_items\`;`)
  await db.run(sql`DROP TABLE \`faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`redirects_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links_children\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_nav_links_children\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_nav_links\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_locales\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`about_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`pricing_page\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`privacy_page\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_locales\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`terms_page\`;`)
  await db.run(sql`DROP TABLE \`terms_page_locales\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_rich_text_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_rich_text_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_rich_text_section\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_card_grid_section_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_card_grid_section_bullets\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_card_grid_section_cards_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_card_grid_section_cards_bullets\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_card_grid_section_cards\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_card_grid_section\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_bullet_list_section_items\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_bullet_list_section\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_cta_section\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_markdown_document\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_locales\`;`)
}
