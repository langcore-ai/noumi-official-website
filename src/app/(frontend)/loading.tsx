/**
 * 前台路由切换加载态。
 * @returns 页面内容区骨架屏
 */
export default function FrontendLoading() {
  return (
    <main aria-busy="true" aria-live="polite" className="page-body route-loading">
      <span className="visually-hidden">Loading page content</span>
      <div aria-hidden="true" className="route-loading__stage">
        <span className="route-loading__mark" />
        <span className="route-loading__line route-loading__line--wide" />
        <span className="route-loading__line" />
        <span className="route-loading__line route-loading__line--short" />
      </div>
    </main>
  )
}
