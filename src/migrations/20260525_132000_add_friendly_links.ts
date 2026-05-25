import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 新增友情链接集合。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`friendly_links\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`description\` text NOT NULL,
    \`href\` text NOT NULL,
    \`avatar_id\` integer,
    \`sort_order\` numeric DEFAULT 0,
    \`is_active\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`friendly_links_avatar_idx\` ON \`friendly_links\` (\`avatar_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`friendly_links_sort_order_idx\` ON \`friendly_links\` (\`sort_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`friendly_links_is_active_idx\` ON \`friendly_links\` (\`is_active\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`friendly_links_updated_at_idx\` ON \`friendly_links\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`friendly_links_created_at_idx\` ON \`friendly_links\` (\`created_at\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`friendly_links_id\` integer REFERENCES \`friendly_links\`(\`id\`) ON UPDATE no action ON DELETE cascade;`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_friendly_links_id_idx\` ON \`payload_locked_documents_rels\` (\`friendly_links_id\`);`,
  )
}

/**
 * 回滚友情链接集合。
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_friendly_links_id_idx\`;`)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`friendly_links_id\`;`,
  )
  await db.run(sql`DROP INDEX IF EXISTS \`friendly_links_avatar_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`friendly_links_sort_order_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`friendly_links_is_active_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`friendly_links_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`friendly_links_created_at_idx\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`friendly_links\`;`)
}
