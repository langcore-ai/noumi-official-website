import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * 迁移查询结果行
 */
type MigrationRow = Record<string, null | number | string>

/**
 * 执行原始 SQL 并返回行数据
 * @param db 当前迁移事务中的数据库实例
 * @param statement 原始 SQL
 * @returns 查询结果行
 */
async function queryRows(db: MigrateUpArgs['db'], statement: string): Promise<MigrationRow[]> {
  // D1 的 db.run 仅返回写操作响应；查询类语句需要使用 db.all 才能拿到结果集。
  const result = (await db.all(sql.raw(statement))) as MigrationRow[] | null | undefined
  return Array.isArray(result) ? result : []
}

/**
 * 判断表是否存在
 * @param db 当前迁移事务中的数据库实例
 * @param tableName 表名
 * @returns 是否存在
 */
async function tableExists(db: MigrateUpArgs['db'], tableName: string): Promise<boolean> {
  const rows = await queryRows(
    db,
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`,
  )

  return rows.length > 0
}

/**
 * 判断索引是否存在
 * @param db 当前迁移事务中的数据库实例
 * @param indexName 索引名
 * @returns 是否存在
 */
async function indexExists(db: MigrateUpArgs['db'], indexName: string): Promise<boolean> {
  const rows = await queryRows(
    db,
    `SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}' LIMIT 1;`,
  )

  return rows.length > 0
}

/**
 * 判断列是否存在
 * @param db 当前迁移事务中的数据库实例
 * @param tableName 表名
 * @param columnName 列名
 * @returns 是否存在
 */
async function columnExists(
  db: MigrateUpArgs['db'],
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const rows = await queryRows(db, `PRAGMA table_info(\`${tableName}\`);`)

  return rows.some((row) => row.name === columnName)
}

/**
 * 确保指定索引存在
 * @param db 当前迁移事务中的数据库实例
 * @param indexName 索引名
 * @param statement 建索引 SQL
 */
async function ensureIndex(
  db: MigrateUpArgs['db'],
  indexName: string,
  statement: string,
): Promise<void> {
  if (await indexExists(db, indexName)) {
    return
  }

  // SQLite / D1 原生支持 IF NOT EXISTS，比先查后建更稳妥
  await db.run(sql.raw(statement))
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 允许迁移在“执行到一半后再次重跑”时继续补齐剩余步骤
  if (!(await tableExists(db, 'media_locales'))) {
    await db.run(sql`CREATE TABLE \`media_locales\` (
    	\`alt\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
    `)
  }

  await ensureIndex(
    db,
    'media_locales_locale_parent_id_unique',
    'CREATE UNIQUE INDEX IF NOT EXISTS `media_locales_locale_parent_id_unique` ON `media_locales` (`_locale`,`_parent_id`);',
  )

  // 将旧的媒体 alt 回填到默认语言，避免迁移后丢失无障碍文案
  if (await columnExists(db, 'media', 'alt')) {
    await db.run(sql.raw(`
      INSERT INTO media_locales ("alt", "_locale", "_parent_id")
      SELECT media.alt, 'en', media.id
      FROM media
      WHERE media.alt IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM media_locales
          WHERE media_locales._parent_id = media.id
            AND media_locales._locale = 'en'
        );
    `))
  }

  // blog_posts 已经可能在上一次失败时被重建，这里按列存在性判断是否还需要继续裁剪旧字段
  if (await columnExists(db, 'blog_posts', 'og_image_id')) {
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
  }

  await ensureIndex(
    db,
    'blog_posts_slug_idx',
    'CREATE UNIQUE INDEX IF NOT EXISTS `blog_posts_slug_idx` ON `blog_posts` (`slug`);',
  )
  await ensureIndex(
    db,
    'blog_posts_updated_at_idx',
    'CREATE INDEX IF NOT EXISTS `blog_posts_updated_at_idx` ON `blog_posts` (`updated_at`);',
  )
  await ensureIndex(
    db,
    'blog_posts_created_at_idx',
    'CREATE INDEX IF NOT EXISTS `blog_posts_created_at_idx` ON `blog_posts` (`created_at`);',
  )

  if (!(await columnExists(db, 'blog_posts_locales', 'og_image_id'))) {
    await db.run(sql`ALTER TABLE \`blog_posts_locales\` ADD \`og_image_id\` integer REFERENCES media(id);`)
  }

  await ensureIndex(
    db,
    'blog_posts_og_image_idx',
    'CREATE INDEX IF NOT EXISTS `blog_posts_og_image_idx` ON `blog_posts_locales` (`og_image_id`,`_locale`);',
  )

  if (await columnExists(db, 'feature_pages', 'og_image_id')) {
    // 先把旧值回填到默认语言，再移除基础表列
    if (!(await columnExists(db, 'feature_pages_locales', 'og_image_id'))) {
      await db.run(sql`ALTER TABLE \`feature_pages_locales\` ADD \`og_image_id\` integer REFERENCES media(id);`)
    }

    await db.run(sql.raw(`
      UPDATE feature_pages_locales
      SET og_image_id = (
        SELECT feature_pages.og_image_id
        FROM feature_pages
        WHERE feature_pages.id = feature_pages_locales._parent_id
      )
      WHERE feature_pages_locales._locale = 'en'
        AND feature_pages_locales.og_image_id IS NULL
        AND EXISTS (
          SELECT 1
          FROM feature_pages
          WHERE feature_pages.id = feature_pages_locales._parent_id
            AND feature_pages.og_image_id IS NOT NULL
        );
    `))

    await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
    await db.run(sql`PRAGMA foreign_keys=ON;`)
  } else if (!(await columnExists(db, 'feature_pages_locales', 'og_image_id'))) {
    await db.run(sql`ALTER TABLE \`feature_pages_locales\` ADD \`og_image_id\` integer REFERENCES media(id);`)
  }

  await ensureIndex(
    db,
    'feature_pages_slug_idx',
    'CREATE UNIQUE INDEX IF NOT EXISTS `feature_pages_slug_idx` ON `feature_pages` (`slug`);',
  )
  await ensureIndex(
    db,
    'feature_pages_updated_at_idx',
    'CREATE INDEX IF NOT EXISTS `feature_pages_updated_at_idx` ON `feature_pages` (`updated_at`);',
  )
  await ensureIndex(
    db,
    'feature_pages_created_at_idx',
    'CREATE INDEX IF NOT EXISTS `feature_pages_created_at_idx` ON `feature_pages` (`created_at`);',
  )
  await ensureIndex(
    db,
    'feature_pages_og_image_idx',
    'CREATE INDEX IF NOT EXISTS `feature_pages_og_image_idx` ON `feature_pages_locales` (`og_image_id`,`_locale`);',
  )

  if (await columnExists(db, 'use_case_pages', 'og_image_id')) {
    if (!(await columnExists(db, 'use_case_pages_locales', 'og_image_id'))) {
      await db.run(sql`ALTER TABLE \`use_case_pages_locales\` ADD \`og_image_id\` integer REFERENCES media(id);`)
    }

    await db.run(sql.raw(`
      UPDATE use_case_pages_locales
      SET og_image_id = (
        SELECT use_case_pages.og_image_id
        FROM use_case_pages
        WHERE use_case_pages.id = use_case_pages_locales._parent_id
      )
      WHERE use_case_pages_locales._locale = 'en'
        AND use_case_pages_locales.og_image_id IS NULL
        AND EXISTS (
          SELECT 1
          FROM use_case_pages
          WHERE use_case_pages.id = use_case_pages_locales._parent_id
            AND use_case_pages.og_image_id IS NOT NULL
        );
    `))

    await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
    await db.run(sql`PRAGMA foreign_keys=ON;`)
  } else if (!(await columnExists(db, 'use_case_pages_locales', 'og_image_id'))) {
    await db.run(sql`ALTER TABLE \`use_case_pages_locales\` ADD \`og_image_id\` integer REFERENCES media(id);`)
  }

  await ensureIndex(
    db,
    'use_case_pages_slug_idx',
    'CREATE UNIQUE INDEX IF NOT EXISTS `use_case_pages_slug_idx` ON `use_case_pages` (`slug`);',
  )
  await ensureIndex(
    db,
    'use_case_pages_updated_at_idx',
    'CREATE INDEX IF NOT EXISTS `use_case_pages_updated_at_idx` ON `use_case_pages` (`updated_at`);',
  )
  await ensureIndex(
    db,
    'use_case_pages_created_at_idx',
    'CREATE INDEX IF NOT EXISTS `use_case_pages_created_at_idx` ON `use_case_pages` (`created_at`);',
  )
  await ensureIndex(
    db,
    'use_case_pages_og_image_idx',
    'CREATE INDEX IF NOT EXISTS `use_case_pages_og_image_idx` ON `use_case_pages_locales` (`og_image_id`,`_locale`);',
  )

  if (await columnExists(db, 'site_settings', 'default_og_image_id')) {
    if (!(await columnExists(db, 'site_settings_locales', 'default_og_image_id'))) {
      await db.run(
        sql`ALTER TABLE \`site_settings_locales\` ADD \`default_og_image_id\` integer REFERENCES media(id);`,
      )
    }

    await db.run(sql.raw(`
      UPDATE site_settings_locales
      SET default_og_image_id = (
        SELECT site_settings.default_og_image_id
        FROM site_settings
        WHERE site_settings.id = site_settings_locales._parent_id
      )
      WHERE site_settings_locales._locale = 'en'
        AND site_settings_locales.default_og_image_id IS NULL
        AND EXISTS (
          SELECT 1
          FROM site_settings
          WHERE site_settings.id = site_settings_locales._parent_id
            AND site_settings.default_og_image_id IS NOT NULL
        );
    `))

    await db.run(sql`PRAGMA foreign_keys=OFF;`)
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
    await db.run(sql`PRAGMA foreign_keys=ON;`)
  } else if (!(await columnExists(db, 'site_settings_locales', 'default_og_image_id'))) {
    await db.run(
      sql`ALTER TABLE \`site_settings_locales\` ADD \`default_og_image_id\` integer REFERENCES media(id);`,
    )
  }

  await ensureIndex(
    db,
    'site_settings_default_og_image_idx',
    'CREATE INDEX IF NOT EXISTS `site_settings_default_og_image_idx` ON `site_settings_locales` (`default_og_image_id`,`_locale`);',
  )

  if (await columnExists(db, 'media', 'alt')) {
    await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`alt\`;`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blog_posts_locales\` (
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
  await db.run(sql`INSERT INTO \`__new_blog_posts_locales\`("title", "meta_title", "meta_description", "excerpt", "author", "meta_image_id", "id", "_locale", "_parent_id") SELECT "title", "meta_title", "meta_description", "excerpt", "author", "meta_image_id", "id", "_locale", "_parent_id" FROM \`blog_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_blog_posts_locales\` RENAME TO \`blog_posts_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`blog_posts_meta_meta_image_idx\` ON \`blog_posts_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_locales_locale_parent_id_unique\` ON \`blog_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_feature_pages_locales\` (
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
  await db.run(sql`INSERT INTO \`__new_feature_pages_locales\`("meta_title", "meta_description", "hero_label", "hero_title", "hero_emphasis", "hero_lead", "cta_title", "cta_description", "meta_image_id", "id", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "hero_label", "hero_title", "hero_emphasis", "hero_lead", "cta_title", "cta_description", "meta_image_id", "id", "_locale", "_parent_id" FROM \`feature_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`feature_pages_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_feature_pages_locales\` RENAME TO \`feature_pages_locales\`;`)
  await db.run(sql`CREATE INDEX \`feature_pages_meta_meta_image_idx\` ON \`feature_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`feature_pages_locales_locale_parent_id_unique\` ON \`feature_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_use_case_pages_locales\` (
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
  await db.run(sql`INSERT INTO \`__new_use_case_pages_locales\`("meta_title", "meta_description", "role_label", "hero_title", "hero_lead", "meta_image_id", "id", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "role_label", "hero_title", "hero_lead", "meta_image_id", "id", "_locale", "_parent_id" FROM \`use_case_pages_locales\`;`)
  await db.run(sql`DROP TABLE \`use_case_pages_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_use_case_pages_locales\` RENAME TO \`use_case_pages_locales\`;`)
  await db.run(sql`CREATE INDEX \`use_case_pages_meta_meta_image_idx\` ON \`use_case_pages_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`use_case_pages_locales_locale_parent_id_unique\` ON \`use_case_pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_site_settings_locales\` (
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
  await db.run(sql`INSERT INTO \`__new_site_settings_locales\`("default_description", "nav_cta_text", "nav_cta_href", "footer_description", "footer_copyright", "home_hero_label", "home_hero_title", "home_hero_subtitle", "home_hero_intro", "home_hero_roles", "home_hero_primary_cta_label", "home_hero_primary_cta_href", "home_hero_secondary_cta_label", "home_hero_secondary_cta_href", "home_feature_intro", "home_final_cta_title", "home_final_cta_description", "home_final_cta_primary_cta_label", "home_final_cta_primary_cta_href", "home_final_cta_secondary_cta_label", "home_final_cta_secondary_cta_href", "meta_title", "meta_description", "meta_image_id", "id", "_locale", "_parent_id") SELECT "default_description", "nav_cta_text", "nav_cta_href", "footer_description", "footer_copyright", "home_hero_label", "home_hero_title", "home_hero_subtitle", "home_hero_intro", "home_hero_roles", "home_hero_primary_cta_label", "home_hero_primary_cta_href", "home_hero_secondary_cta_label", "home_hero_secondary_cta_href", "home_feature_intro", "home_final_cta_title", "home_final_cta_description", "home_final_cta_primary_cta_label", "home_final_cta_primary_cta_href", "home_final_cta_secondary_cta_label", "home_final_cta_secondary_cta_href", "meta_title", "meta_description", "meta_image_id", "id", "_locale", "_parent_id" FROM \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings_locales\` RENAME TO \`site_settings_locales\`;`)
  await db.run(sql`CREATE INDEX \`site_settings_meta_meta_image_idx\` ON \`site_settings_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`alt\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`blog_posts\` ADD \`og_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`blog_posts_og_image_idx\` ON \`blog_posts\` (\`og_image_id\`);`)
  await db.run(sql`ALTER TABLE \`feature_pages\` ADD \`og_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`feature_pages_og_image_idx\` ON \`feature_pages\` (\`og_image_id\`);`)
  await db.run(sql`ALTER TABLE \`use_case_pages\` ADD \`og_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`use_case_pages_og_image_idx\` ON \`use_case_pages\` (\`og_image_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`default_og_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_og_image_idx\` ON \`site_settings\` (\`default_og_image_id\`);`)
}
