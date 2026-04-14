import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`feature_pages_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_feature_pages_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`use_case_pages_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`pricing_page_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_pricing_page_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`privacy_page_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`terms_page_blocks_cta_section\` ADD \`footnote\` text;`)
  await db.run(sql`ALTER TABLE \`_terms_page_v_blocks_cta_section\` ADD \`footnote\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`blog_posts_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_blog_posts_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`feature_pages_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_feature_pages_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`use_case_pages_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_use_case_pages_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`home_page_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`about_page_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`pricing_page_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_pricing_page_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`privacy_page_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_privacy_page_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`terms_page_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
  await db.run(sql`ALTER TABLE \`_terms_page_v_blocks_cta_section\` DROP COLUMN \`footnote\`;`)
}
