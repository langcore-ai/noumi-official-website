'use client'

import { useRef, useState } from 'react'

/** Homepage introduction film, bundled as a static site asset. */
export function OfficialIntroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPlayed, setHasPlayed] = useState(false)

  async function playIntro() {
    const video = videoRef.current
    if (!video) return

    try {
      await video.play()
      video.focus({ preventScroll: true })
    } catch {
      // Keep the poster button available for another attempt.
    }
  }

  return (
    <section aria-labelledby="intro-video-title" className="redesign-intro-video" id="intro-video">
      <div className="redesign-shell">
        <h2 className="redesign-intro-video__title" id="intro-video-title">
          <span className="intro-video-title-line">
            Noumi helps you turn requirements into a more compelling solution,
          </span>
          <br />
          <span>
            with <u>factual accuracy</u> and <u>professional output quality</u>
          </span>
        </h2>
        <div className="redesign-intro-video__frame">
          <video
            ref={videoRef}
            aria-label="Meet Noumi: Your Secure Workspace for Requirements, Proposals, Decks and More"
            controls={hasPlayed}
            tabIndex={-1}
            playsInline
            preload="metadata"
            onPlaying={() => setHasPlayed(true)}
            poster="/assets/intro-video/noumi-se-film-poster-requirements.webp"
          >
            <source src="/assets/intro-video/noumi-se-film-1080p.mp4" type="video/mp4" />
            Your browser does not support the video element.
          </video>
          {!hasPlayed && (
            <button
              type="button"
              className="redesign-intro-video__play"
              aria-label="Play Noumi introduction"
              onClick={playIntro}
            />
          )}
        </div>
      </div>
    </section>
  )
}
