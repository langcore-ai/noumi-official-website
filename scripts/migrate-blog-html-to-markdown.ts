/**
 * Blog 旧版整页 HTML → Markdown 迁移脚本
 *
 * 把 `render_mode = 'html'` 的文章转换为 `markdownContent` + `faqItems`，
 * 并切换为 Markdown 渲染模式；`htmlContent` 原值保留作为回滚备份。
 *
 * 用法：
 *   bun scripts/migrate-blog-html-to-markdown.ts                    # 本地 D1，dry-run，仅输出审计报告
 *   bun scripts/migrate-blog-html-to-markdown.ts --write            # 本地 D1，写回转换结果
 *   bun scripts/migrate-blog-html-to-markdown.ts --remote           # 生产 D1（wrangler --remote），dry-run
 *   bun scripts/migrate-blog-html-to-markdown.ts --remote --write   # 生产 D1，写回（危险，先看 dry-run 报告）
 *
 * 可选参数：--limit N、--slug <slug>、--report <path>
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { convertLegacyBlogArticle, type LegacyConversionAudit } from './lib/legacy-blog-html'
import type { Config } from '../src/payload-types'

/** 已配置的 Payload locale 联合类型。 */
type PayloadLocale = Config['locale']

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/** 单篇文章的审计结果。 */
type PostAudit = {
  id: number
  slug: string
  locale: string
  htmlLength: number
  markdownLength: number
  audit: LegacyConversionAudit
}

/** 待转换的原始记录。 */
type SourcePost = {
  id: number
  slug: string
  locale: string
  html: string
}

/** 转换结果。 */
type ConvertedPost = PostAudit & {
  markdown: string
  faqItems: Array<{ answer: string; question: string }>
}

/**
 * 转换单篇文章并输出审计信息。
 * @param post 原始记录
 * @returns 转换结果
 */
function convertPost(post: SourcePost): ConvertedPost {
  const { markdown, faqItems, audit } = convertLegacyBlogArticle(post.html)

  return {
    id: post.id,
    slug: post.slug,
    locale: post.locale,
    htmlLength: post.html.length,
    markdownLength: markdown.length,
    audit,
    markdown,
    faqItems,
  }
}

/**
 * 通过 Payload Local API 读取本地 D1 的待迁移文章。
 * @returns 待转换记录
 */
async function readLocalSources(): Promise<SourcePost[]> {
  // 动态导入：payload.config 顶层会启动 Wrangler/Miniflare 本地代理，
  // --remote 模式必须避免该副作用，因此不能在文件顶部静态导入。
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config.js')
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'blog-posts',
    depth: 0,
    limit: 1000,
    pagination: false,
    locale: 'all',
    overrideAccess: true,
    where: { renderMode: { equals: 'html' } },
  })

  const sources: SourcePost[] = []

  for (const doc of docs) {
    const htmlByLocale = (doc as { htmlContent?: unknown }).htmlContent

    if (!htmlByLocale || typeof htmlByLocale !== 'object') {
      continue
    }

    for (const [locale, value] of Object.entries(htmlByLocale as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim()) {
        sources.push({ id: doc.id, slug: String(doc.slug ?? ''), locale, html: value })
      }
    }
  }

  return sources
}

/**
 * 通过 wrangler 远程 D1 读取待迁移文章。
 * @returns 待转换记录
 */
function readRemoteSources(): SourcePost[] {
  const sql = [
    'SELECT b.id AS id, b.slug AS slug, l._locale AS locale, l.html_content AS html',
    'FROM blog_posts b',
    'JOIN blog_posts_locales l ON l._parent_id = b.id',
    "WHERE b.render_mode = 'html' AND l.html_content IS NOT NULL AND length(l.html_content) > 0",
    'ORDER BY b.id, l._locale',
  ].join(' ')

  const result = spawnSync(
    'bunx',
    ['wrangler', 'd1', 'execute', 'D1', '--remote', '--json', '--command', sql],
    { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )

  if (result.status !== 0) {
    throw new Error(`wrangler 读取失败：${result.stderr || result.stdout}`)
  }

  const payload = JSON.parse(result.stdout) as Array<{ results?: SourcePost[] }>

  return payload[0]?.results ?? []
}

/**
 * 写回本地 D1（Payload Local API）。
 * @param converted 转换结果
 * @returns 写回条数
 */
async function writeLocal(converted: ConvertedPost[]): Promise<number> {
  // 动态导入原因同 readLocalSources：避免 --remote 模式加载本地代理副作用。
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config.js')
  const payload = await getPayload({ config })

  for (const post of converted) {
    await payload.update({
      collection: 'blog-posts',
      id: post.id,
      data: {
        markdownContent: post.markdown,
        faqItems: post.faqItems,
        renderMode: 'markdown',
      },
      locale: post.locale as PayloadLocale,
      overrideAccess: true,
      depth: 0,
    })
  }

  return converted.length
}

/**
 * 通过 wrangler 远程 D1 写回（生成 SQL 文件后执行）。
 * @param converted 转换结果
 * @returns 写回条数
 */
function writeRemote(converted: ConvertedPost[]): number {
  const escape = (value: string) => value.replace(/'/g, "''")
  const statements: string[] = []
  const reportDir = join(repositoryRoot, '.local', 'reports')

  mkdirSync(reportDir, { recursive: true })

  for (const post of converted) {
    statements.push(
      `UPDATE blog_posts_locales SET markdown_content = '${escape(post.markdown)}' WHERE _parent_id = ${post.id} AND _locale = '${escape(post.locale)}';`,
    )
    statements.push(
      `DELETE FROM blog_posts_faq_items WHERE _parent_id = ${post.id} AND _locale = '${escape(post.locale)}';`,
    )

    post.faqItems.forEach((item, index) => {
      const id = `${post.locale}-${post.id}-faq-${index + 1}`
      statements.push(
        `INSERT INTO blog_posts_faq_items (_order, _parent_id, _locale, id, question, answer) VALUES (${index + 1}, ${post.id}, '${escape(post.locale)}', '${escape(id)}', '${escape(item.question)}', '${escape(item.answer)}');`,
      )
    })

    statements.push(`UPDATE blog_posts SET render_mode = 'markdown' WHERE id = ${post.id};`)
  }

  const sqlPath = join(reportDir, `blog-markdown-migration-${Date.now()}.sql`)
  writeFileSync(sqlPath, `${statements.join('\n')}\n`, 'utf8')

  const result = spawnSync(
    'bunx',
    ['wrangler', 'd1', 'execute', 'D1', '--remote', '--file', sqlPath],
    { cwd: repositoryRoot, encoding: 'utf8', stdio: 'inherit' },
  )

  if (result.status !== 0) {
    throw new Error(`wrangler 写入失败，SQL 已保留在 ${sqlPath}`)
  }

  return converted.length
}

/**
 * 输出审计摘要。
 * @param audits 审计结果
 */
function printAudit(audits: PostAudit[]): void {
  const flagged = audits.filter((entry) => entry.audit.warnings.length > 0)

  console.log('')
  console.log(`共 ${audits.length} 条记录待迁移，${flagged.length} 条带风险提示。`)
  console.log('')

  for (const entry of flagged) {
    console.log(`⚠️  #${entry.id} ${entry.slug || '(无 slug)'} [${entry.locale}]`)
    for (const warning of entry.audit.warnings) {
      console.log(`     - ${warning}`)
    }
  }

  if (flagged.length > 0) {
    console.log('')
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const shouldWrite = args.includes('--write')
  const useRemote = args.includes('--remote')
  const limitIndex = args.indexOf('--limit')
  const slugIndex = args.indexOf('--slug')
  const reportIndex = args.indexOf('--report')
  const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : undefined
  const slug = slugIndex >= 0 ? args[slugIndex + 1] : undefined

  const target = useRemote ? '生产 D1 (wrangler --remote)' : '本地 D1 (Payload Local API)'
  console.log(`数据源：${target}`)
  console.log(`模式：${shouldWrite ? '写回' : 'dry-run（只报告，不写库）'}`)

  let sources = useRemote ? readRemoteSources() : await readLocalSources()

  if (slug) {
    sources = sources.filter((source) => source.slug === slug)
  }
  if (limit && Number.isFinite(limit)) {
    sources = sources.slice(0, limit)
  }

  if (sources.length === 0) {
    console.log('没有找到 render_mode = html 的文章，无需迁移。')
    return
  }

  const converted = sources.map(convertPost)
  const audits: PostAudit[] = converted.map(
    ({ markdown: _markdown, faqItems: _faq, ...audit }) => audit,
  )

  printAudit(audits)

  const reportDir = join(repositoryRoot, '.local', 'reports')
  mkdirSync(reportDir, { recursive: true })
  const reportPath =
    reportIndex >= 0
      ? args[reportIndex + 1]
      : join(
          reportDir,
          `blog-markdown-migration-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        )
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        target,
        mode: shouldWrite ? 'write' : 'dry-run',
        generatedAt: new Date().toISOString(),
        audits,
      },
      null,
      2,
    ),
    'utf8',
  )
  console.log(`审计报告：${reportPath}`)

  if (!shouldWrite) {
    console.log('dry-run 结束；确认报告后加 --write 执行迁移。')
    return
  }

  const written = useRemote ? writeRemote(converted) : await writeLocal(converted)
  console.log(`已迁移 ${written} 条记录到 Markdown 模式（htmlContent 原值保留）。`)
}

await main()
process.exit(0)
