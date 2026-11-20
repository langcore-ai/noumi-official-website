'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const LANGUAGES = [
  'English',
  '简体中文',
  '繁體中文（台灣）',
  '繁體中文（香港）',
  '日本語',
  '한국어',
  'ไทย',
  'Tiếng Việt',
  'हिन्दी',
  'español (España)',
  'español (Latinoamérica)',
  'Deutsch',
  'français (France)',
  'italiano',
  'português (Brasil)',
  'português (Portugal)',
  'Türkçe',
  'русский',
  'українська',
  'العربية',
]

/** Preview-only locale list; English remains the only supported language. */
export function OfficialFooterLanguage() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])
  return (
    <div
      className="footer-language"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false)
          trigger.current?.focus()
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          if (!open) setOpen(true)
          requestAnimationFrame(() =>
            root.current
              ?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')
              ?.focus(),
          )
        }
      }}
    >
      <button
        className="footer-language__trigger"
        ref={trigger}
        type="button"
        aria-label="Language: English"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <circle cx="10" cy="10" r="7" />
          <ellipse cx="10" cy="10" rx="3" ry="7" />
          <path d="M3 10h14" />
        </svg>
        <span>English</span>
        <svg
          className="footer-language__caret"
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="m4 7 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="footer-language__panel" role="listbox" aria-label="Language" id={id}>
          {LANGUAGES.map((language, index) => (
            <button
              type="button"
              role="option"
              key={language}
              aria-selected={index === 0}
              aria-disabled={index !== 0}
              onClick={() => {
                if (index === 0) {
                  setOpen(false)
                  trigger.current?.focus()
                }
              }}
            >
              {language}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Copy works on both HTTPS and the internal HTTP development preview. */
export function OfficialFooterContact({ email, label }: { email: string; label: string }) {
  const [status, setStatus] = useState('')
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    },
    [],
  )
  const copy = async () => {
    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email)
        copied = true
      }
    } catch {
      /* HTTP/permission fallback below. */
    }
    if (!copied) {
      const previousFocus = document.activeElement as HTMLElement | null
      const field = document.createElement('textarea')
      field.value = email
      field.setAttribute('readonly', '')
      field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;'
      document.body.appendChild(field)
      field.select()
      try {
        copied = document.execCommand('copy')
      } catch {
        copied = false
      } finally {
        field.remove()
        previousFocus?.focus()
      }
    }
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    setStatus(copied ? `Copied: ${email}` : email)
    dismissTimer.current = setTimeout(() => setStatus(''), 4000)
  }
  return (
    <div className="footer-contact">
      <button type="button" className="footer-contact__button" onClick={copy}>
        {label}
      </button>
      {status &&
        createPortal(
          <div role="status" className="footer-copy-toast">
            {status}
          </div>,
          document.body,
        )}
    </div>
  )
}
