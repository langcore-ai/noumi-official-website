'use client'

import { useLayoutEffect } from 'react'
import {
  HOME_MOTION,
  installPrototypeMotion,
  type PrototypeMotionBinding,
} from '@/lib/site/prototype-motion'

const bindings: readonly PrototypeMotionBinding[] = [
  ...HOME_MOTION.filter(
    ([, selector]) =>
      selector.startsWith('.site-footer') ||
      selector.startsWith('.redesign-final-cta') ||
      selector.startsWith('.redesign-kicker'),
  ),
  ['e-227', '[data-about-motion="hero"]', 'grow', 250],
  ['e-239', '[data-about-motion="intro"]', 'grow', 250],
  ['e-261', '[data-about-motion="crew"]', 'slide', 250],
  ['e-515', '[data-about-motion="overlay"]', 'image-wipe', 0],
  ['e-535', '[data-about-motion="portrait"]', 'image-scale', 0],
  ['e-793', '[data-about-motion="join-title"]', 'slide', 250],
  ['e-795', '[data-about-motion="join-copy"]', 'slide', 300],
  ['e-797', '[data-about-motion="email"]', 'slide', 400],
  ['e-767', '[data-about-motion="faq-heading"]', 'grow', 250],
  ...[350, 450, 550, 650, 750, 750, 750].map(
    (delay, index): PrototypeMotionBinding => [
      ['e-769', 'e-771', 'e-773', 'e-775', 'e-777', 'e-809', 'e-805'][index],
      `[data-about-faq="${index}"]`,
      'slide',
      delay,
    ],
  ),
]

export function AboutPrototypeEffects(): null {
  useLayoutEffect(() => installPrototypeMotion(bindings), [])
  return null
}
