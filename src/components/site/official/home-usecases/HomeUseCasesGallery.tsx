'use client'

import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

import content from './content.json'
import './gallery.css'

const ASSET_BASE = '/assets/usecases-gallery/assets'
const FADE_MS = 120
const HOVER_DEBOUNCE_MS = 60
const TOAST_MS = 2200

type LocaleText = { en?: string | null; zh?: string | null }
type Attachment = {
  kind?: 'image' | 'file' | 'link' | string
  isPlaceholder?: boolean
  name?: LocaleText | null
  label?: LocaleText | null
  caption?: LocaleText | null
  ext?: string | null
  src?: string | null
  url?: string | null
  baseDir?: string | null
}
type ArtifactFolder = {
  name?: LocaleText | null
  files?: { name?: LocaleText | null; ext?: string | null }[] | null
}
type Connector = { name?: LocaleText | null; logo?: string | null; color?: string | null }
type Impact = { tag?: LocaleText | null; desc?: LocaleText | null }
type GalleryCase = {
  id: string
  title: LocaleText
  type: 'A' | 'B' | string
  prompt: LocaleText
  reply?: LocaleText | null
  duration?: string | null
  impacts?: Impact[] | null
  inputAttachments?: Attachment[] | null
  outputAttachments?: Attachment[] | null
  artifacts?: ArtifactFolder[] | null
  connectors?: Connector[] | null
}
type Category = {
  id: string
  icon: string
  iconColor?: string | null
  label: LocaleText
  cases: GalleryCase[]
}

// Trusted build-time snapshot of the reviewed gallery JSON.
const galleryContent = content as unknown as { categories: Category[] }
const CATEGORIES = galleryContent.categories

const t = (field?: LocaleText | null) => field?.en ?? ''

const BRAND_ICONS = [
  { match: /gmail/i, src: 'icons/gmail.png', bg: '#ffffff' },
  { match: /google drive/i, src: 'icons/drive.png', bg: '#ffffff' },
]
const DB_ICON_RE = /(postgres|mysql|maria|sqlite|mongo|oracle|redis|database|数据库)/i

function getConnectorIcon(conn: Connector) {
  const name = `${t(conn.name)} ${conn.name?.zh ?? ''}`
  for (const icon of BRAND_ICONS) {
    if (icon.match.test(name)) return { ...icon, bg: icon.bg }
  }
  if (DB_ICON_RE.test(name)) return { src: 'icons/database.svg', bg: conn.color || '#6e86a4' }
  return null
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const EMAIL_RE = /([\w.+-]+@[\w-]+\.[\w.-]+)/g
const URL_RE = /(https?:\/\/[^\s<]+)/g
const HIGHLIGHT_RE = /==(.+?)==/g
const FILE_REF_RE = /(?<![\w.+-])@([\w][\w.-]*\.[A-Za-z0-9]{1,6})\b/g

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildFolderRefRe(folderNames: string[]) {
  if (!folderNames.length) return null
  const sorted = [...folderNames].sort((a, b) => b.length - a.length)
  const pattern = sorted.map((name) => escapeRegExp(escapeHtml(name))).join('|')
  return new RegExp(`(?<![\\w.+-])@(${pattern})\\b`, 'g')
}

function linkifyLine(rawLine: string, folderRefRe: RegExp | null) {
  let escaped = escapeHtml(rawLine)
  escaped = escaped.replace(
    HIGHLIGHT_RE,
    (_match, inner: string) => `<mark class="msg-highlight">${inner}</mark>`,
  )
  if (folderRefRe) {
    escaped = escaped.replace(
      folderRefRe,
      (match) => `<span class="msg-file-ref"><span class="msg-file-ref-icon">📁</span>${match}</span>`,
    )
  }
  escaped = escaped.replace(
    FILE_REF_RE,
    (match) => `<span class="msg-file-ref"><span class="msg-file-ref-icon">📄</span>${match}</span>`,
  )
  escaped = escaped.replace(EMAIL_RE, (match) => `<a href="mailto:${match}">${match}</a>`)
  escaped = escaped.replace(
    URL_RE,
    (match) => `<a href="${match}" target="_blank" rel="noopener">${match}</a>`,
  )
  return escaped
}

/** Trusted repository content only; never pass CMS or request text through this formatter. */
function formatMessageText(text: string, folderNames: string[]) {
  const folderRefRe = buildFolderRefRe(folderNames)
  const lines = text.split('\n')
  let html = ''
  let list: string[] = []

  const flushList = () => {
    if (!list.length) return
    html += `<ol class="msg-list">${list.map((item) => `<li>${linkifyLine(item, folderRefRe)}</li>`).join('')}</ol>`
    list = []
  }

  for (const line of lines) {
    if (line === '') {
      flushList()
      continue
    }
    const match = /^\d+\.\s+(.*)$/.exec(line)
    if (match) {
      list.push(match[1])
    } else {
      flushList()
      html += `<div class="msg-line">${linkifyLine(line, folderRefRe)}</div>`
    }
  }
  flushList()
  return html
}

function folderNamesFor(item: GalleryCase) {
  const names: string[] = []
  for (const folder of item.artifacts ?? []) {
    if (folder.name?.en) names.push(folder.name.en)
    if (folder.name?.zh) names.push(folder.name.zh)
  }
  return names
}

function HeroOrb() {
  return (
    <span className="nx-ma" aria-hidden="true">
      <svg className="nx-eyes" viewBox="0 0 50 40" fill="none">
        <g className="blink">
          <ellipse
            cx="17.5"
            cy="21"
            rx="9"
            ry="12.5"
            transform="rotate(-9 17.5 21)"
            fill="#fff"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse
            cx="33.5"
            cy="19.5"
            rx="9.5"
            ry="13"
            transform="rotate(7 33.5 19.5)"
            fill="#fff"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle className="pu" cx="19.5" cy="15.5" r="3.7" fill="currentColor" />
          <circle className="pu" cx="36" cy="14" r="3.9" fill="currentColor" />
          <circle className="hl" cx="16.2" cy="19.5" r="1.25" fill="#fff" />
          <circle className="hl" cx="32.1" cy="18" r="1.3" fill="#fff" />
        </g>
      </svg>
    </span>
  )
}

function MediaBlock({
  media,
  blockRef,
  onOpen,
  onPlaceholder,
}: {
  media: Attachment
  blockRef: (node: HTMLDivElement | null) => void
  onOpen: (src: string, alt: string) => void
  onPlaceholder: (name: string) => void
}) {
  const src = media.src ? `${ASSET_BASE}/cases/${media.src}` : null
  const alt = t(media.caption)
  const [shape, setShape] = useState<'loading' | 'wide' | 'tall' | 'done'>('loading')

  if (!src) {
    return (
      <div
        className="media-block is-placeholder"
        tabIndex={0}
        ref={blockRef}
        role="button"
        aria-label={alt || 'Placeholder attachment'}
        onClick={() => onPlaceholder(alt)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onPlaceholder(alt)
          }
        }}
      >
        <div>
          <div className="media-placeholder-badge">PLACEHOLDER</div>
          <br />
          <div className="media-placeholder-label">{alt}</div>
        </div>
        <div className="media-zoom-hint">Placeholder attachment</div>
      </div>
    )
  }

  return (
    <div
      ref={blockRef}
      className={`media-block${shape === 'loading' ? ' is-loading' : ''}${
        shape === 'wide' ? ' is-oversized-wide' : ''
      }${shape === 'tall' ? ' is-oversized-tall' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={alt || 'View full image'}
      onClick={() => onOpen(src, alt)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(src, alt)
        }
      }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={(event) => {
          const ratio = event.currentTarget.naturalWidth / event.currentTarget.naturalHeight
          setShape(ratio >= 2 ? 'wide' : ratio <= 0.5 ? 'tall' : 'done')
        }}
        onError={() => setShape('done')}
      />
      <div className="media-zoom-hint">↗ View full image</div>
    </div>
  )
}

function MediaRow({
  list,
  onOpen,
  onPlaceholder,
}: {
  list: Attachment[]
  onOpen: (src: string, alt: string) => void
  onPlaceholder: (name: string) => void
}) {
  const row = useRef<HTMLDivElement>(null)
  const blocks = useRef<(HTMLDivElement | null)[]>([])
  const current = useRef(0)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const go = (delta: number) => {
    const total = list.length
    current.current = (current.current + delta + total) % total
    row.current?.scrollTo({ left: blocks.current[current.current]?.offsetLeft ?? 0, behavior: 'smooth' })
  }

  const sync = () => {
    frame.current = 0
    const host = row.current
    if (!host) return
    let nearest = 0
    let distance = Infinity
    blocks.current.forEach((block, index) => {
      const next = Math.abs((block?.offsetLeft ?? 0) - host.scrollLeft)
      if (next < distance) {
        distance = next
        nearest = index
      }
    })
    current.current = nearest
  }

  return (
    <div className="media-wrap">
      <div
        className={`media-row${list.length <= 1 ? ' single' : ''}`}
        ref={row}
        onScroll={() => {
          if (frame.current) return
          frame.current = requestAnimationFrame(sync)
        }}
      >
        {list.map((media, index) => (
          <MediaBlock
            key={index}
            media={media}
            blockRef={(node) => void (blocks.current[index] = node)}
            onOpen={onOpen}
            onPlaceholder={onPlaceholder}
          />
        ))}
      </div>
      {list.length > 1 && (
        <div className="media-nav">
          <button
            type="button"
            className="media-nav-btn media-nav-prev"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation()
              go(-1)
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="media-nav-btn media-nav-next"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation()
              go(1)
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

function ArtifactsPanel({ item }: { item: GalleryCase }) {
  const hasArtifacts = Boolean(item.artifacts?.length)
  const hasConnectors = Boolean(item.connectors?.length)
  if (!hasArtifacts && !hasConnectors) return null

  return (
    <div className={`ac-panel${!hasArtifacts && hasConnectors ? ' ac-panel-compact' : ''}`}>
      {hasArtifacts && (
        <div className="ac-artifacts">
          <div className="ac-section-title">Project Files</div>
          <div className="ac-tree">
            {item.artifacts!.map((folder, index) => (
              <div key={index}>
                <div className="ac-tree-folder">
                  <span className="ac-tree-chevron">▾</span>
                  <span className="ac-tree-icon">📁</span>
                  <span className="ac-tree-name">{t(folder.name)}</span>
                </div>
                <div className="ac-tree-children">
                  {(folder.files ?? []).map((file, fileIndex) => (
                    <div className="ac-tree-file" key={fileIndex}>
                      <span className="ac-tree-name">{t(file.name)}</span>
                      {file.ext && <span className="ac-tree-ext">{file.ext}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasConnectors && (
        <div className="ac-connectors">
          <div className="ac-section-title">Connectors</div>
          <div className="ac-connectors-grid">
            {item.connectors!.map((conn, index) => {
              const icon = getConnectorIcon(conn)
              return (
                <div className="ac-connector-chip" key={index}>
                  {icon ? (
                    <span
                      className="ac-connector-logo ac-connector-logo-img"
                      style={{ background: icon.bg }}
                    >
                      <img src={`${ASSET_BASE}/${icon.src}`} alt="" />
                    </span>
                  ) : (
                    <span
                      className="ac-connector-logo"
                      style={{ background: conn.color || '#6e86a4' }}
                    >
                      {conn.logo}
                    </span>
                  )}
                  <span className="ac-connector-name">{t(conn.name)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function InputAttachments({
  list,
  onOpen,
  onPlaceholder,
}: {
  list: Attachment[]
  onOpen: (src: string, alt: string) => void
  onPlaceholder: (name: string) => void
}) {
  return (
    <div className="attachments">
      {list.map((attachment, index) => {
        if (attachment.kind === 'image') {
          const name = t(attachment.name)
          const src =
            attachment.isPlaceholder || !attachment.src
              ? null
              : `${ASSET_BASE}/files/${attachment.src}`
          return (
            <div
              key={index}
              className={`attachment-thumb${src ? '' : ' is-placeholder'}`}
              tabIndex={0}
              onClick={() => (src ? onOpen(src, name) : onPlaceholder(name))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  if (src) onOpen(src, name)
                  else onPlaceholder(name)
                }
              }}
            >
              {src ? <img src={src} alt={name} loading="lazy" /> : <span className="thumb-placeholder" />}
              <span>{name}</span>
            </div>
          )
        }

        const isLink = attachment.kind === 'link'
        const name = isLink ? t(attachment.label) : t(attachment.name)
        const href = isLink
          ? attachment.url
          : attachment.isPlaceholder || !attachment.src
            ? null
            : `${ASSET_BASE}/files/${attachment.src}`
        const badge = isLink ? 'LINK' : attachment.ext

        if (!href) {
          return (
            <div
              key={index}
              className="attachment-chip is-placeholder"
              tabIndex={0}
              onClick={() => onPlaceholder(name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onPlaceholder(name)
                }
              }}
            >
              <span className={isLink ? 'link-badge' : 'ext'}>{badge}</span>
              <span>{name}</span>
            </div>
          )
        }

        return (
          <a
            key={index}
            className="attachment-chip"
            href={href}
            {...(isLink ? { target: '_blank', rel: 'noopener' } : { download: '' })}
          >
            <span className={isLink ? 'link-badge' : 'ext'}>{badge}</span>
            <span>{name}</span>
          </a>
        )
      })}
    </div>
  )
}

function OutputCards({
  list,
  onPlaceholder,
}: {
  list: Attachment[]
  onPlaceholder: (name: string) => void
}) {
  return (
    <div className="output-cards">
      {list.map((attachment, index) => {
        const isLink = attachment.kind === 'link'
        const name = isLink ? t(attachment.label) : t(attachment.name)
        const href = isLink
          ? attachment.url
          : attachment.isPlaceholder || !attachment.src
            ? null
            : `${ASSET_BASE}/files/${attachment.src}`
        const badge = isLink ? 'LINK' : attachment.ext

        if (!href) {
          return (
            <div
              key={index}
              className="output-card is-placeholder"
              tabIndex={0}
              title={name}
              onClick={() => onPlaceholder(name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onPlaceholder(name)
                }
              }}
            >
              <span className="output-card-icon">{badge}</span>
              <span className="output-card-name">{name}</span>
            </div>
          )
        }

        return (
          <a
            key={index}
            className={`output-card ${isLink ? 'is-link' : 'is-file'}`}
            href={href}
            title={name}
            {...(isLink ? { target: '_blank', rel: 'noopener' } : { download: '' })}
          >
            <span className="output-card-icon">{badge}</span>
            <span className="output-card-name">{name}</span>
            {isLink && <span className="output-card-arrow">↗</span>}
          </a>
        )
      })}
    </div>
  )
}

function CaseBody({
  item,
  onOpen,
  onPlaceholder,
}: {
  item: GalleryCase
  onOpen: (src: string, alt: string) => void
  onPlaceholder: (name: string) => void
}) {
  if (item.type === 'B') {
    return (
      <div className="msg-block">
        <div className="msg-user">{t(item.prompt)}</div>
        <div className="impact-wrap">
          <div className="impact-arrow">➜ Triggers impact</div>
          <div className="impact-cards">
            {(item.impacts ?? []).map((impact, index) => (
              <div className="impact-card" key={index}>
                <span className="tag">{t(impact.tag)}</span>
                <div className="desc">{t(impact.desc)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const folderNames = folderNamesFor(item)
  const outputs = item.outputAttachments ?? []
  const outImages = outputs.filter((attachment) => attachment.kind === 'image')
  const outOther = outputs.filter(
    (attachment) => attachment.kind === 'file' || attachment.kind === 'link',
  )
  const hasSidePanel = Boolean(item.artifacts?.length || item.connectors?.length)

  const prompt = (
    <>
      <div
        className={`msg-user${hasSidePanel ? ' is-full-width' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatMessageText(t(item.prompt), folderNames) }}
      />
      {Boolean(item.inputAttachments?.length) && (
        <InputAttachments
          list={item.inputAttachments!}
          onOpen={onOpen}
          onPlaceholder={onPlaceholder}
        />
      )}
    </>
  )

  return (
    <div className="msg-block">
      {hasSidePanel ? (
        <div className="case-two-col">
          <div className="case-left-col">
            <ArtifactsPanel item={item} />
          </div>
          <div className="case-right-col">{prompt}</div>
        </div>
      ) : (
        prompt
      )}
      <div className={`status-box${hasSidePanel ? ' is-full-width' : ''}`}>
        <div className="status-left">
          <span className="status-check">✓</span>
          <span className="status-label">DONE</span>
          <span className="status-duration">Completed in {item.duration ?? ''}</span>
        </div>
        <span className="status-chevron" aria-hidden="true">
          ⌄
        </span>
      </div>
      <div
        className="ai-text"
        dangerouslySetInnerHTML={{ __html: formatMessageText(t(item.reply), folderNames) }}
      />
      {outOther.length > 0 && <OutputCards list={outOther} onPlaceholder={onPlaceholder} />}
      {outImages.length > 0 && (
        <MediaRow list={outImages} onOpen={onOpen} onPlaceholder={onPlaceholder} />
      )}
    </div>
  )
}

type LightboxState = { src: string; alt: string } | null

export function HomeUseCasesGallery() {
  const [catIndex, setCatIndex] = useState(0)
  const [caseIndex, setCaseIndex] = useState(0)
  const [shown, setShown] = useState({ cat: 0, case: 0 })
  const [visible, setVisible] = useState(true)
  const [hoverMode, setHoverMode] = useState(false)
  const [rowSplit, setRowSplit] = useState<number[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<LightboxState>(null)

  const shownRef = useRef(shown)
  const selectTimer = useRef<number | undefined>(undefined)
  const hoverTimer = useRef<number | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)
  const fadeFrame = useRef(0)
  const measure = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLDivElement | null)[]>([])
  const closeButton = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const cat = CATEGORIES[catIndex]
  const cases = cat.cases
  const active = CATEGORIES[shown.cat]?.cases[shown.case] ?? cases[0]

  const setShownCase = useCallback((next: { cat: number; case: number }) => {
    shownRef.current = next
    setShown(next)
  }, [])

  const swapContent = useCallback(
    (nextCat: number, nextCase: number, animate: boolean) => {
      cancelAnimationFrame(fadeFrame.current)
      clearTimeout(selectTimer.current)
      const current = shownRef.current
      if (current.cat === nextCat && current.case === nextCase) {
        setVisible(true)
        return
      }
      if (!animate) {
        setShownCase({ cat: nextCat, case: nextCase })
        setVisible(true)
        return
      }
      setVisible(false)
      selectTimer.current = window.setTimeout(() => {
        setShownCase({ cat: nextCat, case: nextCase })
        fadeFrame.current = requestAnimationFrame(() => setVisible(true))
      }, FADE_MS)
    },
    [setShownCase],
  )

  const selectCase = useCallback(
    (index: number) => {
      if (index === caseIndex) return
      setCaseIndex(index)
      swapContent(catIndex, index, true)
    },
    [caseIndex, catIndex, swapContent],
  )

  const updateUrl = useCallback((key: 'use-case' | 'use-case-category', id: string) => {
    const url = new URL(window.location.href)
    url.searchParams.delete('use-case-category')
    url.searchParams.delete('use-case')
    url.searchParams.set(key, id)
    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, '', url.href)
    }
  }, [])

  const selectCategory = useCallback(
    (index: number) => {
      updateUrl('use-case-category', CATEGORIES[index].id)
      if (index === catIndex && caseIndex === 0) return
      setCatIndex(index)
      setCaseIndex(0)
      swapContent(index, 0, false)
    },
    [caseIndex, catIndex, swapContent, updateUrl],
  )

  const showToast = useCallback((message: string) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  const placeholderToast = useCallback(
    (name: string) => showToast(`Placeholder attachment: "${name}" has no real file yet.`),
    [showToast],
  )

  const openLightbox = useCallback((src: string, alt: string) => {
    previousFocus.current = document.activeElement as HTMLElement | null
    setLightbox({ src, alt })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightbox(null)
  }, [])

  // Hover capability and URL-selected case, once per mount.
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const apply = () => setHoverMode(query.matches)
    apply()
    query.addEventListener?.('change', apply)
    return () => {
      query.removeEventListener?.('change', apply)
      clearTimeout(selectTimer.current)
      clearTimeout(hoverTimer.current)
      clearTimeout(toastTimer.current)
      cancelAnimationFrame(fadeFrame.current)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const caseId = params.get('use-case')
    const categoryId = params.get('use-case-category')
    if (caseId) {
      for (const [categoryIndex, category] of CATEGORIES.entries()) {
        const caseIndex = category.cases.findIndex((entry) => entry.id === caseId)
        if (caseIndex !== -1) {
          setCatIndex(categoryIndex)
          setCaseIndex(caseIndex)
          setShownCase({ cat: categoryIndex, case: caseIndex })
          setVisible(true)
          return
        }
      }
    }
    if (categoryId) {
      const categoryIndex = CATEGORIES.findIndex((entry) => entry.id === categoryId)
      if (categoryIndex !== -1) {
        setCatIndex(categoryIndex)
        setCaseIndex(0)
        setShownCase({ cat: categoryIndex, case: 0 })
      }
    }
  }, [setShownCase])

  // Sidebar fits the tracked labels into two tightly packed rows on narrow layouts.
  useEffect(() => {
    const host = measure.current
    if (!host) return
    const widths = Array.from(host.children).map(
      (child) => child.getBoundingClientRect().width,
    )
    let first = 0
    let second = 0
    const split: number[] = []
    widths.forEach((width) => {
      if (first <= second) {
        first += width
        split.push(1)
      } else {
        second += width
        split.push(2)
      }
    })
    setRowSplit(split)
  }, [catIndex])

  // Lightbox focus trap, scroll lock and focus restoration.
  useEffect(() => {
    if (!lightbox) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
      } else if (event.key === 'Tab') {
        event.preventDefault()
        closeButton.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus.current?.focus()
    }
  }, [lightbox, closeLightbox])

  const focusItemAt = (index: number) => {
    items.current[index]?.focus()
  }

  const startHover = useCallback(
    (index: number) => {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = window.setTimeout(() => selectCase(index), HOVER_DEBOUNCE_MS)
    },
    [selectCase],
  )

  const endHover = useCallback(() => clearTimeout(hoverTimer.current), [])

  const chooseCase = useCallback(
    (index: number) => {
      selectCase(index)
      updateUrl('use-case', cases[index].id)
    },
    [cases, selectCase, updateUrl],
  )

  // Alternate before measurement so the two-row shell stays stable.
  const split = rowSplit.length === cases.length ? rowSplit : cases.map((_, index) => (index % 2) + 1)
  const rows: ReactNode[] = [1, 2].map((row) => (
    <div className={`sidebar-row sidebar-row-${row}`} key={row}>
      {cases.map((item, index) =>
        split[index] === row ? (
          <CaseItem
            key={item.id}
            item={item}
            index={index}
            total={cases.length}
            active={index === caseIndex}
            hoverMode={hoverMode}
            itemRef={(node) => void (items.current[index] = node)}
            onHoverStart={startHover}
            onHoverEnd={endHover}
            onSelect={chooseCase}
            onFocusItem={focusItemAt}
          />
        ) : null,
      )}
    </div>
  ))

  return (
    <div className="home-usecases">
      <div className="page">
        <div className="hero">
          <h2 className="hero-title">
            What you can deliver with Noumi
            <HeroOrb />
          </h2>
          <Link className="hero-cta" href="/use-cases">
            <span>More Usecases</span>
          </Link>
        </div>
        <nav
          className={`pill-group${hoverMode ? '' : ' degraded'}`}
          aria-label="Use case categories"
        >
          {CATEGORIES.map((category, index) => (
            <button
              type="button"
              className={`pill${index === catIndex ? ' active' : ''}`}
              style={{ '--pill-icon-color': category.iconColor || 'currentColor' } as CSSProperties}
              key={category.id}
              onClick={() => selectCategory(index)}
            >
              <span className="pill-icon" dangerouslySetInnerHTML={{ __html: category.icon }} />
              <span>{t(category.label)}</span>
            </button>
          ))}
        </nav>
        <div className="stage">
          <div className="stage-card">
            <div
              className={`sidebar${hoverMode ? '' : ' degraded'}`}
              role="listbox"
              aria-label="Use case tasks"
            >
              {rows}
            </div>
            <div className="content">
              <div className={`case-fade${visible ? ' in' : ''}`}>
                <CaseBody
                  key={`${active.id}`}
                  item={active}
                  onOpen={openLightbox}
                  onPlaceholder={placeholderToast}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sidebar-row sidebar-measure" aria-hidden="true" ref={measure}>
        {cases.map((item, index) => (
          <div className={`case-item${index === caseIndex ? ' active' : ''}`} key={item.id}>
            <span>{t(item.title)}</span>
          </div>
        ))}
      </div>
      <div className={`toast${toast ? ' show' : ''}`} role="status">
        {toast ?? ''}
      </div>
      {lightbox && (
        <div
          className="lightbox show"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox()
          }}
        >
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            ref={closeButton}
            onClick={closeLightbox}
          />
          <img className="lightbox-img" src={lightbox.src} alt={lightbox.alt} />
        </div>
      )}
    </div>
  )
}

function CaseItem({
  item,
  index,
  total,
  active,
  hoverMode,
  itemRef,
  onHoverStart,
  onHoverEnd,
  onSelect,
  onFocusItem,
}: {
  item: GalleryCase
  index: number
  total: number
  active: boolean
  hoverMode: boolean
  itemRef: (node: HTMLDivElement | null) => void
  onHoverStart: (index: number) => void
  onHoverEnd: () => void
  onSelect: (index: number) => void
  onFocusItem: (index: number) => void
}) {
  return (
    <div
      className={`case-item${active ? ' active' : ''}`}
      role="option"
      aria-selected={active}
      tabIndex={0}
      data-index={index}
      ref={itemRef}
      onMouseEnter={() => hoverMode && onHoverStart(index)}
      onMouseLeave={() => hoverMode && onHoverEnd()}
      onFocus={() => onSelect(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(index)
        } else if (event.key === 'ArrowDown') {
          event.preventDefault()
          onFocusItem(Math.min(index + 1, total - 1))
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          onFocusItem(Math.max(index - 1, 0))
        }
      }}
      onClick={() => onSelect(index)}
    >
      <span>{t(item.title)}</span>
    </div>
  )
}
