/**
 * 旧版整页 HTML 文章 → Markdown 的结构化转换。
 *
 * 生产环境的 106 篇文章是"自带 <style>/<script> 的整页 HTML"，正文位于
 * `.post-body`，FAQ 位于 `.faq-wrap`，相关阅读与页头/页脚分别由 CMS 字段
 * 和站点 chrome 负责。这里只抽取需要长期维护的部分：
 * - 正文 → Markdown（callout 转成引用块）
 * - FAQ → 结构化 `faqItems`（回答转为 Markdown）
 * 其余脚手架（h1、面包屑、meta、cover、related、style/script）一律丢弃。
 */
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

/** 单篇转换的审计信息。 */
export type LegacyConversionAudit = {
  /** 被丢弃的整块元素计数 */
  removed: {
    scripts: number
    styles: number
    iframes: number
    head: number
    scaffold: number
  }
  /** 正文中保留的图片数 */
  images: number
  /** 正文中保留的表格数 */
  tables: number
  /** 正文中保留的标题数 */
  headings: number
  /** 抽取到的 FAQ 条目数 */
  faqCount: number
  /** 转为引用块的 callout 数 */
  callouts: number
  /** 需要人工确认的风险提示 */
  warnings: string[]
}

/** FAQ 条目（Markdown 回答）。 */
export type LegacyFaqItem = {
  question: string
  answer: string
}

/** 单篇转换结果。 */
export type LegacyConversionResult = {
  markdown: string
  faqItems: LegacyFaqItem[]
  audit: LegacyConversionAudit
}

/** 抽取 HTML 实体并压平空白。 */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 找到与起始 `<div` 配对的结束标签位置。
 * @param html 完整 HTML
 * @param openIndex 起始 `<div` 的下标
 * @returns 结束标签之后的下标；未闭合时返回 html.length
 */
function findDivEnd(html: string, openIndex: number): number {
  const pattern = /<div\b[^>]*>|<\/div>/gi
  pattern.lastIndex = openIndex
  let depth = 0
  let match: null | RegExpExecArray = null

  while ((match = pattern.exec(html))) {
    if (match[0].startsWith('</')) {
      depth -= 1

      if (depth === 0) {
        return pattern.lastIndex
      }
    } else {
      depth += 1
    }
  }

  return html.length
}

/**
 * 按 class 词元抽取 div 块（含内容与在原文中的位置）。
 * 词元按空白切分后精确比较，避免 `faq-a` 命中 `faq-a-inner`。
 * @param html 完整 HTML
 * @param classToken 需要精确匹配的 class 词元
 * @returns 块列表
 */
function extractDivBlocks(
  html: string,
  classToken: string,
): Array<{ inner: string; start: number; end: number }> {
  const blocks: Array<{ inner: string; start: number; end: number }> = []
  const open = /<div\b([^>]*)>/gi
  let match: null | RegExpExecArray = null

  while ((match = open.exec(html))) {
    const classAttr = match[1].match(/class="([^"]*)"/i)?.[1] ?? ''

    if (!classAttr.split(/\s+/).includes(classToken)) {
      continue
    }

    const start = match.index
    const innerStart = start + match[0].length
    const end = findDivEnd(html, start)

    blocks.push({ end, inner: html.slice(innerStart, end - '</div>'.length), start })
    open.lastIndex = end
  }

  return blocks
}

/** 需要转成引用块的 callout 类名。 */
const CALLOUT_CLASS_PATTERN = /(^|\s)post-(callout|tip|example|comparison)(\s|$)/

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
})

turndown.use(gfm)
turndown.remove(['script', 'style', 'noscript', 'head', 'nav', 'footer', 'button'])
turndown.addRule('legacy-callout', {
  filter: (node) =>
    node.nodeName === 'DIV' && CALLOUT_CLASS_PATTERN.test(node.getAttribute('class') ?? ''),
  replacement: (content) =>
    `\n\n> ${content
      .trim()
      .replace(/\n{2,}/g, '\n>\n> ')
      .replace(/\n/g, '\n> ')}\n\n`,
})

/**
 * 清理 Markdown 空白与占位字符。
 * @param markdown 原始 Markdown
 * @returns 规整后的 Markdown
 */
function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 提取 FAQ 并返回去掉 FAQ 区块后的 HTML。
 * @param html 已剥离 script/style 的 HTML
 * @returns FAQ 条目与剩余 HTML
 */
function extractFaq(html: string): { faqItems: LegacyFaqItem[]; html: string } {
  const faqItems: LegacyFaqItem[] = []
  const wrapBlocks = extractDivBlocks(html, 'faq-wrap')
  let remaining = html

  for (const wrap of wrapBlocks) {
    for (const item of extractDivBlocks(wrap.inner, 'faq-item')) {
      const questionMatch = item.inner.match(/<button class="faq-q"[^>]*>([\s\S]*?)<\/button>/i)
      // 原型按钮里的 +/- 图标不是问题文案的一部分。
      const question = questionMatch
        ? textOf(questionMatch[1].replace(/<span class="faq-icon"[^>]*>[\s\S]*?<\/span>/i, ''))
        : ''

      const innerAnswer = extractDivBlocks(item.inner, 'faq-a-inner')[0]
      const answerBlock = innerAnswer ?? extractDivBlocks(item.inner, 'faq-a')[0]
      const answer = answerBlock ? normalizeMarkdown(turndown.turndown(answerBlock.inner)) : ''

      if (question && answer) {
        faqItems.push({ question, answer })
      }
    }
  }

  if (wrapBlocks.length > 0) {
    const first = wrapBlocks[0]
    const last = wrapBlocks[wrapBlocks.length - 1]
    remaining = html.slice(0, first.start) + html.slice(last.end)
  }

  return { faqItems, html: remaining }
}

/**
 * 取正文容器内容；找不到 `.post-body` 时退回 `<body>` 内容。
 * @param html 已剥离 script/style 的 HTML
 * @returns 正文 HTML 与容器 class
 */
function extractBody(html: string): { body: string; container: string } {
  const block = extractDivBlocks(html, 'post-body')[0]

  if (block) {
    const container = html.slice(block.start, block.start + 80).match(/class="([^"]*)"/)?.[1] ?? ''
    return { body: block.inner, container }
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return { body: bodyMatch ? bodyMatch[1] : html, container: '' }
}

/**
 * 把旧版整页 HTML 文章转换为 Markdown 正文 + FAQ 条目。
 * @param html 原始整页 HTML
 * @returns 转换结果与审计信息
 */
export function convertLegacyBlogArticle(html: string): LegacyConversionResult {
  const warnings: string[] = []
  let working = html
  const removed = { scripts: 0, styles: 0, iframes: 0, head: 0, scaffold: 0 }

  const strip: Array<[keyof typeof removed, RegExp]> = [
    ['scripts', /<script\b[^>]*>[\s\S]*?<\/script>/gi],
    ['styles', /<style\b[^>]*>[\s\S]*?<\/style>/gi],
    ['iframes', /<iframe\b[^>]*>[\s\S]*?<\/iframe>|<iframe\b[^>]*\/>/gi],
    ['head', /<head\b[^>]*>[\s\S]*?<\/head>/gi],
  ]

  for (const [key, pattern] of strip) {
    removed[key] = (working.match(pattern) ?? []).length
    working = working.replace(pattern, '')
  }

  const faq = extractFaq(working)
  const { body: rawBody, container } = extractBody(faq.html)

  if (!container) {
    warnings.push('未找到 .post-body 容器，已回退到整页 body 转换')
  }

  let body = rawBody

  // 相关阅读卡片与面包屑/页头由 CMS 字段与站点 chrome 承担。
  for (const marker of ['post-more-section', 'post-breadcrumb', 'post-header', 'post-meta-row']) {
    for (const block of [...extractDivBlocks(body, marker)].reverse()) {
      body = body.slice(0, block.start) + body.slice(block.end)
      removed.scaffold += 1
    }

    const sectionPattern = new RegExp(
      `<section class="${marker}[^"]*"[^>]*>[\\s\\S]*?<\\/section>`,
      'gi',
    )
    const sections = body.match(sectionPattern) ?? []

    if (sections.length > 0) {
      removed.scaffold += sections.length
      body = body.replace(sectionPattern, '')
    }
  }

  // 标题、导语由 CMS 字段渲染，正文中的重复 h1 / 首段导语需要去掉。
  const titleMatches = body.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) ?? []

  if (titleMatches.length > 0) {
    removed.scaffold += titleMatches.length
    body = body.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '')
  }

  // 页面导语（.post-lead/.post-intro）不在 .post-body 内，但属于正文内容，需要保留；
  // 部分文章的正文又重复了这段导语，此时只保留一份。
  const leadMatch = faq.html.match(/<p class="post-(?:lead|intro)[^"]*"[^>]*>([\s\S]*?)<\/p>/i)
  const leadHtml = leadMatch ? leadMatch[1] : ''
  const leadText = leadHtml ? textOf(leadHtml) : ''

  if (leadText) {
    const firstParagraph = body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)

    if (firstParagraph?.index != null) {
      const firstText = textOf(firstParagraph[1])

      if (firstText.slice(0, 40) === leadText.slice(0, 40)) {
        removed.scaffold += 1
        body =
          body.slice(0, firstParagraph.index) +
          body.slice(firstParagraph.index + firstParagraph[0].length)
      }
    }

    body = `<p>${leadHtml}</p>${body}`
  }

  const structure = {
    images: (body.match(/<img\b/gi) ?? []).length,
    tables: (body.match(/<table\b/gi) ?? []).length,
    headings: (body.match(/<h[1-6]\b/gi) ?? []).length,
  }
  const callouts = (body.match(/class="[^"]*post-(callout|tip|example|comparison)[^"]*"/gi) ?? [])
    .length

  const markdown = normalizeMarkdown(turndown.turndown(body))

  if (removed.scripts > 0) {
    warnings.push(`丢弃 ${removed.scripts} 个内联脚本（原交互逻辑不会迁移）`)
  }
  if (removed.styles > 0) {
    warnings.push(`丢弃 ${removed.styles} 段内联样式（改用文章页统一样式）`)
  }
  if (removed.iframes > 0) {
    warnings.push(`丢弃 ${removed.iframes} 个 iframe`)
  }
  if (markdown.length < 200) {
    warnings.push('转换后正文过短，需人工确认')
  }
  if (structure.images > 0 && !/<img|!\[/.test(markdown)) {
    warnings.push(`正文含 ${structure.images} 张图片，转换后未保留，需人工确认`)
  }
  if (faq.faqItems.length === 0) {
    warnings.push('未抽取到 FAQ 条目')
  }

  return {
    markdown,
    faqItems: faq.faqItems,
    audit: { removed, ...structure, faqCount: faq.faqItems.length, callouts, warnings },
  }
}
