'use client'

import { useEffect, useRef } from 'react'

/** Keep gallery styles isolated while letting the homepage own scrolling. */
export function OfficialUseCasesShowcase() {
  const frameRef = useRef<HTMLIFrameElement>(null)

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
      src="/assets/usecases-gallery/index.html"
      title="Noumi use cases: interactive deliverables gallery"
      width="100%"
    />
  )
}
