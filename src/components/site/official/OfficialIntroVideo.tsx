/** Homepage introduction film, bundled as a static site asset. */
export function OfficialIntroVideo() {
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
            aria-label="Meet Noumi: Your Secure Workspace for Requirements, Proposals, Decks and More"
            controls
            playsInline
            preload="none"
            poster="/assets/intro-video/noumi-se-film-poster-02s.jpg"
          >
            <source src="/assets/intro-video/noumi-se-film-1080p.mp4" type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
      </div>
    </section>
  )
}
