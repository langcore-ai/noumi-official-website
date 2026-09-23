/**
 * 迁移预演：对导出的生产文章 HTML（只读快照）运行转换，输出统计与抽样结果。
 * 用法：bun scripts/rehearse-blog-migration.ts [--slug <slug>] [--samples N]
 *
 * 预演不接触数据库；生产迁移前用它确认转换质量。
 * 快照由以下只读查询生成（写入 .local/reports/prod-html-export.json）：
 *   bunx wrangler d1 execute D1 --remote --json --command "SELECT b.id AS id, b.slug AS slug, \
 *     l.html_content AS html FROM blog_posts b JOIN blog_posts_locales l \
 *     ON l._parent_id=b.id AND l._locale='en' \
 *     WHERE b.render_mode='html' AND l.html_content IS NOT NULL \
 *     AND length(l.html_content)>0 ORDER BY b.id;" > .local/reports/prod-html-export.json
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { convertLegacyBlogArticle } from './lib/legacy-blog-html'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const exportPath = join(repositoryRoot, '.local', 'reports', 'prod-html-export.json')

type ExportRow = { id: number; slug: string; html: string }

const args = process.argv.slice(2)
const slugIndex = args.indexOf('--slug')
const samplesIndex = args.indexOf('--samples')
const slug = slugIndex >= 0 ? args[slugIndex + 1] : undefined
const samples = samplesIndex >= 0 ? Number(args[samplesIndex + 1]) : 3

const raw = readFileSync(exportPath, 'utf8')
const rows = (JSON.parse(raw.slice(raw.indexOf('['))) as Array<{ results: ExportRow[] }>)[0].results
const targets = slug ? rows.filter((row) => row.slug === slug) : rows

if (targets.length === 0) {
  throw new Error(`导出快照中没有匹配文章：${slug ?? '(全部)'}`)
}

const reportDir = join(repositoryRoot, '.local', 'reports')
mkdirSync(reportDir, { recursive: true })

const results = targets.map((row) => {
  const converted = convertLegacyBlogArticle(row.html)

  return {
    slug: row.slug,
    htmlLength: row.html.length,
    markdownLength: converted.markdown.length,
    faqCount: converted.faqItems.length,
    audit: converted.audit,
    markdown: converted.markdown,
    faqItems: converted.faqItems,
  }
})

const withWarnings = results.filter((entry) => entry.audit.warnings.length > 0)
const missingFaq = results.filter((entry) => entry.faqCount === 0)
const totalFaq = results.reduce((sum, entry) => sum + entry.faqCount, 0)
const totalCallouts = results.reduce((sum, entry) => sum + entry.audit.callouts, 0)
const totalImages = results.reduce((sum, entry) => sum + entry.audit.images, 0)
const totalTables = results.reduce((sum, entry) => sum + entry.audit.tables, 0)
const emptyMarkdown = results.filter((entry) => entry.markdownLength < 200)

console.log(`预演文章数：${results.length}`)
console.log(`FAQ 条目合计：${totalFaq}（${missingFaq.length} 篇无 FAQ）`)
console.log(
  `正文图片合计：${totalImages}，表格合计：${totalTables}，callout 合计：${totalCallouts}`,
)
console.log(`带风险提示：${withWarnings.length}`)
console.log(`正文过短（<200 字符）：${emptyMarkdown.length}`)

if (withWarnings.length > 0) {
  console.log('\n── 风险提示明细（前 15 条）──')
  for (const entry of withWarnings.slice(0, 15)) {
    console.log(`⚠️  ${entry.slug}: ${entry.audit.warnings.join(' / ')}`)
  }
}

console.log('\n── 抽样正文 ──')
for (const entry of results.slice(0, Math.max(1, samples))) {
  console.log(
    `\n===== ${entry.slug} (markdown ${entry.markdownLength} 字符, FAQ ${entry.faqCount}) =====`,
  )
  console.log(entry.markdown.slice(0, 1200))
  if (entry.faqItems[0]) {
    console.log('--- FAQ[0] ---')
    console.log(`Q: ${entry.faqItems[0].question}`)
    console.log(`A: ${entry.faqItems[0].answer.slice(0, 240)}`)
  }
}

const reportPath = join(reportDir, 'blog-migration-rehearsal.json')
writeFileSync(
  reportPath,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), count: results.length, results },
    null,
    2,
  ),
  'utf8',
)
console.log(`\n完整预演报告：${reportPath}`)
