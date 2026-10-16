import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE seo_configs ADD og_image_url text`)
  await db.run(sql`ALTER TABLE seo_configs ADD json_ld text`)
  await db.run(sql`ALTER TABLE _seo_configs_v ADD version_og_image_url text`)
  await db.run(sql`ALTER TABLE _seo_configs_v ADD version_json_ld text`)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE _seo_configs_v DROP COLUMN version_json_ld`)
  await db.run(sql`ALTER TABLE _seo_configs_v DROP COLUMN version_og_image_url`)
  await db.run(sql`ALTER TABLE seo_configs DROP COLUMN json_ld`)
  await db.run(sql`ALTER TABLE seo_configs DROP COLUMN og_image_url`)
}
