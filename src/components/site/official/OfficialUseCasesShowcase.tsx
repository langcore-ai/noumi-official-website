'use client'

import { useEffect, useRef } from 'react'

/** 提前量：距视口还有这么多像素时开始加载画廊。 */
const GALLERY_PREFETCH_MARGIN = '800px'
/** 画廊 iframe 的文档地址。 */
const GALLERY_SRC = '/assets/usecases-gallery/index.html'

/**
 * 画廊 iframe 是首屏最大的单项资源（约 2.3 MB / 35 个请求）。
 * `loading="lazy"` 对首屏下方的 iframe 无效，因此改由 IntersectionObserver
 * 在接近视口时才写入 `src`，让首屏绘制与 hero 图不再与它抢带宽。
 *
 * 直接操作 DOM 而不是用 state：`src` 不能出现在服务端 HTML 里，否则浏览器在
 * 解析时就发请求，延迟加载失效。
 * @returns 隔离样式的用例画廊 iframe
 */
export function OfficialUseCasesShowcase() {
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    // 不支持 IntersectionObserver 时立即加载，保证画廊仍然可用。
    if (typeof IntersectionObserver === 'undefined') {
      frame.src = GALLERY_SRC

      return
    }

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        frame.src = GALLERY_SRC
        loadObserver.disconnect()
      },
      { rootMargin: GALLERY_PREFETCH_MARGIN },
    )
    loadObserver.observe(frame)

    return () => loadObserver.disconnect()
  }, [])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    let observer: ResizeObserver | undefined
    let animationFrame = 0
    const connect = () => {
      observer?.disconnect()
      const doc = frame.contentDocument
      const content = doc?.querySelector<HTMLElement>('.page')
      if (!doc || !content) return
      doc.documentElement.classList.add('embedded-gallery')
      const resize = () => {
        cancelAnimationFrame(animationFrame)
        animationFrame = requestAnimationFrame(() => {
          const height = Math.ceil(content.getBoundingClientRect().height)
          if (height > 0) frame.style.height = `${height}px`
        })
      }
      observer = new ResizeObserver(resize)
      observer.observe(content)
      resize()
    }
    frame.addEventListener('load', connect)
    connect()
    return () => {
      frame.removeEventListener('load', connect)
      observer?.disconnect()
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <iframe
      ref={frameRef}
      className="noumi-usecases-frame"
      height={800}
      loading="lazy"
      title="Noumi use cases: interactive deliverables gallery"
      width="100%"
    />
  )
}
