/** Homepage introduction film, bundled as a static site asset. */
export function OfficialIntroVideo() {
  return (
    <section aria-labelledby="intro-video-title" className="redesign-intro-video" id="intro-video">
      <div className="redesign-shell">
        <h2 className="redesign-intro-video__title home-key-message" id="intro-video-title">
          Meet Noumi: a secure AI workspace for Business &amp; Solutions professionals
        </h2>
        <div className="redesign-intro-video__frame">
          <video
            aria-label="Meet Noumi: product introduction film"
            controls
            playsInline
            preload="none"
            poster="/assets/intro-video/noumi-se-film-poster.jpg"
          >
            <source src="/assets/intro-video/noumi-se-film-1080p.mp4" type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
      </div>
    </section>
  )
}
