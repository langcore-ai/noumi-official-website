'use client'
import { useEffect, useState } from 'react'
import ReplayPlayer, { type ReplayEvents } from './ReplayPlayer'
import { readReplay } from './api'

export default function RecordingPlayer({
  recordingId,
  seek,
  onPosition,
  onClose,
}: {
  recordingId: string
  seek: { timestamp: number } | null
  onPosition: (timestamp: number) => void
  onClose: () => void
}) {
  const [events, setEvents] = useState<ReplayEvents | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [url, setUrl] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    setEvents(null)
    setError('')
    setUrl(null)
    void readReplay<ReplayEvents>(`recordings/${recordingId}/events`, abort.signal)
      .then((value) => {
        if (!abort.signal.aborted) setEvents(value)
      })
      .catch((error) => {
        if (!abort.signal.aborted) setError(error.message)
      })
    return () => abort.abort()
  }, [recordingId, revision])
  useEffect(() => {
    if (!linkLoading) return
    const abort = new AbortController()
    void readReplay<{ url: string }>(`recordings/${recordingId}/player`, abort.signal)
      .then((value) => {
        if (!abort.signal.aborted) setUrl(value.url)
      })
      .catch((error) => {
        if (!abort.signal.aborted) setError(error.message)
      })
      .finally(() => {
        if (!abort.signal.aborted) setLinkLoading(false)
      })
    return () => abort.abort()
  }, [recordingId, linkLoading])
  return (
    <div className="official-replay__player-panel">
      <div className="official-replay__actions">
        <button onClick={() => setRevision((value) => value + 1)}>Reload replay</button>
        <button onClick={onClose}>Close replay</button>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
            Open in new window
          </a>
        ) : (
          <button disabled={linkLoading} onClick={() => setLinkLoading(true)}>
            {linkLoading ? 'Preparing…' : 'Prepare new window'}
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {!events && !error && <p role="status">Loading replay…</p>}
      {events && (
        <ReplayPlayer key={revision} events={events} seek={seek} onPosition={onPosition} />
      )}
    </div>
  )
}
