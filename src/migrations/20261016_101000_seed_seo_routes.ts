import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

// Empty drafts preserve the existing metadata until an editor explicitly publishes overrides.
const paths = [
  '/',
  '/about',
  '/features',
  '/features/specialist-level-expertise',
  '/features/full-project-fluency',
  '/features/signature-level-fluency',
  '/use-cases',
  '/pricing',
  '/faqs',
  '/terms',
  '/privacy',
  '/blog',
  '/links',
  '/contact',
]
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const path of paths) {
    await db.run(
      sql`INSERT INTO seo_configs (path, _status) VALUES (${path}, 'draft') ON CONFLICT(path) DO NOTHING`,
    )
  }
  // Draft lists read versions, so each preloaded route needs an initial version.
  await db.run(sql`INSERT INTO _seo_configs_v (parent_id, version_path, version__status, version_created_at, version_updated_at, latest)
    SELECT id, path, _status, created_at, updated_at, 1 FROM seo_configs
    WHERE NOT EXISTS (SELECT 1 FROM _seo_configs_v WHERE parent_id = seo_configs.id)`)
}
export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep edited content when rolling back seed data; the schema migration owns table removal.
}
