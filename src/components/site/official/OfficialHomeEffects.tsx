'use client'

import { useEffect } from 'react'
import { featureActivation, featureScrollProgress } from '@/lib/site/feature-progress'

/** Scroll-driven Webflow a-95 timeline; no pointer-triggered activation. */
export function OfficialHomeEffects(): null {
  useEffect(() => {
    const area = document.querySelector<HTMLElement>('.redesign-feature-stack')
    if (!area) return
    const cards = Array.from(area.querySelectorAll<HTMLElement>('.redesign-feature'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let current = 0
    let target = 0

    const paint = () => {
      // Last prototype event e-1387 uses smoothing=70 (30% per frame).
      current = reduced.matches ? target : current + (target - current) * 0.3
      if (Math.abs(target - current) < 0.001) current = target
      cards.forEach((card, index) => {
        const value = window.innerWidth < 768 ? 0 : featureActivation(current, index)
        card.style.setProperty('--feature-active', String(value))
        card.style.setProperty(
          '--feature-title-color',
          `rgba(${77 * value}, ${114 * value}, ${194 * value}, ${0.3 + 0.7 * value})`,
        )
        card.classList.toggle('is-active', value > 0.5)
      })
      frame = current === target ? 0 : requestAnimationFrame(paint)
    }
    const update = () => {
      const rect = area.getBoundingClientRect()
      target = featureScrollProgress(rect.top, rect.height, window.innerHeight)
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const observer = new ResizeObserver(update)
    observer.observe(area)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    reduced.addEventListener('change', update)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      reduced.removeEventListener('change', update)
      cards.forEach((card) => {
        card.style.removeProperty('--feature-active')
        card.style.removeProperty('--feature-title-color')
      })
    }
  }, [])
  return null
}
