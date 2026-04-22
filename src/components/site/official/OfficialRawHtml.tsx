'use client'

import { useEffect, useRef } from 'react'

/**
 * HTML 模式中需要在浏览器端重新执行的脚本
 */
type InlineScript = {
  /** script 标签属性 */
  attributes: string
  /** script 标签内容 */
  content: string
}

/**
 * 清理后的 HTML 渲染结果
 */
type PreparedRawHtml = {
  /** 可直接注入的 HTML */
  markup: string
  /** 需要 hydration 后执行的普通脚本 */
  scripts: InlineScript[]
}

/**
 * 提取指定标签的第一个内容片段
 * @param html 原始 HTML
 * @param tagName 标签名
 * @returns 标签内容；不存在时返回 undefined
 */
function extractTagContent(html: string, tagName: string): string | undefined {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))

  return match?.[1]
}

/**
 * 判断 script 是否是可执行脚本
 * @param attributes script 标签属性
 * @returns 是否应在前台执行
 */
function isExecutableScript(attributes: string): boolean {
  const type = attributes.match(/\btype=(["'])(.*?)\1/i)?.[2]?.toLowerCase()

  return !type || type === 'text/javascript' || type === 'application/javascript' || type === 'module'
}

/**
 * 移除粘贴整页 HTML 时自带的导航与页脚，避免和站点框架重复
 * @param markup body 内部 HTML
 * @returns 清理后的 HTML
 */
function removeEmbeddedChrome(markup: string): string {
  return markup
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    .replace(/<div\b[^>]*class=(["'])[^"']*\brole-tabs-wrap\b[^"']*\1[^>]*>\s*<\/div>/gi, '')
}

/**
 * 去掉粘贴页里额外包裹的 page-body，避免嵌套页面容器影响布局
 * @param markup body 内部 HTML
 * @returns 解包后的 HTML
 */
function unwrapPageBody(markup: string): string {
  const trimmed = markup.trim()
  const openingTag = trimmed.match(/^<div\b[^>]*class=(["'])[^"']*\bpage-body\b[^"']*\1[^>]*>/i)

  if (!openingTag) {
    return markup
  }

  const content = trimmed.slice(openingTag[0].length).trim()

  return content.endsWith('</div>') ? content.slice(0, -'</div>'.length).trim() : content
}

/**
 * 把管理员粘贴的整页 HTML 转成“仅页面主体”的可渲染片段
 * @param html 原始 HTML
 * @returns 清理后的 HTML 与脚本
 */
function prepareOfficialRawHtml(html: string): PreparedRawHtml {
  const styles = Array.from(html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)).map(
    ([style]) => style,
  )
  const bodyContent = extractTagContent(html, 'body') ?? html
  const scripts: InlineScript[] = []
  const withoutScripts = bodyContent.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_, attributes: string, content: string) => {
      if (isExecutableScript(attributes)) {
        scripts.push({ attributes, content })
      }

      return ''
    },
  )
  const markup = unwrapPageBody(removeEmbeddedChrome(withoutScripts))

  return {
    markup: [...styles, markup].join('\n'),
    scripts,
  }
}

/**
 * 正式站点 HTML 模式渲染容器
 * @param props HTML 源码
 * @returns 原始 HTML 内容
 */
export function OfficialRawHtml(props: { html: string }) {
  const { html } = props
  const containerRef = useRef<HTMLElement>(null)
  const prepared = prepareOfficialRawHtml(html)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const scriptElements = prepareOfficialRawHtml(html).scripts.map((script) => {
      const scriptElement = document.createElement('script')

      if (script.attributes.includes('type="module"') || script.attributes.includes("type='module'")) {
        scriptElement.type = 'module'
      }

      scriptElement.text = script.content
      container.appendChild(scriptElement)

      return scriptElement
    })

    return () => {
      scriptElements.forEach((scriptElement) => scriptElement.remove())
    }
  }, [html])

  return <main dangerouslySetInnerHTML={{ __html: prepared.markup }} ref={containerRef} />
}
