'use client'

import { useEffect, useRef, useState } from 'react'

export function BlogTabs({
  categories,
  children,
}: {
  categories: string[]
  children: React.ReactNode
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    for (const item of listRef.current?.querySelectorAll<HTMLElement>('[data-tag]') ?? []) {
      item.hidden = activeCategory !== null && item.dataset.tag !== activeCategory
    }
  }, [activeCategory])

  return (
    <div className="blog-catalog" data-filtered={activeCategory !== null}>
      {categories.length > 0 ? (
        <div aria-label="Filter articles by category" className="blog-filters" role="group">
          {[null, ...categories].map((category) => (
            <button
              aria-pressed={activeCategory === category}
              key={category ?? 'all-articles'}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category ?? 'All'}
            </button>
          ))}
        </div>
      ) : null}
      <div className="blog-results" ref={listRef}>
        {children}
      </div>
    </div>
  )
}
