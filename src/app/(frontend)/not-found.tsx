import { PrototypePage } from '@/components/site/prototype/PrototypePage'
import './prototype-pages.css'

/**
 * 404 页面同时是 App Router 的全站兜底。
 *
 * 注意：这里的 CSS 会被 Next 提升到共享 chunk，因此其他页面（含首页）也会下载
 * 这份原型样式。移除本文件的 import 只是把同一份样式挪到 `[...prototype]` 等
 * 路由，共享 chunk 仍会包含它——除非 404 本身不再使用原型标记。
 *
 * 因此各原型路由仍显式 import `prototype-pages.css`：这样在不渲染 404 的请求上
 * 它是 RSC 流里的非阻塞样式，只在 404 真正渲染时才作为阻塞样式出现。
 * @returns 原型风格的 404 页面
 */
export default function NotFound() {
  return <PrototypePage route="/not-found" />
}
