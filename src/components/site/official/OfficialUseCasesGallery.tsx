'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import content from './use-cases/content.json'
import { initializeCaseLayout } from './use-cases/controller'
import './use-cases/gallery.css'

const cases = content.cases
const caseFromLocation = () => {
  const id = Number(new URLSearchParams(window.location.search).get('case'))
  return cases.some((item) => item.id === id) ? id : 1
}

/** All markup is reviewed repository content, never CMS/user-supplied HTML. */
export function OfficialUseCasesGallery() {
  const [selected, setSelected] = useState(1)
  const root = useRef<HTMLDivElement>(null)
  const sidebar = useRef<HTMLElement>(null)
  const gallery = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const entry = cases[selected - 1]

  useLayoutEffect(() => {
    if (!root.current) return
    return initializeCaseLayout(root.current, entry.data)
  }, [entry])

  useEffect(() => {
    const restore = () => {
      setSelected(caseFromLocation())
      // Accept older case links, then keep the public address clean.
      const url = new URL(window.location.href)
      if (url.searchParams.has('case')) {
        url.searchParams.delete('case')
        window.history.replaceState(window.history.state, '', url)
      }
    }
    restore()
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  useEffect(() => {
    const nav = sidebar.current
    const host = gallery.current
    if (!nav || !host) return
    let disposed = false
    const reveal = () => {
      if (disposed) return
      const current = nav.querySelector<HTMLElement>('[aria-current="page"]')
      if (!current) return
      const box = nav.getBoundingClientRect()
      const item = current.getBoundingClientRect()
      if (matchMedia('(max-width:780px)').matches) {
        if (item.left < box.left + 8) nav.scrollLeft += item.left - box.left - 8
        else if (item.right > box.right - 8) nav.scrollLeft += item.right - box.right + 8
      } else {
        if (item.top < box.top + 8) nav.scrollTop += item.top - box.top - 8
        else if (item.bottom > box.bottom - 8) nav.scrollTop += item.bottom - box.bottom + 8
      }
    }
    // The official header can change height on narrow screens and at larger zoom levels.
    const header = document.querySelector<HTMLElement>('.site-header')
    const sizeHeader = () => {
      host.style.setProperty(
        '--gallery-header-height',
        `${header?.getBoundingClientRect().height || 70}px`,
      )
      reveal()
    }
    const observer = new ResizeObserver(sizeHeader)
    if (header) observer.observe(header)
    observer.observe(nav)
    sizeHeader()
    document.fonts.ready.then(reveal)
    return () => {
      disposed = true
      observer.disconnect()
    }
  }, [selected])

  const choose = (id: number) => {
    if (id !== selected && stage.current) {
      // A shorter case can pull the sticky sidebar out from under the pointer.
      // Return to the content start before replacing it, in the same paint.
      const top = stage.current.getBoundingClientRect().top
      const header = document.querySelector<HTMLElement>('.site-header')
      const offset =
        (header?.getBoundingClientRect().bottom || 70) +
        (matchMedia('(max-width:780px)').matches ? 0 : 12)
      if (top < offset) {
        window.scrollTo({ top: Math.max(0, window.scrollY + top - offset), behavior: 'instant' })
      }
    }
    setSelected(id)
  }

  return (
    <div className="se-gallery" ref={gallery}>
      <div className="showcase-shell">
        <div dangerouslySetInnerHTML={{ __html: content.header }} />
        <div className="showcase-stage" ref={stage}>
          <nav aria-label="Use cases" className="showcase-sidebar" ref={sidebar}>
            {cases.map((item) => (
              <button
                key={item.id}
                type="button"
                className="showcase-case-link"
                data-case={item.id}
                aria-current={item.id === selected ? 'page' : undefined}
                aria-label={`Case ${item.id}: ${item.title}`}
                // Layout/scroll can fire pointerenter without the mouse moving.
                // Only actual pointer motion should preview a different case.
                onPointerMove={(event) => {
                  if (
                    event.pointerType !== 'touch' &&
                    matchMedia('(hover:hover) and (pointer:fine)').matches
                  )
                    choose(item.id)
                }}
                onClick={() => choose(item.id)}
              >
                <span className="case-number" aria-hidden="true">
                  {item.id}
                </span>
                <span className="case-title">{item.title}</span>
              </button>
            ))}
          </nav>
          <div
            id="se-case-view"
            ref={root}
            data-case={selected}
            aria-label={`Case ${selected}: ${entry.title}`}
            dangerouslySetInnerHTML={{ __html: entry.html }}
          />
        </div>
      </div>
    </div>
  )
}
