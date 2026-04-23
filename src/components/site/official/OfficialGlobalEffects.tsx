'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 正式站点全局交互增强
 * 统一处理 reveal 动画与导航滚动阴影。
 * @returns 空节点
 */
export function OfficialGlobalEffects(): null {
  const pathname = usePathname()

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    const navigation = document.querySelector<HTMLElement>('[data-official-nav]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    revealItems.forEach((item) => {
      if (!item.classList.contains('in')) {
        observer.observe(item)
      }
    })

    const handleScroll = () => {
      if (!navigation) {
        return
      }

      navigation.style.boxShadow = window.scrollY > 16 ? '0 4px 28px rgba(28,27,46,0.07)' : 'none'
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  return null
}
