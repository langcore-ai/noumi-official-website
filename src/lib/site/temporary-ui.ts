/** Next.js rewrite 配置项 */
export type TemporaryUiRewriteRule = {
  /** 需要被临时 UI 接管的公开路径 */
  source: string
  /** 对应的静态 HTML / 资源承载路径 */
  destination: string
  /** 条件匹配 */
  has?: Array<{ key: string; type: 'header' | 'query' }>
  /** 缺失条件匹配 */
  missing?: Array<{ key: string; type: 'header' | 'query' }>
}

/**
 * 临时 UI 的固定公开路由映射。
 * 这些路径需要覆盖现有 CMS 页面，直接落到客户提供的静态稿。
 */
export const TEMPORARY_UI_STATIC_REWRITES: TemporaryUiRewriteRule[] = [
  { source: '/', destination: '/temporary-ui-static/__home' },
  { source: '/about', destination: '/temporary-ui-static/__about' },
  { source: '/blog', destination: '/temporary-ui-static/__blog' },
  { source: '/contact', destination: '/temporary-ui-static/__contact' },
  { source: '/faqs', destination: '/temporary-ui-static/__faqs' },
  { source: '/invite', destination: '/temporary-ui-static/__invite' },
  { source: '/pricing', destination: '/temporary-ui-static/__pricing' },
  { source: '/privacy', destination: '/temporary-ui-static/__privacy' },
  { source: '/terms', destination: '/temporary-ui-static/__terms' },
  { source: '/use-cases/journalist', destination: '/temporary-ui-static/__use-case-journalist' },
  {
    source: '/use-cases/product-manager',
    destination: '/temporary-ui-static/__use-case-product-manager',
  },
  {
    source: '/use-cases/solutions-engineer',
    destination: '/temporary-ui-static/__use-case-solutions-engineer',
  },
]

/** 临时 UI 对外暴露的公开页面路径，可供 sitemap 等逻辑复用 */
export const TEMPORARY_UI_PUBLIC_PATHS = Array.from(
  new Set(TEMPORARY_UI_STATIC_REWRITES.map(({ source }) => source)),
)

/**
 * 屏蔽外部对原始 HTML 文件的直接访问。
 * 只有内部 route handler fetch 会携带专用 header，从而绕过这组规则。
 */
export const TEMPORARY_UI_BLOCKED_HTML_REWRITES: TemporaryUiRewriteRule[] = [
  {
    source: '/temporaryUI/:path*.html',
    destination: '/_not-found',
    missing: [{ key: 'x-tempui-internal', type: 'header' }],
  },
]
