'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'
import type {
  ConversionDashboard as Dashboard,
  ConversionTimeline,
} from '@/lib/site/conversion-types'
import './replay.css'

const errors: Record<string, string> = {
  conversion_not_configured:
    'Conversion queries are not configured. Configure the server-only product origin and service token, and the product PostHog query credentials.',
  conversion_limit_exceeded:
    'The selected range exceeds the visitor limit. Choose a shorter date range.',
  invalid_request: 'Choose a valid UTC date range of at most 31 days.',
  unauthorized: 'Administrator access is required. Sign in again to continue.',
  forbidden: 'Administrator access is required. Sign in again to continue.',
}
async function readConversion<T>(query: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`/api/site/conversions?${query}`, {
    signal,
    cache: 'no-store',
    credentials: 'same-origin',
  })
  if (!response.ok) {
    const data = (await response.json().catch((): null => null)) as { error?: string } | null
    throw new Error(
      errors[data?.error ?? ''] ||
        'Could not load conversion data. Check the connection and server configuration, then retry.',
    )
  }
  return response.json() as Promise<T>
}
const date = (value: string) => new Date(value).toLocaleString()
const eventLabels: Record<string, string> = {
  official_page_viewed: 'Viewed website page',
  official_cta_clicked: 'Clicked website CTA',
  official_product_auth_redirected: 'Opened product sign-in',
  user_registered: 'Account created',
  onboarding_started: 'Onboarding started',
  onboarding_completed: 'Onboarding completed',
  $pageview: 'Viewed product page',
  auth_flow_started: 'Authentication started',
  auth_flow_finished: 'Authentication attempt finished',
}

/** 官网只负责管理员交互；指标、关联与业务状态来自产品的统一只读查询。 */
export function ConversionDashboard() {
  const [draft, setDraft] = useState(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      from: new Date(Date.parse(today) - 6 * 86400000).toISOString().slice(0, 10),
      to: today,
      search: '',
    }
  })
  const [filter, setFilter] = useState({ ...draft, offset: '0' })
  const [revision, setRevision] = useState(0)
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<ConversionTimeline | null>(null)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState('')
  const [timelineRevision, setTimelineRevision] = useState(0)
  useEffect(() => {
    const control = new AbortController()
    setLoading(true)
    setError('')
    setData(null)
    void readConversion<Dashboard>(new URLSearchParams(filter).toString(), control.signal)
      .then((value) => {
        if (!control.signal.aborted) setData(value)
      })
      .catch((e: unknown) => {
        if (!control.signal.aborted)
          setError(e instanceof Error ? e.message : 'Unable to load conversion data.')
      })
      .finally(() => {
        if (!control.signal.aborted) setLoading(false)
      })
    return () => control.abort()
  }, [filter, revision])
  useEffect(() => {
    setTimeline(null)
    setTimelineError('')
    if (!selected) {
      setTimelineLoading(false)
      return
    }
    const control = new AbortController()
    setTimelineLoading(true)
    void readConversion<ConversionTimeline>(
      new URLSearchParams({ from: filter.from, to: filter.to, visitor: selected }).toString(),
      control.signal,
    )
      .then((value) => {
        if (!control.signal.aborted) setTimeline(value)
      })
      .catch((e: unknown) => {
        if (!control.signal.aborted)
          setTimelineError(e instanceof Error ? e.message : 'Unable to load conversion data.')
      })
      .finally(() => {
        if (!control.signal.aborted) setTimelineLoading(false)
      })
    return () => control.abort()
  }, [selected, filter.from, filter.to, timelineRevision])
  const visitor = data?.visitors.find((row) => row.visitorId === selected)
  return (
    <div className="official-replay official-conversion">
      <header>
        <h1>Visitors and conversions</h1>
        <p>
          Connect observed website visits to real account creation, email verification and
          onboarding.
        </p>
      </header>
      <form
        className="official-replay__filter"
        onSubmit={(e) => {
          e.preventDefault()
          setSelected(null)
          setFilter({ ...draft, offset: '0' })
          setRevision((r) => r + 1)
        }}
      >
        <label>
          From (UTC)
          <input
            type="date"
            required
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </label>
        <label>
          Through (UTC)
          <input
            type="date"
            required
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
          />
        </label>
        <label>
          Find visitor or account
          <input
            value={draft.search}
            maxLength={253}
            placeholder="Email, username or Visitor ID"
            onChange={(e) => setDraft({ ...draft, search: e.target.value })}
          />
        </label>
        <button type="submit" disabled={loading} aria-busy={loading}>
          Apply
        </button>
        <button type="button" disabled={loading} onClick={() => setRevision((r) => r + 1)}>
          Refresh
        </button>
      </form>
      {loading ? <p role="status">Loading conversion data…</p> : null}
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button disabled={loading} onClick={() => setRevision((r) => r + 1)}>
            Retry
          </button>
        </div>
      ) : null}
      {data ? (
        <>
          <div className="official-conversion__metrics">
            {(
              [
                ['Observed website visitors', data.summary.visitors],
                ['Visitors who clicked the product entry', data.summary.enteredProduct],
                ['Visitors who created an account', data.summary.registered],
                ['Visitors who completed onboarding', data.summary.onboarded],
              ] as const
            ).map(([label, value]) => (
              <section key={label}>
                <h2>{label}</h2>
                <strong>{value.toLocaleString()}</strong>
              </section>
            ))}
          </div>
          <p>
            Website-to-account conversion:{' '}
            {new Intl.NumberFormat(undefined, {
              style: 'percent',
              maximumFractionDigits: 1,
            }).format(
              data.summary.visitors ? data.summary.registered / data.summary.visitors : 0,
            )}{' '}
            · Updated {date(data.generatedAt)}
          </p>
          <p>
            UTC website-visitor cohort; only consented events carrying a Visitor ID are observable.
            New accounts and native onboarding must complete within the selected range after the
            first website visit. Steps are independent observations, not a strict ordered funnel.
            Email verification shows current state. Missing events do not prove registration never
            happened.
          </p>
          {data.summary.ambiguous > 0 ? (
            <p role="status">
              {data.summary.ambiguous} visitors have multiple account associations; excluded from
              confirmed conversions.
            </p>
          ) : null}
          <div className="official-conversion__table">
            <table>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>First website visit</th>
                  <th>Associated accounts</th>
                  <th>Current account state</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.visitors.map((row) => (
                  <tr key={row.visitorId}>
                    <td>
                      <code>{row.visitorId}</code>
                      <p>{row.pageViews} page views</p>
                      {row.landingPage}
                    </td>
                    <td>{date(row.firstSeenAt)}</td>
                    <td>
                      {row.accounts.length
                        ? row.accounts.map((a) => <p key={a.id}>{a.email}</p>)
                        : 'No account association observed'}
                    </td>
                    <td>
                      {row.association === 'ambiguous' ? (
                        <p>Multiple account associations</p>
                      ) : null}
                      {row.accounts.map((a) => (
                        <div key={a.id}>
                          <p>
                            {row.registeredInWindow
                              ? 'Created in this conversion window'
                              : 'Existing account'}
                          </p>
                          <p>
                            {a.emailVerified ? 'Email verified' : 'Email awaiting verification'}
                          </p>
                          <p>
                            {a.legacyOnboarding
                              ? 'Legacy onboarding; excluded from native conversion'
                              : a.onboardingCompletedAt
                                ? 'Onboarding complete'
                                : 'Onboarding incomplete'}
                          </p>
                        </div>
                      ))}
                    </td>
                    <td>
                      <button onClick={() => setSelected(row.visitorId)}>View journey</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.visitors.length ? <p>No observed visitors match these filters.</p> : null}
          </div>
          <div className="official-replay__actions">
            <button
              disabled={Number(filter.offset) === 0 || loading}
              onClick={() => {
                setSelected(null)
                setFilter({ ...filter, offset: String(Math.max(0, Number(filter.offset) - 50)) })
              }}
            >
              Previous
            </button>
            <button
              disabled={data.nextOffset === null || loading}
              onClick={() => {
                setSelected(null)
                setFilter({ ...filter, offset: String(data.nextOffset) })
              }}
            >
              Next
            </button>
            <span>{data.total} matching visitors</span>
          </div>
          {visitor ? (
            <section className="official-conversion__detail">
              <div className="official-replay__header">
                <h2>Visitor journey · {visitor.visitorId}</h2>
                <button onClick={() => setSelected(null)}>Close</button>
              </div>
              <div className="official-replay__actions">
                <Link
                  href={`/admin/visit-replays?visitor=${encodeURIComponent(visitor.visitorId)}`}
                >
                  Website replays
                </Link>
                {visitor.accounts.map((a) => (
                  <a
                    key={a.id}
                    href={
                      new URL(
                        `/system-admin/product-analytics?user=${encodeURIComponent(a.id)}`,
                        process.env.NEXT_PUBLIC_NOUMI_PRODUCT_AUTH_URL ||
                          'https://www.noumi.ai/auth',
                      ).href
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Product replays · {a.email}
                  </a>
                ))}
              </div>
              {visitor.accounts.map((a) => (
                <p key={a.id}>
                  {a.email} · Account created {date(a.createdAt)}
                  {a.onboardingCompletedAt
                    ? ` · Onboarding completed ${date(a.onboardingCompletedAt)}`
                    : ''}
                </p>
              ))}
              {timelineLoading ? <p role="status">Loading journey…</p> : null}
              {timelineError ? (
                <div role="alert">
                  <p>{timelineError}</p>
                  <button
                    disabled={timelineLoading}
                    onClick={() => setTimelineRevision((r) => r + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : null}
              {timeline ? (
                <>
                  <ol>
                    {timeline.events.map((e) => (
                      <li key={`${e.surface}:${e.id}`}>
                        <time>{date(e.at)}</time> ·{' '}
                        {e.surface === 'website' ? 'Website' : 'Product'} ·{' '}
                        {eventLabels[e.event] || e.event} {e.path}
                      </li>
                    ))}
                  </ol>
                  {!timeline.events.length ? <p>No events observed in this range.</p> : null}
                  {timeline.truncated ? (
                    <p role="status">
                      Only the first 500 events are shown. Choose a shorter date range to see the
                      remaining events.
                    </p>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
