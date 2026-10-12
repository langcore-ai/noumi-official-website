'use client'

import { useEffect, useRef, useState } from 'react'
import { HOME_ASSETS } from '@/lib/site/homepage-assets'

/** Respect motion preferences by default, while always allowing explicit playback. */
export function OfficialHeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const preference = useRef<'auto' | 'play'>('auto')
  const syncPlayback = useRef<() => void>(() => {})
  const [needsManualPlay, setNeedsManualPlay] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    let disposed = false
    const update = () => {
      const wantsPlayback =
        preference.current === 'play' || (preference.current === 'auto' && !reduced.matches)
      if (!wantsPlayback) setNeedsManualPlay(true)
      if (!wantsPlayback || !visible || document.hidden) {
        video.pause()
        return
      }
      // Set DOM properties before attaching the source: mobile autoplay policies
      // inspect the media element's current muted state, not just its markup.
      video.muted = true
      video.defaultMuted = true
      if (!video.getAttribute('src')) video.src = HOME_ASSETS.video
      void video.play().catch((error: unknown) => {
        if (!disposed && error instanceof DOMException && error.name === 'NotAllowedError') {
          setNeedsManualPlay(true)
        }
      })
    }
    syncPlayback.current = update
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    observer.observe(video)
    reduced.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      disposed = true
      syncPlayback.current = () => {}
      observer.disconnect()
      reduced.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
      video.pause()
    }
  }, [])

  return (
    <>
      <video
        ref={ref}
        className="redesign-hero__video"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster={HOME_ASSETS.poster}
        aria-hidden="true"
        onPlaying={(event) => {
          if (!event.currentTarget.paused) setNeedsManualPlay(false)
        }}
      />
      {needsManualPlay && (
        <button
          type="button"
          className="hero-video-toggle"
          aria-label="Play background video"
          onClick={() => {
            preference.current = 'play'
            syncPlayback.current()
          }}
        >
          <span aria-hidden="true">▶</span>
          Play
        </button>
      )}
    </>
  )
}
