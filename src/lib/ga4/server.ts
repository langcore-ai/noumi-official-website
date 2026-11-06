import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { CompactEncrypt, compactDecrypt } from 'jose'
import {
  ANALYTICS_SCOPE,
  CALLBACK_PATH,
  AnalyticsError,
  reportRequest,
  type AnalyticsReport,
  type DateRange,
  type ReportRow,
} from './core'

export type Ga4Runtime = {
  clientId: string
  clientSecret: string
  propertyId: string
  redirectUri: string
  key: Uint8Array
  bucket: R2Bucket
  prefix: string
}
type Connection = { refreshToken: string; id: string; connectedAt: string }
type TokenResponse = {
  access_token?: string
  refresh_token?: string
  scope?: string
  error?: string
}
type GoogleReport = {
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]
  rowCount?: number
  metadata?: { timeZone?: string; subjectToThresholding?: boolean; dataLossFromOtherRow?: boolean }
}
export async function getRuntime(): Promise<Ga4Runtime> {
  const { env } = await getCloudflareContext({ async: true })
  const runtime = env as CloudflareEnv & Record<string, unknown>
  const read = (name: string) => String(process.env[name] || runtime[name] || '').trim()
  const clientId = read('GA4_OAUTH_CLIENT_ID')
  const clientSecret = read('GA4_OAUTH_CLIENT_SECRET')
  const propertyId = read('GA4_PROPERTY_ID')
  const redirectUri = read('GA4_OAUTH_REDIRECT_URI')
  const secret = read('GA4_TOKEN_ENCRYPTION_KEY')
  let url: URL
  try {
    url = new URL(redirectUri)
  } catch {
    throw new AnalyticsError('not_configured', '请维护者配置 Google Analytics 连接参数。', 503)
  }
  if (
    !clientId ||
    !clientSecret ||
    !/^\d+$/.test(propertyId) ||
    !/^[a-fA-F0-9]{64}$/.test(secret) ||
    url.pathname !== CALLBACK_PATH ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    (url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))
  ) {
    throw new AnalyticsError('not_configured', '请维护者检查 Google Analytics 连接参数。', 503)
  }
  if (!env.R2) throw new AnalyticsError('storage_unavailable', '授权存储暂不可用。', 503)
  const key = Uint8Array.from(secret.match(/../g)!, (hex) => parseInt(hex, 16))
  // Shared preview buckets must never share authorizations across origins or OAuth clients.
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${redirectUri}:${clientId}:${propertyId}`),
  )
  const namespace = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join(
    '',
  )
  return {
    clientId,
    clientSecret,
    propertyId,
    redirectUri,
    key,
    bucket: env.R2,
    prefix: `private/ga4/${namespace}`,
  }
}
export async function seal(runtime: Ga4Runtime, value: unknown): Promise<string> {
  return new CompactEncrypt(new TextEncoder().encode(JSON.stringify(value)))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(runtime.key)
}
export async function unseal<T>(runtime: Ga4Runtime, value: string): Promise<T> {
  const { plaintext } = await compactDecrypt(value, runtime.key, {
    keyManagementAlgorithms: ['dir'],
    contentEncryptionAlgorithms: ['A256GCM'],
  })
  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}
export async function readConnection(runtime: Ga4Runtime): Promise<Connection | null> {
  const stored = await runtime.bucket.get(`${runtime.prefix}/connection`)
  if (!stored) return null
  try {
    return await unseal<Connection>(runtime, await stored.text())
  } catch {
    throw new AnalyticsError(
      'connection_unreadable',
      '连接凭据无法读取，请管理员重新连接 Google。',
      409,
    )
  }
}
async function tokenRequest(
  runtime: Ga4Runtime,
  fields: Record<string, string>,
): Promise<TokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: runtime.clientId,
      client_secret: runtime.clientSecret,
      ...fields,
    }),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  })
  const data = (await response.json()) as TokenResponse
  if (!response.ok || !data.access_token) {
    if (data.error === 'invalid_grant')
      throw new AnalyticsError('reconnect_required', 'Google 授权已失效，请管理员重新连接。', 409)
    throw new AnalyticsError('google_auth_failed', 'Google 授权失败，请检查客户端配置后重试。', 502)
  }
  return data
}
async function googleReport(
  runtime: Ga4Runtime,
  accessToken: string,
  range: DateRange,
  dimension?: string,
): Promise<GoogleReport> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${runtime.propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(reportRequest(range, dimension)),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
    },
  )
  if (!response.ok) {
    if (response.status === 403)
      throw new AnalyticsError(
        'ga4_forbidden',
        '请确认授权账号拥有此 GA4 媒体资源的查看权限，且项目已启用 Google Analytics Data API。',
        403,
      )
    if (response.status === 429)
      throw new AnalyticsError('quota_exceeded', 'Google 查询配额暂时不足，请稍后再试。', 429)
    if (response.status === 400 && dimension?.startsWith('customEvent:'))
      throw new AnalyticsError(
        'dimension_unavailable',
        '按钮维度尚不可用，请确认 GA4 已创建对应事件级自定义维度。',
        422,
      )
    throw new AnalyticsError('ga4_unavailable', 'GA4 暂时无法提供报表，请稍后重试。', 502)
  }
  return (await response.json()) as GoogleReport
}
export async function saveAuthorization(runtime: Ga4Runtime, code: string, verifier: string) {
  const token = await tokenRequest(runtime, {
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: runtime.redirectUri,
  })
  if (!token.refresh_token || !token.scope?.split(' ').includes(ANALYTICS_SCOPE)) {
    throw new AnalyticsError('missing_consent', '请重新连接并勾选 Google Analytics 只读权限。', 400)
  }
  // Verify property access BEFORE replacing a working connection.
  await googleReport(runtime, token.access_token!, { startDate: 'yesterday', endDate: 'yesterday' })
  const connection: Connection = {
    refreshToken: token.refresh_token,
    id: crypto.randomUUID(),
    connectedAt: new Date().toISOString(),
  }
  await runtime.bucket.put(`${runtime.prefix}/connection`, await seal(runtime, connection))
}
export async function disconnect(runtime: Ga4Runtime) {
  // Local disconnect deliberately does not revoke the entire Google app grant.
  await runtime.bucket.delete(`${runtime.prefix}/connection`)
}
export async function getReport(runtime: Ga4Runtime, range: DateRange): Promise<AnalyticsReport> {
  const connection = await readConnection(runtime)
  if (!connection)
    throw new AnalyticsError('not_connected', '请管理员先连接 Google Analytics。', 409)
  const cacheKey = `${runtime.prefix}/reports/${connection.id}/${range.startDate}_${range.endDate}`
  const cached = await runtime.bucket.get(cacheKey)
  if (cached) {
    try {
      const value = await unseal<AnalyticsReport>(runtime, await cached.text())
      if (Date.now() - Date.parse(value.generatedAt) < 300000) return value
    } catch {
      /* Cache corruption must not block a fresh query. */
    }
  }
  const token = await tokenRequest(runtime, {
    grant_type: 'refresh_token',
    refresh_token: connection.refreshToken,
  })
  const dimensions = [
    undefined,
    'date',
    'pageLocation',
    'customEvent:button_location',
    'customEvent:button_text',
  ]
  const results = await Promise.allSettled(
    dimensions.map((dimension) => googleReport(runtime, token.access_token!, range, dimension)),
  )
  const warnings: string[] = []
  const reports = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.metadata?.subjectToThresholding)
        warnings.push('部分数据受到 GA4 隐私阈值限制。')
      if (result.value.metadata?.dataLossFromOtherRow)
        warnings.push('部分高基数数据被 GA4 合并为 (other)。')
      if (index >= 2 && result.value.rowCount > 100)
        warnings.push('分组表仅显示点击次数最多的 100 项。')
      return result.value
    }
    if (
      index >= 3 &&
      result.reason instanceof AnalyticsError &&
      result.reason.code === 'dimension_unavailable'
    ) {
      warnings.push(
        `${index === 3 ? '按钮位置' : '按钮文字'}维度尚不可用；请在 GA4 创建自定义维度并等待数据处理。`,
      )
      return {} as GoogleReport
    }
    throw result.reason
  })
  const rows = (report: GoogleReport): ReportRow[] =>
    (report.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || '(not set)',
      clicks: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    }))
  const total = rows(reports[0])[0]
  const report: AnalyticsReport = {
    range,
    generatedAt: new Date().toISOString(),
    clicks: total?.clicks || 0,
    users: total?.users || 0,
    daily: rows(reports[1]),
    pages: rows(reports[2]),
    positions: rows(reports[3]),
    texts: rows(reports[4]),
    warnings: [...new Set(warnings)],
    timeZone: reports[0].metadata?.timeZone || '',
  }
  // Encrypt cached reports too: the media bucket may have a public delivery path.
  await runtime.bucket.put(cacheKey, await seal(runtime, report))
  return report
}
