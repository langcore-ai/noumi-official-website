import Link from 'next/link'
import type { ReactNode } from 'react'
import { Fragment } from 'react'

/**
 * Markdown 区块模型
 */
type MarkdownBlock =
  | { type: 'heading'; depth: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'hr' }

/**
 * 渲染 Markdown 正文
 * @param props markdown 文本
 * @returns 解析后的 React 节点
 */
export function MarkdownContent({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown)

  return (
    <div className="markdown-content">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          if (block.depth === 1) {
            return <h1 key={index}>{renderInline(block.text)}</h1>
          }

          if (block.depth === 2) {
            return <h2 key={index}>{renderInline(block.text)}</h2>
          }

          return <h3 key={index}>{renderInline(block.text)}</h3>
        }

        if (block.type === 'paragraph') {
          return <p key={index}>{renderInline(block.text)}</p>
        }

        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
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
                        <td key={cellIndex}>{renderInline(cell)}</td>
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

    if (!line) {
      index += 1
      continue
    }

    if (/^\*{3,}$/.test(line) || /^-{3,}$/.test(line)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', depth: 1, text: line.replace(/^# /, '').trim() })
      index += 1
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', depth: 2, text: line.replace(/^## /, '').trim() })
      index += 1
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', depth: 3, text: line.replace(/^### /, '').trim() })
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
        paragraphLine.startsWith('#') ||
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
      return isExternalHref(href) ? (
        <a key={index} href={href} rel="noreferrer" target="_blank">
          {label}
        </a>
      ) : (
        <Link key={index} href={href}>
          {label}
        </Link>
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
