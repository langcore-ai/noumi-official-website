/** Homepage Webflow IX2 bindings, matched against actual index.html nodes (not stale exports). */
export type PrototypeMotionKind =
  | 'grow'
  | 'slide'
  | 'fade'
  | 'left-marker'
  | 'right-marker'
  | 'image-scale'
  | 'image-wipe'
export type PrototypeMotionBinding = readonly [string, string, PrototypeMotionKind, number]

export const HOME_MOTION = [
  ['e-133', '.redesign-hero__content', 'grow', 250],
  ['e-135', '.redesign-hero__media', 'slide', 350],
  ['e-1380', '.redesign-section-heading', 'grow', 250],
  ['e-1396', '.redesign-feature:nth-child(1) .redesign-feature__copy', 'slide', 350],
  ['e-1398', '.redesign-feature:nth-child(2) .redesign-feature__copy > p', 'slide', 550],
  ['e-1400', '.redesign-feature:nth-child(3) .redesign-feature__arrow-initial', 'slide', 450],
  ['e-1402', '.redesign-feature:nth-child(3) .redesign-feature__copy > p', 'slide', 550],
  ['e-209', '.redesign-final-cta', 'fade', 200],
  ['e-205', '.redesign-final-cta__card', 'slide', 350],
  ['e-211', '.redesign-final-cta h2', 'slide', 450],
  ['e-213', '.redesign-final-cta p', 'slide', 550],
  ['e-215', '.redesign-final-cta__button', 'slide', 650],
  ['e-217', '.site-footer .footer-grid > div:nth-child(1)', 'slide', 350],
  ['e-219', '.site-footer .footer-grid > div:nth-child(2)', 'slide', 450],
  ['e-221', '.site-footer .footer-grid > div:nth-child(3)', 'slide', 550],
  ['e-223', '.site-footer .footer-grid > div:nth-child(4)', 'slide', 650],
  ['e-225', '.site-footer .footer-bottom', 'slide', 350],
  ['e-605', '.redesign-kicker__mark--left', 'left-marker', 500],
  ['e-605', '.redesign-kicker__mark--right', 'right-marker', 500],
] as const satisfies readonly (readonly [string, string, PrototypeMotionKind, number])[]

export function prototypeMotionFrames(kind: PrototypeMotionKind): Keyframe[] {
  if (kind === 'image-scale') return [{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }]
  if (kind === 'image-wipe') return [{ height: '100%' }, { height: '0%' }]
  if (kind === 'left-marker' || kind === 'right-marker') {
    return [
      { transform: `translateX(${kind === 'left-marker' ? 30 : -30}px)` },
      { transform: 'translateX(0)' },
    ]
  }
  const transform =
    kind === 'grow' ? 'scale(0.75)' : kind === 'slide' ? 'translateY(100px)' : 'none'
  return [
    { opacity: 0, transform },
    { opacity: 1, transform: 'none' },
  ]
}

/** Progressive enhancement: no JS leaves content visible; cleanup never leaves hidden copy. */
export function installPrototypeMotion(
  bindings: readonly PrototypeMotionBinding[] = HOME_MOTION,
): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const records = new Map<HTMLElement, Animation | null>()
  const triggers = new Map<Element, HTMLElement[]>()
  const finish = (element: HTMLElement) => {
    records.get(element)?.cancel()
    records.set(element, null)
    element.dataset.motionState = 'done'
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        for (const element of triggers.get(entry.target) ?? []) {
          if (element.dataset.motionState !== 'pending') continue
          element.dataset.motionState = 'playing'
          records.get(element)?.play()
        }
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0 },
  )

  const scan = () => {
    for (const [event, selector, kind, delay] of bindings) {
      document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (records.has(element)) return
        element.dataset.motionEvent = event
        if (reduced.matches) {
          records.set(element, null)
          element.dataset.motionState = 'done'
          return
        }
        const marker = kind.endsWith('marker')
        const animation = element.animate(prototypeMotionFrames(kind), {
          duration: marker ? 600 : 1000,
          delay,
          // Webflow's empty easing is linear; grow/slide/fade presets use outQuart.
          easing:
            marker || kind.startsWith('image-') ? 'linear' : 'cubic-bezier(0.165, 0.84, 0.44, 1)',
          fill: 'both',
        })
        animation.pause()
        animation.currentTime = 0
        records.set(element, animation)
        element.dataset.motionState = 'pending'
        animation.onfinish = () => finish(element)
        const trigger = marker ? (element.closest('.redesign-kicker') ?? element) : element
        triggers.set(trigger, [...(triggers.get(trigger) ?? []), element])
        observer.observe(trigger)
      })
    }
  }
  const revealFocused = (event: FocusEvent) => {
    // Pointer focus must not move a target between pointerdown and pointerup.
    if (!(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return
    for (const element of records.keys()) {
      if (element.contains(event.target)) finish(element)
    }
  }
  const preferenceChanged = () => {
    if (reduced.matches) records.forEach((_, element) => finish(element))
  }
  scan()
  // Persistent chrome and streamed route content can mount after the home effect.
  const mutations = new MutationObserver(scan)
  mutations.observe(document.body, { childList: true, subtree: true })
  document.addEventListener('focusin', revealFocused)
  reduced.addEventListener('change', preferenceChanged)
  return () => {
    observer.disconnect()
    mutations.disconnect()
    document.removeEventListener('focusin', revealFocused)
    reduced.removeEventListener('change', preferenceChanged)
    records.forEach((animation, element) => {
      animation?.cancel()
      delete element.dataset.motionState
      delete element.dataset.motionEvent
    })
  }
}
