'use client'
import { useEffect, useState } from 'react'
import type { AnalyticsReport, ReportRow } from '@/lib/ga4/core'
type Status = { configured: boolean; connected: boolean; propertyId: string }
async function api<T>(path: string, method = 'GET', signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/site/ga4/${path}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })
  const data = (await response.json()) as T & { message?: string }
  if (!response.ok) throw new Error(data.message || '请求失败，请稍后重试。')
  return data
}
function date(offset: number) {
  const value = new Date()
  value.setDate(value.getDate() + offset)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}
function Table({ title, rows }: { title: string; rows: ReportRow[] }) {
  return (
    <section className="official-analytics__panel">
      <h2>{title}</h2>
      {rows.length ? (
        <div className="official-analytics__table">
          <table>
            <thead>
              <tr>
                <th scope="col">{title}</th>
                <th scope="col">点击次数</th>
                <th scope="col">点击用户数</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.clicks.toLocaleString()}</td>
                  <td>{row.users.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>此范围暂无可展示数据。</p>
      )}
    </section>
  )
}
const callbackMessages: Record<string, string> = {
  connected: 'Google Analytics 已连接。',
  invalid_state: '授权会话过期或不匹配，请重新连接。',
  consent_denied: 'Google 授权未完成，请重新连接。',
  missing_consent: '请重新连接，并勾选 Analytics 只读权限。',
  ga4_forbidden: '授权账号无法读取此媒体资源，请检查 GA4 查看权限与 Data API 启用状态。',
  reconnect_required: 'Google 授权已失效，请重新连接。',
}
export function AnalyticsDashboard({ canManage }: { canManage: boolean }) {
  const [status, setStatus] = useState<Status | null>(null)
  const [report, setReport] = useState<AnalyticsReport | null>(null)
  const [startDate, setStartDate] = useState(() => date(-27))
  const [endDate, setEndDate] = useState(() => date(0))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    const result = new URLSearchParams(window.location.search).get('google')
    if (result) setNotice(callbackMessages[result] || 'Google 连接未完成，请重试或联系维护者。')
    api<Status>('status', 'GET', controller.signal)
      .then(setStatus)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false)
      })
    return () => controller.abort()
  }, [])
  async function load() {
    setBusy(true)
    setError('')
    setReport(null)
    try {
      setReport(await api<AnalyticsReport>(`report?${new URLSearchParams({ startDate, endDate })}`))
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败。')
    } finally {
      setBusy(false)
    }
  }
  async function connect() {
    setBusy(true)
    setError('')
    try {
      const data = await api<{ url: string }>('connect', 'POST')
      window.location.assign(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : '连接失败。')
      setBusy(false)
    }
  }
  async function disconnect() {
    if (!window.confirm('断开后，后台将无法更新报表。GTM 和 GA4 仍会继续采集数据。确定断开？'))
      return
    setBusy(true)
    setError('')
    try {
      await api('disconnect', 'POST')
      setStatus((value) => (value ? { ...value, connected: false } : value))
      setReport(null)
      setNotice('已断开后台连接；如需撤销 Google 应用授权，请在 Google 账号中管理第三方连接。')
    } catch (e) {
      setError(e instanceof Error ? e.message : '断开失败。')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div aria-busy={busy}>
      {notice && <p role="status">{notice}</p>}
      {error && (
        <p role="alert" className="official-analytics__error">
          {error}
        </p>
      )}
      {busy && <p role="status">正在处理…</p>}
      {status && (
        <div className="official-analytics__status">
          <span>
            {status.connected ? 'Google Analytics 已连接' : 'Google Analytics 待连接'} · 媒体资源{' '}
            {status.propertyId}
          </span>
          {canManage && (
            <div className="official-analytics__actions">
              <button type="button" disabled={busy} onClick={connect}>
                {status.connected ? '重新连接 Google' : '连接 Google Analytics'}
              </button>
              {status.connected && (
                <button type="button" disabled={busy} onClick={disconnect}>
                  断开连接
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {status && !status.connected && (
        <p>
          {canManage
            ? '请用拥有该 GA4 媒体资源查看权限的公司 Google 账号授权。'
            : '请联系管理员连接 Google Analytics，完成后即可在这里查看数据。'}
        </p>
      )}
      {status?.connected && (
        <form
          className="official-analytics__filters"
          onSubmit={(event) => {
            event.preventDefault()
            void load()
          }}
        >
          <label>
            开始日期
            <input
              type="date"
              value={startDate}
              required
              disabled={busy}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label>
            结束日期
            <input
              type="date"
              value={endDate}
              min={startDate}
              required
              disabled={busy}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
          <button type="submit" disabled={busy}>
            查询数据
          </button>
        </form>
      )}
      {status?.connected && !report && !busy && !error && <p>选择日期后点击「查询数据」。</p>}
      {report && (
        <>
          <p>
            {report.range.startDate} 至 {report.range.endDate} ·{' '}
            {report.timeZone || 'GA4 媒体资源时区'} · 更新于{' '}
            {new Date(report.generatedAt).toLocaleString()}
          </p>
          {report.warnings.map((warning) => (
            <p role="status" key={warning}>
              {warning}
            </p>
          ))}
          <div className="official-analytics__cards">
            <section>
              <h2>免费试用点击</h2>
              <strong>{report.clicks.toLocaleString()}</strong>
            </section>
            <section>
              <h2>点击用户数</h2>
              <strong>{report.users.toLocaleString()}</strong>
            </section>
          </div>
          {!report.clicks && (
            <p>
              该日期范围暂无已处理的点击数据。这不表示埋点一定失效；请检查日期范围及 GA4 实时报告。
            </p>
          )}
          <Table
            title="每日趋势"
            rows={report.daily.map((row) => ({
              ...row,
              label: row.label.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'),
            }))}
          />
          <Table title="来源页面" rows={report.pages} />
          <div className="official-analytics__grid">
            <Table title="按钮位置" rows={report.positions} />
            <Table title="按钮文字" rows={report.texts} />
          </div>
          <p>各分组的用户可能重复出现，不能将分组用户数直接相加作为总用户数。</p>
        </>
      )}
    </div>
  )
}
