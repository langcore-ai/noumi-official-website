'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { HOME_DELIVERABLES } from '@/lib/site/homepage-assets'

/** Only the selected preview is requested; full-size images load on explicit expansion. */
export function OfficialDeliverableShowcase() {
  const [selected, setSelected] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const dialog = useRef<HTMLDialogElement>(null)
  const item = HOME_DELIVERABLES[selected]

  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [expanded])

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % HOME_DELIVERABLES.length
        break
      case 'ArrowLeft':
        next = (index + HOME_DELIVERABLES.length - 1) % HOME_DELIVERABLES.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = HOME_DELIVERABLES.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    setSelected(next)
    tabs.current[next]?.focus({ preventScroll: true })
    tabs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  return (
    <div className="redesign-feature__visual deliverable-showcase">
      <div className="deliverable-tabs" role="tablist" aria-label="Deliverable types">
        {HOME_DELIVERABLES.map((entry, index) => (
          <button
            type="button"
            className="deliverable-tab"
            role="tab"
            key={entry.id}
            id={`type-${entry.id}`}
            aria-controls="deliverable-preview"
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            ref={(element) => {
              tabs.current[index] = element
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setSelected(index)
            }}
            onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => handleKey(event, index)}
          >
            <img src={entry.icon} alt="" width={28} height={28} loading="lazy" decoding="async" />
            <span>{entry.label}</span>
          </button>
        ))}
      </div>
      <div
        className="deliverable-preview"
        id="deliverable-preview"
        role="tabpanel"
        aria-labelledby={`type-${item.id}`}
      >
        <div className="deliverable-screenshot">
          <img
            src={item.preview}
            srcSet={`${item.mobile} 800w, ${item.preview} 1440w`}
            sizes="(max-width: 900px) calc(100vw - 72px), (max-width: 1504px) 63vw, 940px"
            alt={`${item.label} example in the Noumi workspace`}
            width={1440}
            height={826}
            loading="lazy"
            decoding="async"
          />
          <button
            type="button"
            className="preview-expand"
            aria-label={`Enlarge ${item.label} screenshot`}
            onClick={() => {
              setExpanded(true)
              dialog.current?.showModal()
            }}
          >
            ↗
          </button>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="preview-dialog"
        aria-label={`${item.label} screenshot`}
        onClose={() => setExpanded(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
      >
        <div className="preview-dialog__content">
          <button type="button" onClick={() => dialog.current?.close()}>
            Close
          </button>
          {expanded && <img src={item.full} alt={`${item.label} example in the Noumi workspace`} />}
        </div>
      </dialog>
    </div>
  )
}
