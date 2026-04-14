import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_items_bullets_order_idx\` ON \`blog_posts_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`blog_posts_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_items_bullets_locale_idx\` ON \`blog_posts_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_items_order_idx\` ON \`blog_posts_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_items_parent_id_idx\` ON \`blog_posts_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_items_locale_idx\` ON \`blog_posts_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_order_idx\` ON \`blog_posts_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_parent_id_idx\` ON \`blog_posts_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_path_idx\` ON \`blog_posts_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_feature_showcase_locale_idx\` ON \`blog_posts_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_steps_order_idx\` ON \`blog_posts_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_steps_parent_id_idx\` ON \`blog_posts_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_steps_locale_idx\` ON \`blog_posts_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_order_idx\` ON \`blog_posts_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_parent_id_idx\` ON \`blog_posts_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_path_idx\` ON \`blog_posts_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_process_steps_locale_idx\` ON \`blog_posts_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_entries_order_idx\` ON \`blog_posts_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_entries_parent_id_idx\` ON \`blog_posts_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_entries_locale_idx\` ON \`blog_posts_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_panel_items_order_idx\` ON \`blog_posts_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_panel_items_parent_id_idx\` ON \`blog_posts_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_panel_items_locale_idx\` ON \`blog_posts_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_order_idx\` ON \`blog_posts_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_parent_id_idx\` ON \`blog_posts_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_path_idx\` ON \`blog_posts_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_split_panel_locale_idx\` ON \`blog_posts_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`blog_posts_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`blog_posts_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`blog_posts_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_items_order_idx\` ON \`blog_posts_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_items_parent_id_idx\` ON \`blog_posts_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_items_locale_idx\` ON \`blog_posts_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_order_idx\` ON \`blog_posts_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_parent_id_idx\` ON \`blog_posts_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_path_idx\` ON \`blog_posts_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_use_case_grid_locale_idx\` ON \`blog_posts_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_mission_body_order_idx\` ON \`blog_posts_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_mission_body_parent_id_idx\` ON \`blog_posts_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_mission_body_locale_idx\` ON \`blog_posts_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_story_body_order_idx\` ON \`blog_posts_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_story_body_parent_id_idx\` ON \`blog_posts_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_story_body_locale_idx\` ON \`blog_posts_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_stats_order_idx\` ON \`blog_posts_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_stats_parent_id_idx\` ON \`blog_posts_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_stats_locale_idx\` ON \`blog_posts_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_recognitions_order_idx\` ON \`blog_posts_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_recognitions_parent_id_idx\` ON \`blog_posts_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_recognitions_locale_idx\` ON \`blog_posts_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_contact_body_order_idx\` ON \`blog_posts_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_contact_body_parent_id_idx\` ON \`blog_posts_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_contact_body_locale_idx\` ON \`blog_posts_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_order_idx\` ON \`blog_posts_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_parent_id_idx\` ON \`blog_posts_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_path_idx\` ON \`blog_posts_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_blocks_company_overview_locale_idx\` ON \`blog_posts_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_blog_posts_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_blog_posts_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_blog_posts_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_items_order_idx\` ON \`_blog_posts_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_blog_posts_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_items_locale_idx\` ON \`_blog_posts_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_order_idx\` ON \`_blog_posts_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_parent_id_idx\` ON \`_blog_posts_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_path_idx\` ON \`_blog_posts_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_feature_showcase_locale_idx\` ON \`_blog_posts_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_steps_order_idx\` ON \`_blog_posts_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_steps_parent_id_idx\` ON \`_blog_posts_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_steps_locale_idx\` ON \`_blog_posts_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_order_idx\` ON \`_blog_posts_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_parent_id_idx\` ON \`_blog_posts_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_path_idx\` ON \`_blog_posts_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_process_steps_locale_idx\` ON \`_blog_posts_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_entries_order_idx\` ON \`_blog_posts_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_entries_parent_id_idx\` ON \`_blog_posts_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_entries_locale_idx\` ON \`_blog_posts_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_panel_items_order_idx\` ON \`_blog_posts_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_blog_posts_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_panel_items_locale_idx\` ON \`_blog_posts_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_order_idx\` ON \`_blog_posts_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_parent_id_idx\` ON \`_blog_posts_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_path_idx\` ON \`_blog_posts_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_split_panel_locale_idx\` ON \`_blog_posts_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_blog_posts_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_blog_posts_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_blog_posts_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_items_order_idx\` ON \`_blog_posts_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_blog_posts_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_items_locale_idx\` ON \`_blog_posts_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_order_idx\` ON \`_blog_posts_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_parent_id_idx\` ON \`_blog_posts_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_path_idx\` ON \`_blog_posts_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_use_case_grid_locale_idx\` ON \`_blog_posts_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_mission_body_order_idx\` ON \`_blog_posts_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_blog_posts_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_mission_body_locale_idx\` ON \`_blog_posts_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_story_body_order_idx\` ON \`_blog_posts_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_blog_posts_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_story_body_locale_idx\` ON \`_blog_posts_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_stats_order_idx\` ON \`_blog_posts_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_stats_parent_id_idx\` ON \`_blog_posts_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_stats_locale_idx\` ON \`_blog_posts_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_recognitions_order_idx\` ON \`_blog_posts_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_blog_posts_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_recognitions_locale_idx\` ON \`_blog_posts_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_contact_body_order_idx\` ON \`_blog_posts_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_blog_posts_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_contact_body_locale_idx\` ON \`_blog_posts_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_order_idx\` ON \`_blog_posts_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_parent_id_idx\` ON \`_blog_posts_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_path_idx\` ON \`_blog_posts_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_blocks_company_overview_locale_idx\` ON \`_blog_posts_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_items_bullets_order_idx\` ON \`feature_pages_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`feature_pages_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_items_bullets_locale_idx\` ON \`feature_pages_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_items_order_idx\` ON \`feature_pages_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_items_parent_id_idx\` ON \`feature_pages_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_items_locale_idx\` ON \`feature_pages_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_order_idx\` ON \`feature_pages_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_parent_id_idx\` ON \`feature_pages_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_path_idx\` ON \`feature_pages_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_feature_showcase_locale_idx\` ON \`feature_pages_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_steps_order_idx\` ON \`feature_pages_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_steps_parent_id_idx\` ON \`feature_pages_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_steps_locale_idx\` ON \`feature_pages_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_order_idx\` ON \`feature_pages_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_parent_id_idx\` ON \`feature_pages_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_path_idx\` ON \`feature_pages_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_process_steps_locale_idx\` ON \`feature_pages_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_entries_order_idx\` ON \`feature_pages_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_entries_parent_id_idx\` ON \`feature_pages_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_entries_locale_idx\` ON \`feature_pages_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_panel_items_order_idx\` ON \`feature_pages_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_panel_items_parent_id_idx\` ON \`feature_pages_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_panel_items_locale_idx\` ON \`feature_pages_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_order_idx\` ON \`feature_pages_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_parent_id_idx\` ON \`feature_pages_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_path_idx\` ON \`feature_pages_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_split_panel_locale_idx\` ON \`feature_pages_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`feature_pages_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`feature_pages_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`feature_pages_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_items_order_idx\` ON \`feature_pages_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_items_parent_id_idx\` ON \`feature_pages_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_items_locale_idx\` ON \`feature_pages_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_order_idx\` ON \`feature_pages_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_parent_id_idx\` ON \`feature_pages_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_path_idx\` ON \`feature_pages_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_use_case_grid_locale_idx\` ON \`feature_pages_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_mission_body_order_idx\` ON \`feature_pages_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_mission_body_parent_id_idx\` ON \`feature_pages_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_mission_body_locale_idx\` ON \`feature_pages_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_story_body_order_idx\` ON \`feature_pages_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_story_body_parent_id_idx\` ON \`feature_pages_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_story_body_locale_idx\` ON \`feature_pages_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_stats_order_idx\` ON \`feature_pages_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_stats_parent_id_idx\` ON \`feature_pages_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_stats_locale_idx\` ON \`feature_pages_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_recognitions_order_idx\` ON \`feature_pages_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_recognitions_parent_id_idx\` ON \`feature_pages_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_recognitions_locale_idx\` ON \`feature_pages_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_contact_body_order_idx\` ON \`feature_pages_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_contact_body_parent_id_idx\` ON \`feature_pages_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_contact_body_locale_idx\` ON \`feature_pages_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`feature_pages_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`feature_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_order_idx\` ON \`feature_pages_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_parent_id_idx\` ON \`feature_pages_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_path_idx\` ON \`feature_pages_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`feature_pages_blocks_company_overview_locale_idx\` ON \`feature_pages_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_feature_pages_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_feature_pages_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_feature_pages_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_items_order_idx\` ON \`_feature_pages_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_feature_pages_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_items_locale_idx\` ON \`_feature_pages_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_order_idx\` ON \`_feature_pages_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_parent_id_idx\` ON \`_feature_pages_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_path_idx\` ON \`_feature_pages_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_feature_showcase_locale_idx\` ON \`_feature_pages_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_steps_order_idx\` ON \`_feature_pages_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_steps_parent_id_idx\` ON \`_feature_pages_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_steps_locale_idx\` ON \`_feature_pages_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_order_idx\` ON \`_feature_pages_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_parent_id_idx\` ON \`_feature_pages_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_path_idx\` ON \`_feature_pages_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_process_steps_locale_idx\` ON \`_feature_pages_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_entries_order_idx\` ON \`_feature_pages_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_entries_parent_id_idx\` ON \`_feature_pages_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_entries_locale_idx\` ON \`_feature_pages_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_panel_items_order_idx\` ON \`_feature_pages_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_feature_pages_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_panel_items_locale_idx\` ON \`_feature_pages_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_order_idx\` ON \`_feature_pages_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_parent_id_idx\` ON \`_feature_pages_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_path_idx\` ON \`_feature_pages_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_split_panel_locale_idx\` ON \`_feature_pages_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_feature_pages_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_feature_pages_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_feature_pages_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_items_order_idx\` ON \`_feature_pages_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_feature_pages_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_items_locale_idx\` ON \`_feature_pages_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_order_idx\` ON \`_feature_pages_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_parent_id_idx\` ON \`_feature_pages_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_path_idx\` ON \`_feature_pages_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_use_case_grid_locale_idx\` ON \`_feature_pages_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_mission_body_order_idx\` ON \`_feature_pages_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_feature_pages_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_mission_body_locale_idx\` ON \`_feature_pages_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_story_body_order_idx\` ON \`_feature_pages_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_feature_pages_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_story_body_locale_idx\` ON \`_feature_pages_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_stats_order_idx\` ON \`_feature_pages_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_stats_parent_id_idx\` ON \`_feature_pages_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_stats_locale_idx\` ON \`_feature_pages_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_recognitions_order_idx\` ON \`_feature_pages_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_feature_pages_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_recognitions_locale_idx\` ON \`_feature_pages_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_contact_body_order_idx\` ON \`_feature_pages_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_feature_pages_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_contact_body_locale_idx\` ON \`_feature_pages_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_feature_pages_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_feature_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_order_idx\` ON \`_feature_pages_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_parent_id_idx\` ON \`_feature_pages_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_path_idx\` ON \`_feature_pages_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_blocks_company_overview_locale_idx\` ON \`_feature_pages_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_items_bullets_order_idx\` ON \`use_case_pages_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`use_case_pages_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_items_bullets_locale_idx\` ON \`use_case_pages_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_items_order_idx\` ON \`use_case_pages_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_items_parent_id_idx\` ON \`use_case_pages_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_items_locale_idx\` ON \`use_case_pages_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_order_idx\` ON \`use_case_pages_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_parent_id_idx\` ON \`use_case_pages_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_path_idx\` ON \`use_case_pages_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_feature_showcase_locale_idx\` ON \`use_case_pages_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_steps_order_idx\` ON \`use_case_pages_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_steps_parent_id_idx\` ON \`use_case_pages_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_steps_locale_idx\` ON \`use_case_pages_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_order_idx\` ON \`use_case_pages_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_parent_id_idx\` ON \`use_case_pages_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_path_idx\` ON \`use_case_pages_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_process_steps_locale_idx\` ON \`use_case_pages_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_entries_order_idx\` ON \`use_case_pages_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_entries_parent_id_idx\` ON \`use_case_pages_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_entries_locale_idx\` ON \`use_case_pages_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_panel_items_order_idx\` ON \`use_case_pages_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_panel_items_parent_id_idx\` ON \`use_case_pages_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_panel_items_locale_idx\` ON \`use_case_pages_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_order_idx\` ON \`use_case_pages_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_parent_id_idx\` ON \`use_case_pages_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_path_idx\` ON \`use_case_pages_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_split_panel_locale_idx\` ON \`use_case_pages_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`use_case_pages_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`use_case_pages_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`use_case_pages_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_items_order_idx\` ON \`use_case_pages_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_items_parent_id_idx\` ON \`use_case_pages_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_items_locale_idx\` ON \`use_case_pages_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_order_idx\` ON \`use_case_pages_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_parent_id_idx\` ON \`use_case_pages_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_path_idx\` ON \`use_case_pages_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_use_case_grid_locale_idx\` ON \`use_case_pages_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_mission_body_order_idx\` ON \`use_case_pages_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_mission_body_parent_id_idx\` ON \`use_case_pages_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_mission_body_locale_idx\` ON \`use_case_pages_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_story_body_order_idx\` ON \`use_case_pages_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_story_body_parent_id_idx\` ON \`use_case_pages_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_story_body_locale_idx\` ON \`use_case_pages_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_stats_order_idx\` ON \`use_case_pages_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_stats_parent_id_idx\` ON \`use_case_pages_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_stats_locale_idx\` ON \`use_case_pages_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_recognitions_order_idx\` ON \`use_case_pages_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_recognitions_parent_id_idx\` ON \`use_case_pages_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_recognitions_locale_idx\` ON \`use_case_pages_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_contact_body_order_idx\` ON \`use_case_pages_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_contact_body_parent_id_idx\` ON \`use_case_pages_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_contact_body_locale_idx\` ON \`use_case_pages_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`use_case_pages_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`use_case_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_order_idx\` ON \`use_case_pages_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_parent_id_idx\` ON \`use_case_pages_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_path_idx\` ON \`use_case_pages_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_blocks_company_overview_locale_idx\` ON \`use_case_pages_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_use_case_pages_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_use_case_pages_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_use_case_pages_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_items_order_idx\` ON \`_use_case_pages_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_use_case_pages_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_items_locale_idx\` ON \`_use_case_pages_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_order_idx\` ON \`_use_case_pages_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_parent_id_idx\` ON \`_use_case_pages_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_path_idx\` ON \`_use_case_pages_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_feature_showcase_locale_idx\` ON \`_use_case_pages_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_steps_order_idx\` ON \`_use_case_pages_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_steps_parent_id_idx\` ON \`_use_case_pages_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_steps_locale_idx\` ON \`_use_case_pages_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_order_idx\` ON \`_use_case_pages_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_parent_id_idx\` ON \`_use_case_pages_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_path_idx\` ON \`_use_case_pages_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_process_steps_locale_idx\` ON \`_use_case_pages_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_entries_order_idx\` ON \`_use_case_pages_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_entries_parent_id_idx\` ON \`_use_case_pages_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_entries_locale_idx\` ON \`_use_case_pages_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_panel_items_order_idx\` ON \`_use_case_pages_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_use_case_pages_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_panel_items_locale_idx\` ON \`_use_case_pages_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_order_idx\` ON \`_use_case_pages_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_parent_id_idx\` ON \`_use_case_pages_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_path_idx\` ON \`_use_case_pages_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_split_panel_locale_idx\` ON \`_use_case_pages_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_items_order_idx\` ON \`_use_case_pages_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_use_case_pages_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_items_locale_idx\` ON \`_use_case_pages_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_order_idx\` ON \`_use_case_pages_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_parent_id_idx\` ON \`_use_case_pages_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_path_idx\` ON \`_use_case_pages_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_use_case_grid_locale_idx\` ON \`_use_case_pages_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_mission_body_order_idx\` ON \`_use_case_pages_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_use_case_pages_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_mission_body_locale_idx\` ON \`_use_case_pages_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_story_body_order_idx\` ON \`_use_case_pages_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_use_case_pages_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_story_body_locale_idx\` ON \`_use_case_pages_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_stats_order_idx\` ON \`_use_case_pages_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_stats_parent_id_idx\` ON \`_use_case_pages_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_stats_locale_idx\` ON \`_use_case_pages_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_recognitions_order_idx\` ON \`_use_case_pages_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_use_case_pages_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_recognitions_locale_idx\` ON \`_use_case_pages_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_contact_body_order_idx\` ON \`_use_case_pages_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_use_case_pages_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_contact_body_locale_idx\` ON \`_use_case_pages_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_use_case_pages_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_use_case_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_order_idx\` ON \`_use_case_pages_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_parent_id_idx\` ON \`_use_case_pages_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_path_idx\` ON \`_use_case_pages_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_blocks_company_overview_locale_idx\` ON \`_use_case_pages_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_items_bullets_order_idx\` ON \`home_page_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`home_page_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_items_bullets_locale_idx\` ON \`home_page_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_items_order_idx\` ON \`home_page_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_items_parent_id_idx\` ON \`home_page_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_items_locale_idx\` ON \`home_page_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_order_idx\` ON \`home_page_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_parent_id_idx\` ON \`home_page_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_path_idx\` ON \`home_page_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_feature_showcase_locale_idx\` ON \`home_page_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_steps_order_idx\` ON \`home_page_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_steps_parent_id_idx\` ON \`home_page_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_steps_locale_idx\` ON \`home_page_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_order_idx\` ON \`home_page_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_parent_id_idx\` ON \`home_page_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_path_idx\` ON \`home_page_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_process_steps_locale_idx\` ON \`home_page_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_entries_order_idx\` ON \`home_page_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_entries_parent_id_idx\` ON \`home_page_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_entries_locale_idx\` ON \`home_page_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_panel_items_order_idx\` ON \`home_page_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_panel_items_parent_id_idx\` ON \`home_page_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_panel_items_locale_idx\` ON \`home_page_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_order_idx\` ON \`home_page_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_parent_id_idx\` ON \`home_page_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_path_idx\` ON \`home_page_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_split_panel_locale_idx\` ON \`home_page_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`home_page_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`home_page_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`home_page_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_items_order_idx\` ON \`home_page_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_items_parent_id_idx\` ON \`home_page_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_items_locale_idx\` ON \`home_page_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_order_idx\` ON \`home_page_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_parent_id_idx\` ON \`home_page_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_path_idx\` ON \`home_page_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_use_case_grid_locale_idx\` ON \`home_page_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_mission_body_order_idx\` ON \`home_page_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_mission_body_parent_id_idx\` ON \`home_page_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_mission_body_locale_idx\` ON \`home_page_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_story_body_order_idx\` ON \`home_page_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_story_body_parent_id_idx\` ON \`home_page_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_story_body_locale_idx\` ON \`home_page_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_stats_order_idx\` ON \`home_page_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_stats_parent_id_idx\` ON \`home_page_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_stats_locale_idx\` ON \`home_page_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_recognitions_order_idx\` ON \`home_page_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_recognitions_parent_id_idx\` ON \`home_page_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_recognitions_locale_idx\` ON \`home_page_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_contact_body_order_idx\` ON \`home_page_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_contact_body_parent_id_idx\` ON \`home_page_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_contact_body_locale_idx\` ON \`home_page_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`home_page_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_order_idx\` ON \`home_page_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_parent_id_idx\` ON \`home_page_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_path_idx\` ON \`home_page_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_blocks_company_overview_locale_idx\` ON \`home_page_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_home_page_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_home_page_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_home_page_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_items_order_idx\` ON \`_home_page_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_home_page_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_items_locale_idx\` ON \`_home_page_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_order_idx\` ON \`_home_page_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_parent_id_idx\` ON \`_home_page_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_path_idx\` ON \`_home_page_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_feature_showcase_locale_idx\` ON \`_home_page_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_steps_order_idx\` ON \`_home_page_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_steps_parent_id_idx\` ON \`_home_page_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_steps_locale_idx\` ON \`_home_page_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_order_idx\` ON \`_home_page_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_parent_id_idx\` ON \`_home_page_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_path_idx\` ON \`_home_page_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_process_steps_locale_idx\` ON \`_home_page_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_entries_order_idx\` ON \`_home_page_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_entries_parent_id_idx\` ON \`_home_page_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_entries_locale_idx\` ON \`_home_page_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_panel_items_order_idx\` ON \`_home_page_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_home_page_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_panel_items_locale_idx\` ON \`_home_page_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_order_idx\` ON \`_home_page_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_parent_id_idx\` ON \`_home_page_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_path_idx\` ON \`_home_page_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_split_panel_locale_idx\` ON \`_home_page_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_home_page_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_home_page_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_home_page_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_items_order_idx\` ON \`_home_page_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_home_page_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_items_locale_idx\` ON \`_home_page_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_order_idx\` ON \`_home_page_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_parent_id_idx\` ON \`_home_page_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_path_idx\` ON \`_home_page_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_use_case_grid_locale_idx\` ON \`_home_page_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_mission_body_order_idx\` ON \`_home_page_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_home_page_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_mission_body_locale_idx\` ON \`_home_page_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_story_body_order_idx\` ON \`_home_page_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_home_page_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_story_body_locale_idx\` ON \`_home_page_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_stats_order_idx\` ON \`_home_page_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_stats_parent_id_idx\` ON \`_home_page_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_stats_locale_idx\` ON \`_home_page_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_recognitions_order_idx\` ON \`_home_page_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_home_page_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_recognitions_locale_idx\` ON \`_home_page_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_contact_body_order_idx\` ON \`_home_page_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_home_page_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_contact_body_locale_idx\` ON \`_home_page_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_order_idx\` ON \`_home_page_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_parent_id_idx\` ON \`_home_page_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_path_idx\` ON \`_home_page_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_blocks_company_overview_locale_idx\` ON \`_home_page_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_items_bullets_order_idx\` ON \`about_page_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`about_page_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_items_bullets_locale_idx\` ON \`about_page_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_items_order_idx\` ON \`about_page_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_items_parent_id_idx\` ON \`about_page_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_items_locale_idx\` ON \`about_page_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_order_idx\` ON \`about_page_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_parent_id_idx\` ON \`about_page_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_path_idx\` ON \`about_page_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_feature_showcase_locale_idx\` ON \`about_page_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_steps_order_idx\` ON \`about_page_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_steps_parent_id_idx\` ON \`about_page_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_steps_locale_idx\` ON \`about_page_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_order_idx\` ON \`about_page_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_parent_id_idx\` ON \`about_page_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_path_idx\` ON \`about_page_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_process_steps_locale_idx\` ON \`about_page_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_entries_order_idx\` ON \`about_page_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_entries_parent_id_idx\` ON \`about_page_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_entries_locale_idx\` ON \`about_page_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_panel_items_order_idx\` ON \`about_page_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_panel_items_parent_id_idx\` ON \`about_page_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_panel_items_locale_idx\` ON \`about_page_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_order_idx\` ON \`about_page_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_parent_id_idx\` ON \`about_page_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_path_idx\` ON \`about_page_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_split_panel_locale_idx\` ON \`about_page_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`about_page_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`about_page_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`about_page_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_items_order_idx\` ON \`about_page_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_items_parent_id_idx\` ON \`about_page_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_items_locale_idx\` ON \`about_page_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_order_idx\` ON \`about_page_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_parent_id_idx\` ON \`about_page_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_path_idx\` ON \`about_page_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_use_case_grid_locale_idx\` ON \`about_page_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_mission_body_order_idx\` ON \`about_page_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_mission_body_parent_id_idx\` ON \`about_page_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_mission_body_locale_idx\` ON \`about_page_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_story_body_order_idx\` ON \`about_page_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_story_body_parent_id_idx\` ON \`about_page_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_story_body_locale_idx\` ON \`about_page_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_stats_order_idx\` ON \`about_page_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_stats_parent_id_idx\` ON \`about_page_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_stats_locale_idx\` ON \`about_page_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_recognitions_order_idx\` ON \`about_page_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_recognitions_parent_id_idx\` ON \`about_page_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_recognitions_locale_idx\` ON \`about_page_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_contact_body_order_idx\` ON \`about_page_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_contact_body_parent_id_idx\` ON \`about_page_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_contact_body_locale_idx\` ON \`about_page_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`about_page_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_order_idx\` ON \`about_page_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_parent_id_idx\` ON \`about_page_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_path_idx\` ON \`about_page_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`about_page_blocks_company_overview_locale_idx\` ON \`about_page_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_about_page_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_about_page_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_about_page_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_items_order_idx\` ON \`_about_page_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_about_page_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_items_locale_idx\` ON \`_about_page_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_order_idx\` ON \`_about_page_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_parent_id_idx\` ON \`_about_page_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_path_idx\` ON \`_about_page_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_feature_showcase_locale_idx\` ON \`_about_page_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_steps_order_idx\` ON \`_about_page_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_steps_parent_id_idx\` ON \`_about_page_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_steps_locale_idx\` ON \`_about_page_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_order_idx\` ON \`_about_page_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_parent_id_idx\` ON \`_about_page_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_path_idx\` ON \`_about_page_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_process_steps_locale_idx\` ON \`_about_page_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_entries_order_idx\` ON \`_about_page_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_entries_parent_id_idx\` ON \`_about_page_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_entries_locale_idx\` ON \`_about_page_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_panel_items_order_idx\` ON \`_about_page_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_about_page_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_panel_items_locale_idx\` ON \`_about_page_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_order_idx\` ON \`_about_page_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_parent_id_idx\` ON \`_about_page_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_path_idx\` ON \`_about_page_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_split_panel_locale_idx\` ON \`_about_page_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_about_page_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_about_page_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_about_page_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_items_order_idx\` ON \`_about_page_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_about_page_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_items_locale_idx\` ON \`_about_page_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_order_idx\` ON \`_about_page_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_parent_id_idx\` ON \`_about_page_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_path_idx\` ON \`_about_page_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_use_case_grid_locale_idx\` ON \`_about_page_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_mission_body_order_idx\` ON \`_about_page_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_about_page_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_mission_body_locale_idx\` ON \`_about_page_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_story_body_order_idx\` ON \`_about_page_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_about_page_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_story_body_locale_idx\` ON \`_about_page_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_stats_order_idx\` ON \`_about_page_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_stats_parent_id_idx\` ON \`_about_page_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_stats_locale_idx\` ON \`_about_page_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_recognitions_order_idx\` ON \`_about_page_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_about_page_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_recognitions_locale_idx\` ON \`_about_page_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_contact_body_order_idx\` ON \`_about_page_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_about_page_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_contact_body_locale_idx\` ON \`_about_page_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_order_idx\` ON \`_about_page_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_parent_id_idx\` ON \`_about_page_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_path_idx\` ON \`_about_page_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_blocks_company_overview_locale_idx\` ON \`_about_page_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_items_bullets_order_idx\` ON \`pricing_page_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`pricing_page_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_items_bullets_locale_idx\` ON \`pricing_page_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_items_order_idx\` ON \`pricing_page_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_items_parent_id_idx\` ON \`pricing_page_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_items_locale_idx\` ON \`pricing_page_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_order_idx\` ON \`pricing_page_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_parent_id_idx\` ON \`pricing_page_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_path_idx\` ON \`pricing_page_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_feature_showcase_locale_idx\` ON \`pricing_page_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_steps_order_idx\` ON \`pricing_page_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_steps_parent_id_idx\` ON \`pricing_page_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_steps_locale_idx\` ON \`pricing_page_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_order_idx\` ON \`pricing_page_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_parent_id_idx\` ON \`pricing_page_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_path_idx\` ON \`pricing_page_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_process_steps_locale_idx\` ON \`pricing_page_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_entries_order_idx\` ON \`pricing_page_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_entries_parent_id_idx\` ON \`pricing_page_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_entries_locale_idx\` ON \`pricing_page_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_panel_items_order_idx\` ON \`pricing_page_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_panel_items_parent_id_idx\` ON \`pricing_page_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_panel_items_locale_idx\` ON \`pricing_page_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_order_idx\` ON \`pricing_page_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_parent_id_idx\` ON \`pricing_page_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_path_idx\` ON \`pricing_page_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_split_panel_locale_idx\` ON \`pricing_page_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`pricing_page_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`pricing_page_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`pricing_page_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_items_order_idx\` ON \`pricing_page_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_items_parent_id_idx\` ON \`pricing_page_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_items_locale_idx\` ON \`pricing_page_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_order_idx\` ON \`pricing_page_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_parent_id_idx\` ON \`pricing_page_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_path_idx\` ON \`pricing_page_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_use_case_grid_locale_idx\` ON \`pricing_page_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_mission_body_order_idx\` ON \`pricing_page_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_mission_body_parent_id_idx\` ON \`pricing_page_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_mission_body_locale_idx\` ON \`pricing_page_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_story_body_order_idx\` ON \`pricing_page_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_story_body_parent_id_idx\` ON \`pricing_page_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_story_body_locale_idx\` ON \`pricing_page_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_stats_order_idx\` ON \`pricing_page_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_stats_parent_id_idx\` ON \`pricing_page_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_stats_locale_idx\` ON \`pricing_page_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_recognitions_order_idx\` ON \`pricing_page_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_recognitions_parent_id_idx\` ON \`pricing_page_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_recognitions_locale_idx\` ON \`pricing_page_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_contact_body_order_idx\` ON \`pricing_page_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_contact_body_parent_id_idx\` ON \`pricing_page_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_contact_body_locale_idx\` ON \`pricing_page_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pricing_page_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_order_idx\` ON \`pricing_page_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_parent_id_idx\` ON \`pricing_page_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_path_idx\` ON \`pricing_page_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pricing_page_blocks_company_overview_locale_idx\` ON \`pricing_page_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_pricing_page_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_pricing_page_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_pricing_page_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_items_order_idx\` ON \`_pricing_page_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_pricing_page_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_items_locale_idx\` ON \`_pricing_page_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_order_idx\` ON \`_pricing_page_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_parent_id_idx\` ON \`_pricing_page_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_path_idx\` ON \`_pricing_page_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_feature_showcase_locale_idx\` ON \`_pricing_page_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_steps_order_idx\` ON \`_pricing_page_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_steps_parent_id_idx\` ON \`_pricing_page_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_steps_locale_idx\` ON \`_pricing_page_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_order_idx\` ON \`_pricing_page_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_parent_id_idx\` ON \`_pricing_page_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_path_idx\` ON \`_pricing_page_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_process_steps_locale_idx\` ON \`_pricing_page_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_entries_order_idx\` ON \`_pricing_page_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_entries_parent_id_idx\` ON \`_pricing_page_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_entries_locale_idx\` ON \`_pricing_page_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_panel_items_order_idx\` ON \`_pricing_page_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_pricing_page_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_panel_items_locale_idx\` ON \`_pricing_page_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_order_idx\` ON \`_pricing_page_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_parent_id_idx\` ON \`_pricing_page_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_path_idx\` ON \`_pricing_page_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_split_panel_locale_idx\` ON \`_pricing_page_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_pricing_page_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_pricing_page_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_pricing_page_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_items_order_idx\` ON \`_pricing_page_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_pricing_page_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_items_locale_idx\` ON \`_pricing_page_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_order_idx\` ON \`_pricing_page_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_parent_id_idx\` ON \`_pricing_page_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_path_idx\` ON \`_pricing_page_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_use_case_grid_locale_idx\` ON \`_pricing_page_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_mission_body_order_idx\` ON \`_pricing_page_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_pricing_page_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_mission_body_locale_idx\` ON \`_pricing_page_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_story_body_order_idx\` ON \`_pricing_page_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_pricing_page_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_story_body_locale_idx\` ON \`_pricing_page_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_stats_order_idx\` ON \`_pricing_page_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_stats_parent_id_idx\` ON \`_pricing_page_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_stats_locale_idx\` ON \`_pricing_page_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_recognitions_order_idx\` ON \`_pricing_page_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_pricing_page_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_recognitions_locale_idx\` ON \`_pricing_page_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_contact_body_order_idx\` ON \`_pricing_page_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_pricing_page_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_contact_body_locale_idx\` ON \`_pricing_page_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pricing_page_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pricing_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_order_idx\` ON \`_pricing_page_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_parent_id_idx\` ON \`_pricing_page_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_path_idx\` ON \`_pricing_page_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_blocks_company_overview_locale_idx\` ON \`_pricing_page_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_items_bullets_order_idx\` ON \`privacy_page_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`privacy_page_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_items_bullets_locale_idx\` ON \`privacy_page_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_items_order_idx\` ON \`privacy_page_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_items_parent_id_idx\` ON \`privacy_page_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_items_locale_idx\` ON \`privacy_page_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_order_idx\` ON \`privacy_page_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_parent_id_idx\` ON \`privacy_page_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_path_idx\` ON \`privacy_page_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_feature_showcase_locale_idx\` ON \`privacy_page_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_steps_order_idx\` ON \`privacy_page_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_steps_parent_id_idx\` ON \`privacy_page_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_steps_locale_idx\` ON \`privacy_page_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_order_idx\` ON \`privacy_page_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_parent_id_idx\` ON \`privacy_page_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_path_idx\` ON \`privacy_page_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_process_steps_locale_idx\` ON \`privacy_page_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_entries_order_idx\` ON \`privacy_page_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_entries_parent_id_idx\` ON \`privacy_page_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_entries_locale_idx\` ON \`privacy_page_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_panel_items_order_idx\` ON \`privacy_page_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_panel_items_parent_id_idx\` ON \`privacy_page_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_panel_items_locale_idx\` ON \`privacy_page_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_order_idx\` ON \`privacy_page_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_parent_id_idx\` ON \`privacy_page_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_path_idx\` ON \`privacy_page_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_split_panel_locale_idx\` ON \`privacy_page_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`privacy_page_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`privacy_page_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`privacy_page_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_items_order_idx\` ON \`privacy_page_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_items_parent_id_idx\` ON \`privacy_page_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_items_locale_idx\` ON \`privacy_page_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_order_idx\` ON \`privacy_page_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_parent_id_idx\` ON \`privacy_page_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_path_idx\` ON \`privacy_page_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_use_case_grid_locale_idx\` ON \`privacy_page_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_mission_body_order_idx\` ON \`privacy_page_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_mission_body_parent_id_idx\` ON \`privacy_page_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_mission_body_locale_idx\` ON \`privacy_page_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_story_body_order_idx\` ON \`privacy_page_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_story_body_parent_id_idx\` ON \`privacy_page_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_story_body_locale_idx\` ON \`privacy_page_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_stats_order_idx\` ON \`privacy_page_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_stats_parent_id_idx\` ON \`privacy_page_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_stats_locale_idx\` ON \`privacy_page_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_recognitions_order_idx\` ON \`privacy_page_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_recognitions_parent_id_idx\` ON \`privacy_page_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_recognitions_locale_idx\` ON \`privacy_page_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_contact_body_order_idx\` ON \`privacy_page_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_contact_body_parent_id_idx\` ON \`privacy_page_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_contact_body_locale_idx\` ON \`privacy_page_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_order_idx\` ON \`privacy_page_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_parent_id_idx\` ON \`privacy_page_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_path_idx\` ON \`privacy_page_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`privacy_page_blocks_company_overview_locale_idx\` ON \`privacy_page_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_privacy_page_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_privacy_page_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_privacy_page_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_items_order_idx\` ON \`_privacy_page_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_privacy_page_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_items_locale_idx\` ON \`_privacy_page_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_order_idx\` ON \`_privacy_page_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_parent_id_idx\` ON \`_privacy_page_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_path_idx\` ON \`_privacy_page_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_feature_showcase_locale_idx\` ON \`_privacy_page_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_steps_order_idx\` ON \`_privacy_page_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_steps_parent_id_idx\` ON \`_privacy_page_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_steps_locale_idx\` ON \`_privacy_page_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_order_idx\` ON \`_privacy_page_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_parent_id_idx\` ON \`_privacy_page_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_path_idx\` ON \`_privacy_page_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_process_steps_locale_idx\` ON \`_privacy_page_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_entries_order_idx\` ON \`_privacy_page_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_entries_parent_id_idx\` ON \`_privacy_page_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_entries_locale_idx\` ON \`_privacy_page_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_panel_items_order_idx\` ON \`_privacy_page_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_privacy_page_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_panel_items_locale_idx\` ON \`_privacy_page_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_order_idx\` ON \`_privacy_page_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_parent_id_idx\` ON \`_privacy_page_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_path_idx\` ON \`_privacy_page_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_split_panel_locale_idx\` ON \`_privacy_page_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_privacy_page_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_privacy_page_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_privacy_page_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_items_order_idx\` ON \`_privacy_page_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_privacy_page_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_items_locale_idx\` ON \`_privacy_page_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_order_idx\` ON \`_privacy_page_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_parent_id_idx\` ON \`_privacy_page_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_path_idx\` ON \`_privacy_page_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_use_case_grid_locale_idx\` ON \`_privacy_page_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_mission_body_order_idx\` ON \`_privacy_page_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_privacy_page_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_mission_body_locale_idx\` ON \`_privacy_page_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_story_body_order_idx\` ON \`_privacy_page_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_privacy_page_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_story_body_locale_idx\` ON \`_privacy_page_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_stats_order_idx\` ON \`_privacy_page_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_stats_parent_id_idx\` ON \`_privacy_page_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_stats_locale_idx\` ON \`_privacy_page_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_recognitions_order_idx\` ON \`_privacy_page_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_privacy_page_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_recognitions_locale_idx\` ON \`_privacy_page_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_contact_body_order_idx\` ON \`_privacy_page_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_privacy_page_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_contact_body_locale_idx\` ON \`_privacy_page_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_privacy_page_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_privacy_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_order_idx\` ON \`_privacy_page_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_parent_id_idx\` ON \`_privacy_page_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_path_idx\` ON \`_privacy_page_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_blocks_company_overview_locale_idx\` ON \`_privacy_page_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_items_bullets_order_idx\` ON \`terms_page_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`terms_page_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_items_bullets_locale_idx\` ON \`terms_page_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_items_order_idx\` ON \`terms_page_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_items_parent_id_idx\` ON \`terms_page_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_items_locale_idx\` ON \`terms_page_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_feature_showcase\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_order_idx\` ON \`terms_page_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_parent_id_idx\` ON \`terms_page_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_path_idx\` ON \`terms_page_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_feature_showcase_locale_idx\` ON \`terms_page_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_steps_order_idx\` ON \`terms_page_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_steps_parent_id_idx\` ON \`terms_page_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_steps_locale_idx\` ON \`terms_page_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_process_steps\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_order_idx\` ON \`terms_page_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_parent_id_idx\` ON \`terms_page_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_path_idx\` ON \`terms_page_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_process_steps_locale_idx\` ON \`terms_page_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_entries_order_idx\` ON \`terms_page_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_entries_parent_id_idx\` ON \`terms_page_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_entries_locale_idx\` ON \`terms_page_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_panel_items_order_idx\` ON \`terms_page_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_panel_items_parent_id_idx\` ON \`terms_page_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_panel_items_locale_idx\` ON \`terms_page_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_order_idx\` ON \`terms_page_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_parent_id_idx\` ON \`terms_page_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_path_idx\` ON \`terms_page_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_split_panel_locale_idx\` ON \`terms_page_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`terms_page_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`terms_page_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`terms_page_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_items_order_idx\` ON \`terms_page_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_items_parent_id_idx\` ON \`terms_page_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_items_locale_idx\` ON \`terms_page_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_use_case_grid\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_order_idx\` ON \`terms_page_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_parent_id_idx\` ON \`terms_page_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_path_idx\` ON \`terms_page_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_use_case_grid_locale_idx\` ON \`terms_page_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_mission_body_order_idx\` ON \`terms_page_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_mission_body_parent_id_idx\` ON \`terms_page_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_mission_body_locale_idx\` ON \`terms_page_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_story_body_order_idx\` ON \`terms_page_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_story_body_parent_id_idx\` ON \`terms_page_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_story_body_locale_idx\` ON \`terms_page_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_stats_order_idx\` ON \`terms_page_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_stats_parent_id_idx\` ON \`terms_page_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_stats_locale_idx\` ON \`terms_page_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_recognitions_order_idx\` ON \`terms_page_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_recognitions_parent_id_idx\` ON \`terms_page_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_recognitions_locale_idx\` ON \`terms_page_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_contact_body_order_idx\` ON \`terms_page_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_contact_body_parent_id_idx\` ON \`terms_page_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_contact_body_locale_idx\` ON \`terms_page_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`terms_page_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`terms_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_order_idx\` ON \`terms_page_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_parent_id_idx\` ON \`terms_page_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_path_idx\` ON \`terms_page_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`terms_page_blocks_company_overview_locale_idx\` ON \`terms_page_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_feature_showcase_items_bullets\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_feature_showcase_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_items_bullets_order_idx\` ON \`_terms_page_v_blocks_feature_showcase_items_bullets\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_items_bullets_parent_id_idx\` ON \`_terms_page_v_blocks_feature_showcase_items_bullets\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_items_bullets_locale_idx\` ON \`_terms_page_v_blocks_feature_showcase_items_bullets\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_feature_showcase_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`lead\` text,
  	\`body\` text,
  	\`link_label\` text,
  	\`link_href\` text,
  	\`visual_variant\` text,
  	\`reversed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_feature_showcase\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_items_order_idx\` ON \`_terms_page_v_blocks_feature_showcase_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_items_parent_id_idx\` ON \`_terms_page_v_blocks_feature_showcase_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_items_locale_idx\` ON \`_terms_page_v_blocks_feature_showcase_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_feature_showcase\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_order_idx\` ON \`_terms_page_v_blocks_feature_showcase\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_parent_id_idx\` ON \`_terms_page_v_blocks_feature_showcase\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_path_idx\` ON \`_terms_page_v_blocks_feature_showcase\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_feature_showcase_locale_idx\` ON \`_terms_page_v_blocks_feature_showcase\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_process_steps_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_process_steps\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_steps_order_idx\` ON \`_terms_page_v_blocks_process_steps_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_steps_parent_id_idx\` ON \`_terms_page_v_blocks_process_steps_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_steps_locale_idx\` ON \`_terms_page_v_blocks_process_steps_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_process_steps\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_order_idx\` ON \`_terms_page_v_blocks_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_parent_id_idx\` ON \`_terms_page_v_blocks_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_path_idx\` ON \`_terms_page_v_blocks_process_steps\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_process_steps_locale_idx\` ON \`_terms_page_v_blocks_process_steps\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_split_panel_entries\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`badge\` text,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_entries_order_idx\` ON \`_terms_page_v_blocks_split_panel_entries\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_entries_parent_id_idx\` ON \`_terms_page_v_blocks_split_panel_entries\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_entries_locale_idx\` ON \`_terms_page_v_blocks_split_panel_entries\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_split_panel_panel_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_split_panel\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_panel_items_order_idx\` ON \`_terms_page_v_blocks_split_panel_panel_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_panel_items_parent_id_idx\` ON \`_terms_page_v_blocks_split_panel_panel_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_panel_items_locale_idx\` ON \`_terms_page_v_blocks_split_panel_panel_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_split_panel\` (
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
  	\`style\` text DEFAULT 'tiers',
  	\`panel_title\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_order_idx\` ON \`_terms_page_v_blocks_split_panel\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_parent_id_idx\` ON \`_terms_page_v_blocks_split_panel\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_path_idx\` ON \`_terms_page_v_blocks_split_panel\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_split_panel_locale_idx\` ON \`_terms_page_v_blocks_split_panel\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_use_case_grid_items_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_use_case_grid_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_items_paragraphs_order_idx\` ON \`_terms_page_v_blocks_use_case_grid_items_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_items_paragraphs_parent_id_idx\` ON \`_terms_page_v_blocks_use_case_grid_items_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_items_paragraphs_locale_idx\` ON \`_terms_page_v_blocks_use_case_grid_items_paragraphs\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_use_case_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role\` text,
  	\`title\` text,
  	\`result\` text,
  	\`href\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_use_case_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_items_order_idx\` ON \`_terms_page_v_blocks_use_case_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_items_parent_id_idx\` ON \`_terms_page_v_blocks_use_case_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_items_locale_idx\` ON \`_terms_page_v_blocks_use_case_grid_items\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_use_case_grid\` (
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
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_order_idx\` ON \`_terms_page_v_blocks_use_case_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_parent_id_idx\` ON \`_terms_page_v_blocks_use_case_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_path_idx\` ON \`_terms_page_v_blocks_use_case_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_use_case_grid_locale_idx\` ON \`_terms_page_v_blocks_use_case_grid\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_company_overview_mission_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_mission_body_order_idx\` ON \`_terms_page_v_blocks_company_overview_mission_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_mission_body_parent_id_idx\` ON \`_terms_page_v_blocks_company_overview_mission_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_mission_body_locale_idx\` ON \`_terms_page_v_blocks_company_overview_mission_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_company_overview_story_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_story_body_order_idx\` ON \`_terms_page_v_blocks_company_overview_story_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_story_body_parent_id_idx\` ON \`_terms_page_v_blocks_company_overview_story_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_story_body_locale_idx\` ON \`_terms_page_v_blocks_company_overview_story_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_company_overview_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_stats_order_idx\` ON \`_terms_page_v_blocks_company_overview_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_stats_parent_id_idx\` ON \`_terms_page_v_blocks_company_overview_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_stats_locale_idx\` ON \`_terms_page_v_blocks_company_overview_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_company_overview_recognitions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_recognitions_order_idx\` ON \`_terms_page_v_blocks_company_overview_recognitions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_recognitions_parent_id_idx\` ON \`_terms_page_v_blocks_company_overview_recognitions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_recognitions_locale_idx\` ON \`_terms_page_v_blocks_company_overview_recognitions\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_company_overview_contact_body\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v_blocks_company_overview\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_contact_body_order_idx\` ON \`_terms_page_v_blocks_company_overview_contact_body\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_contact_body_parent_id_idx\` ON \`_terms_page_v_blocks_company_overview_contact_body\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_contact_body_locale_idx\` ON \`_terms_page_v_blocks_company_overview_contact_body\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_terms_page_v_blocks_company_overview\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slot_key\` text,
  	\`label\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`header_alignment\` text,
  	\`mission_title\` text,
  	\`mission_lead\` text,
  	\`story_title\` text,
  	\`story_lead\` text,
  	\`recognition_title\` text,
  	\`contact_title\` text,
  	\`contact_link_label\` text,
  	\`contact_link_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_terms_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_order_idx\` ON \`_terms_page_v_blocks_company_overview\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_parent_id_idx\` ON \`_terms_page_v_blocks_company_overview\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_path_idx\` ON \`_terms_page_v_blocks_company_overview\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_blocks_company_overview_locale_idx\` ON \`_terms_page_v_blocks_company_overview\` (\`_locale\`);`)
  await db.run(sql`DROP INDEX \`_blog_posts_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_feature_pages_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_feature_pages_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_use_case_pages_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_site_settings_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_home_page_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_about_page_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_pricing_page_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_pricing_page_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_privacy_page_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v\` DROP COLUMN \`autosave\`;`)
  await db.run(sql`DROP INDEX \`_terms_page_v_autosave_idx\`;`)
  await db.run(sql`ALTER TABLE \`_terms_page_v\` DROP COLUMN \`autosave\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`blog_posts_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_feature_pages_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_use_case_pages_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`home_page_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`about_page_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`pricing_page_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_pricing_page_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_privacy_page_v_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`terms_page_blocks_company_overview\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_feature_showcase_items_bullets\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_feature_showcase_items\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_feature_showcase\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_process_steps_steps\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_split_panel_entries\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_split_panel_panel_items\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_split_panel\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_use_case_grid_items_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_use_case_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_use_case_grid\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_company_overview_mission_body\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_company_overview_story_body\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_company_overview_stats\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_company_overview_recognitions\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_company_overview_contact_body\`;`)
  await db.run(sql`DROP TABLE \`_terms_page_v_blocks_company_overview\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_autosave_idx\` ON \`_blog_posts_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_feature_pages_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_feature_pages_v_autosave_idx\` ON \`_feature_pages_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_use_case_pages_v_autosave_idx\` ON \`_use_case_pages_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_autosave_idx\` ON \`_site_settings_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_autosave_idx\` ON \`_home_page_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_autosave_idx\` ON \`_about_page_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_pricing_page_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_pricing_page_v_autosave_idx\` ON \`_pricing_page_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_privacy_page_v_autosave_idx\` ON \`_privacy_page_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`_terms_page_v\` ADD \`autosave\` integer;`)
  await db.run(sql`CREATE INDEX \`_terms_page_v_autosave_idx\` ON \`_terms_page_v\` (\`autosave\`);`)
}
