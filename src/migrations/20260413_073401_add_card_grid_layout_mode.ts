import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/** 需要补齐布局模式字段的卡片网格表。 */
const CARD_GRID_SECTION_TABLES = [
  'blog_posts_blocks_card_grid_section',
  '_blog_posts_v_blocks_card_grid_section',
  'feature_pages_blocks_card_grid_section',
  '_feature_pages_v_blocks_card_grid_section',
  'use_case_pages_blocks_card_grid_section',
  '_use_case_pages_v_blocks_card_grid_section',
  'home_page_blocks_card_grid_section',
  '_home_page_v_blocks_card_grid_section',
  'about_page_blocks_card_grid_section',
  '_about_page_v_blocks_card_grid_section',
  'pricing_page_blocks_card_grid_section',
  '_pricing_page_v_blocks_card_grid_section',
  'privacy_page_blocks_card_grid_section',
  '_privacy_page_v_blocks_card_grid_section',
  'terms_page_blocks_card_grid_section',
  '_terms_page_v_blocks_card_grid_section',
] as const

/** 目标字段名，统一集中避免 up/down 漏改。 */
const LAYOUT_MODE_COLUMN = 'layout_mode'

/**
 * 检查目标表是否已存在。
 * 空库初始化时，早期 migration 可能还没创建这些表，需要安全跳过。
 */
async function hasTable(args: MigrateUpArgs | MigrateDownArgs, tableName: string): Promise<boolean> {
  const result = await args.db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`),
  )

  return Array.isArray(result.rows) && result.rows.length > 0
}

/**
 * 检查字段是否已存在，避免重复 ADD / DROP 导致迁移中断。
 */
async function hasColumn(
  args: MigrateUpArgs | MigrateDownArgs,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const result = await args.db.run(sql.raw(`PRAGMA table_info(\`${tableName}\`);`))

  return Array.isArray(result.rows) && result.rows.some((row) => row.name === columnName)
}

/**
 * 仅在旧库缺字段时补齐，避免影响空库首轮迁移。
 */
async function addLayoutModeColumnIfMissing(
  args: MigrateUpArgs,
  tableName: string,
): Promise<void> {
  // 表不存在说明后续 migration 会负责建表，这里不提前失败。
  if (!(await hasTable(args, tableName))) {
    return
  }

  if (await hasColumn(args, tableName, LAYOUT_MODE_COLUMN)) {
    return
  }

  await args.db.run(sql.raw(`ALTER TABLE \`${tableName}\` ADD \`${LAYOUT_MODE_COLUMN}\` text DEFAULT 'auto';`))
}

/**
 * 回滚时按存在性删除字段，兼容部分环境已经跳过 up 的情况。
 */
async function dropLayoutModeColumnIfExists(
  args: MigrateDownArgs,
  tableName: string,
): Promise<void> {
  if (!(await hasTable(args, tableName))) {
    return
  }

  if (!(await hasColumn(args, tableName, LAYOUT_MODE_COLUMN))) {
    return
  }

  await args.db.run(sql.raw(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${LAYOUT_MODE_COLUMN}\`;`))
}

/**
 * 兼容旧库：已有 card grid 表时补齐布局模式字段。
 */
export async function up(args: MigrateUpArgs): Promise<void> {
  for (const tableName of CARD_GRID_SECTION_TABLES) {
    // 顺序执行即可，避免 D1 在 schema 变更时并发产生额外干扰。
    await addLayoutModeColumnIfMissing(args, tableName)
  }
}

/**
 * 回滚布局模式字段。
 */
export async function down(args: MigrateDownArgs): Promise<void> {
  for (const tableName of CARD_GRID_SECTION_TABLES) {
    await dropLayoutModeColumnIfExists(args, tableName)
  }
}
