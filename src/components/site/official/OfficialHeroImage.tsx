import { HOME_ASSETS } from '@/lib/site/homepage-assets'

/** Static, decorative homepage hero image. */
export function OfficialHeroImage() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="redesign-hero__image"
      src={HOME_ASSETS.heroImage}
      alt=""
      aria-hidden="true"
      fetchPriority="high"
      decoding="async"
    />
  )
}
