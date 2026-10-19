'use client'
import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type {
  ProductVisitDetail,
  ProductVisitList,
  ProductVisitSummary,
} from '@/lib/site/replay/types'
import { readReplay } from './api'
import './replay.css'

const RecordingPlayer = dynamic(() => import('./RecordingPlayer'), {
  ssr: false,
  loading: () => <p role="status">Loading player…</p>,
})
const eventLabels: Record<string, string> = {
  official_page_viewed: 'Viewed page',
  official_cta_clicked: 'Clicked call to action',
  official_product_auth_redirected: 'Opened product sign-in',
  official_invite_lookup_completed: 'Checked invitation',
  official_invite_request_submitted: 'Submitted invitation request',
}
const date = (timestamp: number) => new Date(timestamp).toLocaleString()

export function ReplayDashboard() {
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('')
  const [revision, setRevision] = useState(0)
  return (
    <div className="official-replay">
      <header className="official-replay__header">
        <div>
          <h1>Visit replays</h1>
          <p>Review website visits and the actions recorded during each visit.</p>
        </div>
        <button onClick={() => setRevision((value) => value + 1)}>Refresh</button>
      </header>
      <form
        className="official-replay__filter"
        onSubmit={(event) => {
          event.preventDefault()
          setFilter(input.trim())
          setRevision((value) => value + 1)
        }}
      >
        <label>
          Visitor ID
          <input
            placeholder="All visitors"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
          />
        </label>
        <button type="submit">Search</button>
        <button
          type="button"
          onClick={() => {
            setInput('')
            setFilter('')
          }}
        >
          Clear
        </button>
      </form>
      <VisitBrowser key={`${filter}:${revision}`} filter={filter} />
    </div>
  )
}

function VisitBrowser({ filter }: { filter: string }) {
  const [items, setItems] = useState<ProductVisitSummary[]>([])
  const [offset, setOffset] = useState(0)
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [configured, setConfigured] = useState(true)
  const [selected, setSelected] = useState<ProductVisitSummary | null>(null)
  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError('')
    void readReplay<ProductVisitList>(
      `visits?offset=${offset}&anonymousId=${encodeURIComponent(filter)}`,
      abort.signal,
    )
      .then((data) => {
        if (abort.signal.aborted) return
        setConfigured(data.configured)
        setNextOffset(data.nextOffset)
        setItems((previous) => {
          const visits = new Map(previous.map((item) => [item.visitId, item]))
          for (const item of data.items)
            if (
              !visits.has(item.visitId) ||
              visits.get(item.visitId)!.latestTimestamp < item.latestTimestamp
            )
              visits.set(item.visitId, item)
          return [...visits.values()].sort((a, b) => b.latestTimestamp - a.latestTimestamp)
        })
      })
      .catch((error) => {
        if (!abort.signal.aborted) setError(error.message)
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false)
      })
    return () => abort.abort()
  }, [offset, filter, retry])
  if (!configured)
    return (
      <p role="status">
        Visit replays are not configured. Set the server replay keys and environment scope to enable
        access.
      </p>
    )
  return (
    <div
      className={`official-replay__layout ${selected ? 'official-replay__layout--selected' : ''}`}
    >
      <aside className="official-replay__visits" aria-label="Visits">
        <h2>Visits</h2>
        {items.map((item) => (
          <button
            className="official-replay__visit"
            key={item.visitId}
            aria-pressed={selected?.visitId === item.visitId}
            onClick={() => setSelected(item)}
          >
            <strong>{date(item.latestTimestamp)}</strong>
            <span>Visitor {item.anonymousId?.slice(0, 8) ?? 'unknown'}</span>
            <span>{item.lastPage ?? 'Page not recorded'}</span>
          </button>
        ))}
        {!items.length && !loading && !error && <p>No visits recorded.</p>}
        {loading && <p role="status">Loading visits…</p>}
        {error && (
          <p role="alert">
            {error} <button onClick={() => setRetry((value) => value + 1)}>Retry</button>
          </p>
        )}
        {nextOffset !== null && !error && (
          <button disabled={loading} onClick={() => setOffset(nextOffset)}>
            Load more
          </button>
        )}
      </aside>
      <section className="official-replay__detail" aria-label="Visit details">
        {selected ? (
          <>
            <button className="official-replay__back" onClick={() => setSelected(null)}>
              Back to visits
            </button>
            <VisitDetail key={selected.visitId} visit={selected} />
          </>
        ) : (
          <p className="official-replay__empty">Select a visit to view its recordings.</p>
        )}
      </section>
    </div>
  )
}

function VisitDetail({ visit }: { visit: ProductVisitSummary }) {
  const [data, setData] = useState<ProductVisitDetail | null>(null)
  const [timeline, setTimeline] = useState(false)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selection, setSelection] = useState<{
    id: string
    seek: { timestamp: number } | null
  } | null>(null)
  const [position, setPosition] = useState<{ id: string; timestamp: number } | null>(null)
  const [visible, setVisible] = useState(50)
  const selectedId = selection?.id
  const onPosition = useCallback(
    (timestamp: number) => {
      if (selectedId)
        setPosition((previous) =>
          previous?.id === selectedId &&
          Math.floor(previous.timestamp / 1000) === Math.floor(timestamp / 1000)
            ? previous
            : { id: selectedId, timestamp },
        )
    },
    [selectedId],
  )
  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError('')
    void readReplay<ProductVisitDetail>(
      `visits/${visit.visitId}?includeEvents=${timeline}`,
      abort.signal,
    )
      .then((value) => {
        if (!abort.signal.aborted) setData(value)
      })
      .catch((error) => {
        if (!abort.signal.aborted) setError(error.message)
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false)
      })
    return () => abort.abort()
  }, [visit.visitId, timeline, retry])
  const current = data?.events
    .filter((event) => event.recordingId === position?.id && event.timestamp <= position.timestamp)
    .at(-1)?.eventId
  return (
    <>
      <h2>{date(visit.latestTimestamp)}</h2>
      <p className="official-replay__meta">
        Visitor {visit.anonymousId ?? 'unknown'}
        <br />
        Visit {visit.visitId}
      </p>
      {error && (
        <p role="alert">
          {error} <button onClick={() => setRetry((value) => value + 1)}>Retry</button>
        </p>
      )}
      {loading && <p role="status">Loading visit…</p>}
      {data && (
        <>
          <div className="official-replay__segments" aria-label="Recordings">
            {data.recordings.map((recording, index) => (
              <button
                key={recording.recordingId}
                aria-pressed={selectedId === recording.recordingId}
                onClick={() => setSelection({ id: recording.recordingId, seek: null })}
              >
                Recording {index + 1}
              </button>
            ))}
          </div>
          {!data.recordings.length ? (
            <p>No recordings are available for this visit.</p>
          ) : (
            !selection && <p>Select a recording or an event to open the player.</p>
          )}
          {selection && (
            <RecordingPlayer
              key={selection.id}
              recordingId={selection.id}
              seek={selection.seek}
              onPosition={onPosition}
              onClose={() => {
                setSelection(null)
                setPosition(null)
              }}
            />
          )}
          <div className="official-replay__header">
            <h3>Event timeline</h3>
            <button
              disabled={loading}
              onClick={() => {
                setTimeline(true)
                if (timeline) setRetry((value) => value + 1)
              }}
            >
              {timeline ? 'Refresh timeline' : 'Load timeline'}
            </button>
          </div>
          {data.incomplete && (
            <p className="official-replay__notice" role="status">
              This timeline is incomplete. Some recordings are unavailable or exceed the loading
              limits.
            </p>
          )}
          {timeline && !loading && !data.events.length && <p>No business events were recorded.</p>}
          <ol className="official-replay__timeline">
            {data.events.slice(0, visible).map((event) => (
              <li key={event.eventId}>
                <button
                  aria-current={current === event.eventId ? 'step' : undefined}
                  onClick={() =>
                    setSelection({ id: event.recordingId, seek: { timestamp: event.timestamp } })
                  }
                >
                  <time dateTime={new Date(event.timestamp).toISOString()}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </time>
                  <span>
                    <strong>{eventLabels[event.name] ?? event.name}</strong>
                    <span>
                      {event.route}
                      {event.properties.cta_id ? ` · ${event.properties.cta_id}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {data.events.length > visible && (
            <button onClick={() => setVisible((value) => value + 50)}>Load more events</button>
          )}
        </>
      )}
    </>
  )
}
