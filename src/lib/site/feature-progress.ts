/** Webflow a-95: consecutive cards crossfade over 37–40, 57–60, 77–80%. */
export function featureActivation(progress: number, index: number): number {
  const clamp = (value: number) => Math.min(1, Math.max(0, value))
  const enter = index === 0 ? 1 : clamp((progress - (17 + index * 20)) / 3)
  const leave = 1 - clamp((progress - (37 + index * 20)) / 3)
  return Math.min(enter, leave)
}

/** Webflow SCROLLING_IN_VIEW, startsEntering=true, endOffset=50%. */
export function featureScrollProgress(top: number, height: number, viewport: number): number {
  return Math.min(1, Math.max(0, (viewport - top) / (viewport + height * 0.5))) * 100
}
