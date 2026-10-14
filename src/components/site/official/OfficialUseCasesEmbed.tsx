'use client'

import { useEffect, useRef, useState } from 'react'

const origin = 'https://noumi-twelve-use-cases.himihiroti.chatgpt.site'

/** Cross-origin protocol and ownership: docs/USE-CASES-EMBED.md. */
export function OfficialUseCasesEmbed() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number>()

  useEffect(() => {
    const element = frame.current
    if (!element) return
    let retry: ReturnType<typeof setInterval> | undefined
    const stopRetry = () => clearInterval(retry)
    const measure = () =>
      element.contentWindow?.postMessage({ type: 'noumi:embed-measure' }, origin)
    const connect = () => {
      stopRetry()
      setHeight(undefined)
      measure()
      // Bounded retries cover a child listener that initializes after its load event.
      let attempts = 0
      retry = setInterval(() => {
        measure()
        if (++attempts >= 5) stopRetry()
      }, 1000)
    }
    const resize = (event: MessageEvent<unknown>) => {
      if (event.origin !== origin || event.source !== element.contentWindow) return
      const data = event.data
      if (!data || typeof data !== 'object' || !('type' in data) || !('height' in data)) return
      if (data.type !== 'noumi:embed-height' || typeof data.height !== 'number') return
      if (!Number.isFinite(data.height) || data.height < 1 || data.height > 100000) return
      stopRetry()
      setHeight(Math.ceil(data.height))
    }
    window.addEventListener('message', resize)
    element.addEventListener('load', connect)
    // Only width changes request a measurement; our height updates must not create a loop.
    let width = element.getBoundingClientRect().width
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width !== width) {
        width = entry.contentRect.width
        measure()
      }
    })
    observer.observe(element)
    connect()
    return () => {
      stopRetry()
      observer.disconnect()
      window.removeEventListener('message', resize)
      element.removeEventListener('load', connect)
    }
  }, [])

  return (
    <iframe
      ref={frame}
      src={`${origin}/?embed=1`}
      title="What you can deliver with Noumi"
      width="100%"
      scrolling={height === undefined ? 'auto' : 'no'}
      data-embed-status={height === undefined ? 'waiting' : 'ready'}
      style={{ display: 'block', border: 0, height: height ?? 'max(900px, 100svh)', width: '100%' }}
    />
  )
}
