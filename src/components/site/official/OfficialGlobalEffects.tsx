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
    const labels = new Set<HTMLElement>()
    const labelObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('subtitle-motion--visible')
        labelObserver.unobserve(entry.target)
      }
    })
    const scanLabels = () => {
      document
        .querySelectorAll<HTMLElement>(
          '.redesign-kicker, .sec-label, .prototype-page .subtitle-wrap',
        )
        .forEach((label) => {
          if (labels.has(label)) return
          labels.add(label)
          label.classList.add('subtitle-motion')
          labelObserver.observe(label)
        })
    }
    scanLabels()
    const labelMutations = new MutationObserver(scanLabels)
    labelMutations.observe(document.body, { childList: true, subtree: true })
    return () => {
      labelObserver.disconnect()
      labelMutations.disconnect()
      labels.forEach((label) =>
        label.classList.remove('subtitle-motion', 'subtitle-motion--visible'),
      )
    }
  }, [pathname])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target

            target.classList.add('in')
            target.classList.add('is-visible')
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
      if (!item.classList.contains('in') && !item.classList.contains('is-visible')) {
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

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [pathname])

  return null
}
