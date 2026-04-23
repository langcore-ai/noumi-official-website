import type { ReactNode } from 'react'
import { Fragment } from 'react'

import { TypesetText } from '@/components/site/TypesetText'
import { normalizeSiteHref } from '@/lib/site/url'

/**
 * Markdown 区块模型
 */
type MarkdownHeadingDepth = 1 | 2 | 3

/**
 * Markdown 区块模型
 */
type MarkdownBlock =
  | { type: 'heading'; depth: MarkdownHeadingDepth; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'hr' }

/**
 * 渲染 Markdown 正文
 * @param props markdown 文本
 * @returns 解析后的 React 节点
 */
export function MarkdownContent({ locale, markdown }: { locale?: string; markdown: string }) {
  const blocks = parseMarkdown(markdown)

  return (
    <div className="markdown-content">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          if (block.depth === 1) {
            return (
              <TypesetText key={index} as="h1" locale={locale} text={block.text} variant="pageTitle">
                {renderInline(block.text)}
              </TypesetText>
            )
          }

          if (block.depth === 2) {
            return (
              <TypesetText key={index} as="h2" locale={locale} text={block.text} variant="sectionTitle">
                {renderInline(block.text)}
              </TypesetText>
            )
          }

          return (
            <TypesetText key={index} as="h3" locale={locale} text={block.text} variant="cardTitle">
              {renderInline(block.text)}
            </TypesetText>
          )
        }

        if (block.type === 'paragraph') {
          return (
            <TypesetText key={index} as="p" locale={locale} text={block.text} variant="articleBody">
              {renderInline(block.text)}
            </TypesetText>
          )
        }

        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <TypesetText key={itemIndex} as="li" locale={locale} text={item} variant="listItem">
                  {renderInline(item)}
                </TypesetText>
              ))}
            </ul>
          )
        }

        if (block.type === 'table') {
          const [headerRow, ...bodyRows] = block.rows

          return (
            <div key={index} className="markdown-table">
              <table>
                <thead>
                  <tr>
                    {headerRow.map((cell, cellIndex) => (
                      <th key={cellIndex}>{renderInline(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>
                          <TypesetText as="p" locale={locale} text={cell} variant="tableCell">
                            {renderInline(cell)}
                          </TypesetText>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        return <hr key={index} />
      })}
    </div>
  )
}

/**
 * 将 Markdown 文本拆成可渲染的区块
 * @param markdown 原始 Markdown
 * @returns 区块数组
 */
function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? ''
    const heading = parseHeadingLine(line)

    if (!line) {
      index += 1
      continue
    }

    if (/^\*{3,}$/.test(line) || /^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (heading) {
      blocks.push(heading)
      index += 1
      continue
    }

    if (line.startsWith('|')) {
      const rows: string[][] = []

      while (index < lines.length && (lines[index]?.trim().startsWith('|') ?? false)) {
        const raw = lines[index]?.trim() ?? ''
        if (!/^\|\s*[-:]+\s*(\|\s*[-:]+\s*)+\|?$/.test(raw)) {
          rows.push(
            raw
              .replace(/^\|/, '')
              .replace(/\|$/, '')
              .split('|')
              .map((cell) => cell.trim()),
          )
        }
        index += 1
      }

      if (rows.length > 0) {
        blocks.push({ type: 'table', rows })
      }

      continue
    }

    if (/^(\* |- )/.test(line)) {
      const items: string[] = []

      while (index < lines.length) {
        const listLine = lines[index]?.trim() ?? ''
        if (!/^(\* |- )/.test(listLine)) {
          break
        }
        items.push(listLine.replace(/^(\* |- )/, '').trim())
        index += 1
      }

      blocks.push({ type: 'list', items })
      continue
    }

    const paragraphLines: string[] = []

    while (index < lines.length) {
      const paragraphLine = lines[index]?.trim() ?? ''
      if (
        !paragraphLine ||
        Boolean(parseHeadingLine(paragraphLine)) ||
        paragraphLine.startsWith('|') ||
        /^(\* |- )/.test(paragraphLine) ||
        /^\*{3,}$/.test(paragraphLine) ||
        /^-{3,}$/.test(paragraphLine)
      ) {
        break
      }
      paragraphLines.push(paragraphLine)
      index += 1
    }

    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
    }
  }

  return blocks
}

/**
 * 解析 Markdown 标题行。
 * 超过三级的标题统一降级到三级标题，避免未消费行导致死循环。
 * @param line 当前行文本
 * @returns 标题区块；不是标题时返回 null
 */
function parseHeadingLine(line: string): Extract<MarkdownBlock, { type: 'heading' }> | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/)

  if (!match) {
    return null
  }

  return {
    type: 'heading',
    depth: normalizeHeadingDepth(match[1].length),
    text: match[2].trim(),
  }
}

/**
 * 规范化标题层级。
 * 当前页面样式只支持到三级，因此更深层级统一映射为三级。
 * @param depth 原始标题层级
 * @returns 归一化后的标题层级
 */
function normalizeHeadingDepth(depth: number): MarkdownHeadingDepth {
  if (depth <= 1) {
    return 1
  }

  if (depth === 2) {
    return 2
  }

  return 3
}

/**
 * 渲染 Markdown 行内语法
 * @param text 行内文本
 * @returns React 节点数组
 */
function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|<[^>]+>)/g).filter(Boolean)

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>
    }

    const markdownLink = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (markdownLink) {
      const [, label, href] = markdownLink
      const normalizedHref = normalizeSiteHref(href)

      return isExternalHref(normalizedHref) ? (
        <a key={index} href={normalizedHref} rel="noreferrer" target="_blank">
          {label}
        </a>
      ) : (
        <a key={index} href={normalizedHref}>
          {label}
        </a>
      )
    }

    if (token.startsWith('<') && token.endsWith('>')) {
      const href = token.slice(1, -1)
      if (href.includes('@')) {
        return (
          <a key={index} href={`mailto:${href}`}>
            {href}
          </a>
        )
      }
    }

    return <Fragment key={index}>{token}</Fragment>
  })
}

/**
 * 判断链接是否为站外地址
 * @param href 链接地址
 * @returns 是否站外
 */
function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}
