'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './security.module.css'

type Group = { id: string; title: string; items: { id: string; title: string }[] }

export function SecurityContents({ groups }: { groups: Group[] }) {
  const [activeId, setActiveId] = useState('')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const headings = groups
      .flatMap((group) => [group.id, ...group.items.map((item) => item.id)])
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => Boolean(heading))
    let frame = 0
    const update = () => {
      frame = 0
      const header = document.querySelector('.official-persistent-header')
      const readingLine = Math.max(
        (header?.getBoundingClientRect().bottom ?? 70) + 48,
        window.innerHeight * 0.3,
      )
      let current = ''
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > readingLine) break
        current = heading.id
      }
      setActiveId(current)
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('hashchange', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
    }
  }, [groups])

  useEffect(() => {
    const nav = navRef.current
    if (!nav || window.innerWidth <= 900 || !activeId) return
    const link = nav.querySelector<HTMLElement>('[aria-current="location"]')
    if (!link) return
    const bounds = nav.getBoundingClientRect()
    const item = link.getBoundingClientRect()
    if (item.top < bounds.top + 16) nav.scrollTop -= bounds.top + 16 - item.top
    else if (item.bottom > bounds.bottom - 16) nav.scrollTop += item.bottom - bounds.bottom + 16
  }, [activeId])

  return (
    <nav ref={navRef} className={styles.toc} aria-label="Security page contents">
      <p className={styles.kicker}>Contents</p>
      <ol>
        {groups.map((group) => {
          const inGroup = activeId === group.id || group.items.some((item) => item.id === activeId)
          return (
            <li key={group.id}>
              <a
                href={`#${group.id}`}
                data-active-group={inGroup || undefined}
                aria-current={activeId === group.id ? 'location' : undefined}
              >
                {group.title}
              </a>
              <ol>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={activeId === item.id ? 'location' : undefined}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
