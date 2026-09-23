import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

/**
 * Markdown 渲染安全白名单
 * 在 rehype-sanitize 默认 schema(GitHub 风格)之上补充 GFM 任务列表复选框。
 * 默认已禁止 script/iframe/style/表单、事件属性与非 http(s) 协议链接。
 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'input'],
  attributes: {
    ...defaultSchema.attributes,
    input: ['type', 'checked', 'disabled'],
  },
}

/**
 * Markdown → 净化后 HTML 的渲染管线(模块级构建一次):
 * GFM 解析 → 放行原生 HTML → 白名单净化 → 标题锚点 → 代码高亮 → 序列化。
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'wrap',
    properties: { className: ['heading-anchor'], ariaLabel: 'Link to section' },
  })
  .use(rehypeHighlight)
  .use(rehypeStringify)

/**
 * 将 Markdown 文本渲染为净化后的 HTML 字符串。
 * 服务端渲染使用;内容已过白名单,可直接经 dangerouslySetInnerHTML 输出。
 * @param markdown Markdown 原稿
 * @returns 净化后的 HTML
 */
export function renderMarkdownToHtml(markdown: string): string {
  return String(processor.processSync(markdown))
}
