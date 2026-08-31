'use client'

import { useEffect } from 'react'

/**
 * 首页专属动效
 * 复刻原临时稿中的 tilt、parallax 与 hero pointer 动效。
 * @returns 空节点
 */
export function OfficialHomeEffects(): null {
  useEffect(() => {
    const tiltCards = Array.from(document.querySelectorAll<HTMLElement>('.tilt-card'))
    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    const featureArea = document.querySelector<HTMLElement>('.redesign-feature-stack')
    const featureCards = featureArea
      ? Array.from(featureArea.querySelectorAll<HTMLElement>('.redesign-feature'))
      : []
    const heroStage = document.querySelector<HTMLElement>('.hero-stage')
    const heroLayers = heroStage
      ? {
          left: heroStage.querySelector<HTMLElement>('.hero-stage__left'),
          window: heroStage.querySelector<HTMLElement>('.hero-stage__window'),
          right: heroStage.querySelector<HTMLElement>('.hero-stage__right'),
        }
      : null

    const handleParallax = () => {
      const scrollY = window.scrollY

      parallaxItems.forEach((item) => {
        const depth = Number(item.dataset.parallax || 0)
        item.style.transform = `translate3d(0, ${scrollY * (depth / 1000)}px, 0)`
      })
    }

    /**
     * 复刻 Webflow 的 SCROLLING_IN_VIEW 时间线：0–37、40–57、60–77
     * 分别激活三张卡片，37–40 与 57–60 为状态交接区间。
     */
    const handleFeatureProgress = () => {
      if (!featureArea || featureCards.length === 0) {
        return
      }

      if (window.innerWidth < 768) {
        featureCards.forEach((card) => card.classList.remove('is-active'))
        return
      }

      const rect = featureArea.getBoundingClientRect()
      const progress = ((window.innerHeight - rect.top) / (window.innerHeight + rect.height)) * 100
      const activeIndex = progress < 38.5 ? 0 : progress < 58.5 ? 1 : progress < 78.5 ? 2 : -1

      featureCards.forEach((card, index) => {
        card.classList.toggle('is-active', index === activeIndex)
      })
    }

    tiltCards.forEach((card) => {
      const handlePointerMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width
        const py = (event.clientY - rect.top) / rect.height
        const rotateY = (px - 0.5) * 8
        const rotateX = (0.5 - py) * 8
        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`
      }

      const handlePointerLeave = () => {
        card.style.transform = ''
      }

      card.addEventListener('pointermove', handlePointerMove)
      card.addEventListener('pointerleave', handlePointerLeave)
    })

    handleParallax()
    handleFeatureProgress()
    window.addEventListener('scroll', handleParallax, { passive: true })
    window.addEventListener('scroll', handleFeatureProgress, { passive: true })
    window.addEventListener('resize', handleFeatureProgress)

    if (heroStage && heroLayers?.left && heroLayers.window && heroLayers.right) {
      const handlePointerMove = (event: PointerEvent) => {
        const rect = heroStage.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5

        heroLayers.left.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`
        heroLayers.window.style.transform = `translateX(-50%) translate3d(${x * -18}px, ${y * -12}px, 0)`
        heroLayers.right.style.transform = `translate3d(${x * 12}px, ${y * -10}px, 0)`
      }

      const handlePointerLeave = () => {
        heroLayers.left.style.transform = ''
        heroLayers.window.style.transform = ''
        heroLayers.right.style.transform = ''
      }

      heroStage.addEventListener('pointermove', handlePointerMove)
      heroStage.addEventListener('pointerleave', handlePointerLeave)

      return () => {
        window.removeEventListener('scroll', handleParallax)
        window.removeEventListener('scroll', handleFeatureProgress)
        window.removeEventListener('resize', handleFeatureProgress)
        heroStage.removeEventListener('pointermove', handlePointerMove)
        heroStage.removeEventListener('pointerleave', handlePointerLeave)
      }
    }

    return () => {
      window.removeEventListener('scroll', handleParallax)
      window.removeEventListener('scroll', handleFeatureProgress)
      window.removeEventListener('resize', handleFeatureProgress)
    }
  }, [])

  return null
}
