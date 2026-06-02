'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useRouter } from 'next/navigation'

import { isFilePathname, normalizeSiteHref } from '@/lib/site/url'

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
 * CMS HTML 中允许作为结构化数据输出的脚本
 */
type StructuredDataScript = {
  /** JSON-LD 原始内容 */
  content: string
}

/**
 * 清理后的 HTML 渲染结果
 */
type PreparedRawHtml = {
  /** 可直接注入的 HTML */
  markup: string
  /** 需要随 SSR HTML 保留的 JSON-LD 脚本 */
  structuredDataScripts: StructuredDataScript[]
  /** 需要 hydration 后执行的普通脚本 */
  scripts: InlineScript[]
}

/** JSON-LD 脚本 MIME 类型 */
const JSON_LD_SCRIPT_TYPE = 'application/ld+json'

/** CMS HTML 渲染容器 class，用于限制移动端兜底样式作用域。 */
const RAW_HTML_CONTAINER_CLASS = 'official-raw-html'
/** 不应交给 App Router 处理的站内路径前缀。 */
const RAW_HTML_ROUTER_EXCLUDED_PREFIXES = ['/api', '/admin', '/_next', '/assets']

/** 管理员粘贴整页 HTML 时的移动端兜底样式。 */
const RAW_HTML_RESPONSIVE_STYLE = `<style data-noumi-raw-html-mobile>
.${RAW_HTML_CONTAINER_CLASS} {
  width: 100%;
  min-width: 0;
  overflow-x: clip;
}

.${RAW_HTML_CONTAINER_CLASS},
.${RAW_HTML_CONTAINER_CLASS} * {
  box-sizing: border-box;
}

.${RAW_HTML_CONTAINER_CLASS} :where(img, video, canvas, svg, iframe) {
  max-width: 100%;
  height: auto;
}

.${RAW_HTML_CONTAINER_CLASS} :where(pre, table) {
  max-width: 100%;
  overflow-x: auto;
}

@media (max-width: 760px) {
  .${RAW_HTML_CONTAINER_CLASS} {
    overflow-wrap: anywhere;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where(section, article, main, aside, header, footer, div) {
    max-width: 100%;
    min-width: 0;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where([style*="width" i]) {
    max-width: 100% !important;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where([style*="min-width" i]) {
    min-width: 0 !important;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where(table) {
    display: block;
    width: 100% !important;
    min-width: 0 !important;
    border-collapse: collapse;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where(th, td) {
    word-break: normal;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where(h1) {
    font-size: clamp(2.2rem, 11vw, 3.8rem);
    line-height: 1.08;
  }

  .${RAW_HTML_CONTAINER_CLASS} :where(h2) {
    font-size: clamp(1.8rem, 9vw, 3rem);
    line-height: 1.12;
  }
}

@media (max-width: 520px) {
  .${RAW_HTML_CONTAINER_CLASS} :where([class*="grid" i], [class*="cards" i], [class*="columns" i]) {
    grid-template-columns: 1fr !important;
  }
}
</style>`

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
 * 判断 script 是否是 JSON-LD 结构化数据
 * @param attributes script 标签属性
 * @returns 是否为 JSON-LD 内联脚本
 */
function isStructuredDataScript(attributes: string): boolean {
  const type = getScriptType(attributes)?.split(';')[0]?.trim()

  return type === JSON_LD_SCRIPT_TYPE
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
 * 提取 HTML 中允许保留给搜索引擎识别的 JSON-LD 脚本
 * @param html 原始 HTML
 * @returns JSON-LD 结构化数据脚本
 */
function extractStructuredDataScripts(html: string): StructuredDataScript[] {
  const scripts: StructuredDataScript[] = []

  for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    // JSON-LD 只保留内联内容，继续避免 CMS HTML 额外加载外链脚本。
    if (
      !hasExternalScriptSource(attributes) &&
      isStructuredDataScript(attributes) &&
      content.trim()
    ) {
      scripts.push({ content })
    }
  }

  return scripts
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
 * 判断路径是否应由 App Router 做客户端切换。
 * @param href 已规范化 href
 * @returns 是否为站内页面链接
 */
function isClientRoutableHref(href: string): boolean {
  if (!href.startsWith('/')) {
    return false
  }

  const url = new URL(href, 'https://noumi.ai')

  if (isFilePathname(url.pathname)) {
    return false
  }

  return !RAW_HTML_ROUTER_EXCLUDED_PREFIXES.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  )
}

/**
 * 从 HTML 链接节点中读取可交给 App Router 的站内 href。
 * @param anchor 链接节点
 * @returns 可客户端切换的 href
 */
function getClientRoutableAnchorHref(anchor: HTMLAnchorElement): string | null {
  const rawHref = anchor.getAttribute('href')

  if (!rawHref || rawHref.startsWith('#') || anchor.hasAttribute('download')) {
    return null
  }

  const target = anchor.getAttribute('target')

  if (target && target.toLowerCase() !== '_self') {
    return null
  }

  const normalizedHref = normalizeSiteHref(rawHref)

  return isClientRoutableHref(normalizedHref) ? normalizedHref : null
}

/**
 * 把管理员粘贴的整页 HTML 转成“仅页面主体”的可渲染片段
 * @param html 原始 HTML
 * @returns 清理后的 HTML 与脚本
 */
export function prepareOfficialRawHtml(html: string): PreparedRawHtml {
  const styles = Array.from(html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)).map(
    ([style]) => style,
  )
  const structuredDataScripts = extractStructuredDataScripts(html)
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
    markup: [...styles, RAW_HTML_RESPONSIVE_STYLE, markup].join('\n'),
    structuredDataScripts,
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
  const router = useRouter()
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

    /**
     * HTML 模式里的站内普通链接也走 App Router，避免硬刷新导致全局 header/footer 重载。
     */
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')

      if (!anchor || !container.contains(anchor)) {
        return
      }

      const href = getClientRoutableAnchorHref(anchor)

      if (!href) {
        return
      }

      event.preventDefault()
      router.push(href)
    }

    /**
     * 鼠标悬停/键盘聚焦时预取站内链接，降低进入 CMS 子页的等待体感。
     */
    const handlePotentialNavigation = (event: MouseEvent | FocusEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]')

      if (!anchor || !container.contains(anchor)) {
        return
      }

      const href = getClientRoutableAnchorHref(anchor)

      if (href) {
        router.prefetch(href)
      }
    }

    container.addEventListener('click', handleClick)
    container.addEventListener('mouseover', handlePotentialNavigation)
    container.addEventListener('focusin', handlePotentialNavigation)

    return () => {
      container.removeEventListener('click', handleClick)
      container.removeEventListener('mouseover', handlePotentialNavigation)
      container.removeEventListener('focusin', handlePotentialNavigation)
      scriptElements.forEach((scriptElement) => scriptElement.remove())
    }
  }, [prepared.scripts, router])

  return (
    <>
      {prepared.structuredDataScripts.map((script, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: script.content }}
          key={index}
          type={JSON_LD_SCRIPT_TYPE}
        />
      ))}
      <main
        className={RAW_HTML_CONTAINER_CLASS}
        dangerouslySetInnerHTML={{ __html: prepared.markup }}
        ref={containerRef}
      />
    </>
  )
}
