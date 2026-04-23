'use client'

import { useEffect, useMemo, useRef } from 'react'

import { normalizeSiteHref } from '@/lib/site/url'

/**
 * HTML 模式中需要在浏览器端重新执行的脚本
 */
type InlineScript = {
  /** script 标签属性 */
  attributes: string
  /** script 标签内容 */
  content: string
  /** 可执行脚本类型 */
  type?: string
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
 * 提取 script 类型
 * @param attributes script 标签属性
 * @returns script 类型；未声明时返回 undefined
 */
function getScriptType(attributes: string): string | undefined {
  const match = attributes.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const type = match?.[1] ?? match?.[2] ?? match?.[3]

  return type?.trim().toLowerCase()
}

/**
 * 判断 script 是否引用外链脚本
 * @param attributes script 标签属性
 * @returns 是否包含 src 属性
 */
function hasExternalScriptSource(attributes: string): boolean {
  return /\bsrc\s*=/i.test(attributes)
}

/**
 * 判断 script 是否是可执行的内联脚本
 * @param attributes script 标签属性
 * @returns 可执行脚本类型；不可执行时返回 null
 */
function getExecutableInlineScriptType(attributes: string): null | string {
  // HTML 模式只重新执行内联脚本，避免 CMS 内容额外拉取第三方脚本。
  if (hasExternalScriptSource(attributes)) {
    return null
  }

  const type = getScriptType(attributes)

  if (!type || type === 'text/javascript' || type === 'application/javascript') {
    return 'text/javascript'
  }

  return type === 'module' ? 'module' : null
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
 * 移除已经提升到渲染片段顶部的 style 标签，避免 body 内样式重复注入。
 * @param markup body 内部 HTML
 * @returns 去掉 style 后的 HTML
 */
function removeInlineStyles(markup: string): string {
  return markup.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
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
 * 规范化 CMS HTML 片段里的 href，保证正文站内链接也输出首选 URL
 * @param markup HTML 片段
 * @returns 已规范化 href 的 HTML
 */
function normalizeHtmlHrefs(markup: string): string {
  return markup.replace(
    /\bhref\s*=\s*(["'])([^"']*)\1/gi,
    (matched, quote: string, href: string) => {
      const normalizedHref = normalizeSiteHref(href)

      return normalizedHref === href ? matched : `href=${quote}${normalizedHref}${quote}`
    },
  )
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
      const scriptType = getExecutableInlineScriptType(attributes)

      if (scriptType) {
        scripts.push({ attributes, content, type: scriptType })
      }

      return ''
    },
  )
  const markup = normalizeHtmlHrefs(
    unwrapPageBody(removeEmbeddedChrome(removeInlineStyles(withoutScripts))),
  )

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
  const prepared = useMemo(() => prepareOfficialRawHtml(html), [html])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const scriptElements = prepared.scripts.map((script) => {
      const scriptElement = document.createElement('script')

      scriptElement.type = script.type ?? 'text/javascript'
      scriptElement.text = script.content
      container.appendChild(scriptElement)

      return scriptElement
    })

    return () => {
      scriptElements.forEach((scriptElement) => scriptElement.remove())
    }
  }, [prepared.scripts])

  return <main dangerouslySetInnerHTML={{ __html: prepared.markup }} ref={containerRef} />
}
