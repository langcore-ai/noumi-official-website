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

    /**
     * 观察一个 reveal 节点。切页 loading 先挂载时，新页面内容会稍后插入 DOM。
     * 这里保持幂等，避免同一个节点被重复观察。
     */
    const observeRevealItem = (item: HTMLElement) => {
      if (!item.classList.contains('in')) {
        observer.observe(item)
      }
    }

    /**
     * 扫描节点及其子节点中的 reveal 元素。
     * @param node 新增 DOM 节点
     */
    const observeRevealTree = (node: Node) => {
      if (!(node instanceof HTMLElement)) {
        return
      }

      if (node.matches('.reveal')) {
        observeRevealItem(node)
      }

      node.querySelectorAll<HTMLElement>('.reveal').forEach(observeRevealItem)
    }

    document.querySelectorAll<HTMLElement>('.reveal').forEach(observeRevealItem)

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(observeRevealTree)
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
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
      mutationObserver.disconnect()
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  return null
}
