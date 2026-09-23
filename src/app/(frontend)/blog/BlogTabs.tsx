'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Blog 分类筛选：按钮沿用原型 `.blog-tab-*` 标记，分类来自 CMS 文章标签。
 * 过滤通过切换卡片 `hidden` 属性完成；无 JS 时全部文章照常展示。
 */
export function BlogTabs({
  categories,
  children,
}: {
  /** CMS 文章标签（按出现顺序去重） */
  categories: string[]
  /** 服务端渲染的卡片列表 */
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    for (const item of container.querySelectorAll<HTMLElement>('[data-tag]')) {
      item.hidden = activeCategory !== null && item.dataset.tag !== activeCategory
    }
  }, [activeCategory])

  const tabClassName = (isActive: boolean) =>
    ['blog-tab-link', 'w-inline-block', isActive ? 'w--current' : ''].filter(Boolean).join(' ')

  if (categories.length === 0) {
    return <div ref={containerRef}>{children}</div>
  }

  return (
    <div className="blog-tab" ref={containerRef}>
      <div
        aria-label="Filter articles by category"
        className="blog-tab-menu blog-info-padding"
        role="group"
      >
        <button
          aria-pressed={activeCategory === null}
          className={tabClassName(activeCategory === null)}
          onClick={() => setActiveCategory(null)}
          type="button"
        >
          <div>All</div>
        </button>
        {categories.map((category) => (
          <button
            aria-pressed={activeCategory === category}
            className={tabClassName(activeCategory === category)}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            <div>{category}</div>
          </button>
        ))}
      </div>
      <div className="blog-tab-content">{children}</div>
    </div>
  )
}
