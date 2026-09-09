/** Same-origin prototype gallery; keeps its styles and scrolling isolated. */
export function OfficialUseCasesShowcase() {
  return (
    <iframe
      className="noumi-usecases-frame"
      height={800}
      loading="lazy"
      src="/assets/usecases-gallery/index.html"
      title="Noumi use cases: interactive deliverables gallery"
      width="100%"
    />
  )
}
