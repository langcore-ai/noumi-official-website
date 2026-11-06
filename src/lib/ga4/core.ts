/** Pure GA4 request validation shared by the server and its tests. */
export const ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
export const CALLBACK_PATH = '/api/site/ga4/callback'
export type DateRange = { startDate: string; endDate: string }
export type ReportRow = { label: string; clicks: number; users: number }
export type AnalyticsReport = {
  range: DateRange
  generatedAt: string
  clicks: number
  users: number
  daily: ReportRow[]
  pages: ReportRow[]
  positions: ReportRow[]
  texts: ReportRow[]
  warnings: string[]
  timeZone: string
}
export class AnalyticsError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}
export function parseDateRange(params: URLSearchParams): DateRange {
  const startDate = params.get('startDate') || ''
  const endDate = params.get('endDate') || ''
  const valid = (date: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date
  if (!valid(startDate) || !valid(endDate))
    throw new AnalyticsError('invalid_dates', '请选择有效的开始和结束日期。')
  const days = (Date.parse(endDate) - Date.parse(startDate)) / 86400000
  if (days < 0 || days > 365)
    throw new AnalyticsError('invalid_dates', '日期范围须为 1 至 366 天。')
  return { startDate, endDate }
}
export function reportRequest(range: DateRange, dimension?: string) {
  return {
    dateRanges: [range],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    ...(dimension ? { dimensions: [{ name: dimension }] } : {}),
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        stringFilter: { matchType: 'EXACT', value: 'try_free_click', caseSensitive: true },
      },
    },
    limit: dimension === 'date' ? 366 : 100,
    orderBys:
      dimension === 'date'
        ? [{ dimension: { dimensionName: 'date' } }]
        : [{ metric: { metricName: 'eventCount' }, desc: true }],
    returnPropertyQuota: true,
  }
}
