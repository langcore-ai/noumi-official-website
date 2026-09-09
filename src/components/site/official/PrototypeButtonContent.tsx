/** Webflow a/a-2: text and both arrows slide right 40px in 300ms. */
export function PrototypeButtonContent({ children }: { children: React.ReactNode }) {
  return (
    <span className="prototype-button-content">
      <span className="prototype-button-label">{children}</span>
      <img
        aria-hidden="true"
        alt=""
        className="prototype-button-arrow"
        src="/assets/redesign/arrow.svg"
      />
      <img
        aria-hidden="true"
        alt=""
        className="prototype-button-arrow prototype-button-arrow--incoming"
        src="/assets/redesign/arrow.svg"
      />
    </span>
  )
}
