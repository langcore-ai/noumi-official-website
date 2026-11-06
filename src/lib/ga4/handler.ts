import 'server-only'
import { base64url } from 'jose'
import type { User } from '@/payload-types'
import { hasAnyCmsRole } from '@/access/cms'
import { ANALYTICS_SCOPE, AnalyticsError, parseDateRange } from './core'
import {
  disconnect,
  getReport,
  getRuntime,
  readConnection,
  saveAuthorization,
  seal,
  unseal,
} from './server'

const COOKIE = 'noumi_ga4_oauth'
const COOKIE_PATH = '/api/site/ga4'
type State = {
  state: string
  verifier: string
  userId: string
  expires: number
  redirectUri: string
}
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }
const json = (value: unknown, status = 200) => Response.json(value, { status, headers })
const cookie = (value: string, secure: boolean, age: number) =>
  `${COOKIE}=${value}; Path=${COOKIE_PATH}; HttpOnly; SameSite=Lax; Max-Age=${age}${secure ? '; Secure' : ''}`
export async function handleGa4(
  request: Request,
  action: string,
  user: User | null,
): Promise<Response> {
  if (!user) return json({ error: 'unauthorized', message: '请先登录后台。' }, 401)
  if (!hasAnyCmsRole(user, ['content-editor', 'viewer']))
    return json({ error: 'forbidden', message: '无权查看分析数据。' }, 403)
  if (!['status', 'report', 'connect', 'callback', 'disconnect'].includes(action))
    return json({ error: 'not_found' }, 404)
  const modifying = ['connect', 'disconnect'].includes(action)
  if (request.method !== (modifying ? 'POST' : 'GET'))
    return json({ error: 'method_not_allowed' }, 405)
  if ((modifying || action === 'callback') && !hasAnyCmsRole(user, ['admin']))
    return json({ error: 'forbidden', message: '仅管理员可以管理 Google 连接。' }, 403)
  let runtime: Awaited<ReturnType<typeof getRuntime>> | undefined
  try {
    runtime = await getRuntime()
    const origin = new URL(runtime.redirectUri).origin
    const secure = runtime.redirectUri.startsWith('https:')
    // Next may normalize request.url to its internal listening address. Validate the incoming
    // Host against the configured origin; never use it to construct OAuth destinations.
    if (
      (request.headers.get('host') || new URL(request.url).host) !== new URL(origin).host ||
      (modifying && request.headers.get('origin') !== origin)
    ) {
      throw new AnalyticsError('invalid_origin', '请从配置的官网后台地址发起操作。', 403)
    }
    if (action === 'status') {
      const connection = await readConnection(runtime)
      return json({
        configured: true,
        connected: Boolean(connection),
        connectedAt: connection?.connectedAt || null,
        propertyId: runtime.propertyId,
      })
    }
    if (action === 'report')
      return json(await getReport(runtime, parseDateRange(new URL(request.url).searchParams)))
    if (action === 'disconnect') {
      await disconnect(runtime)
      return json({ connected: false })
    }
    if (action === 'connect') {
      const state = base64url.encode(crypto.getRandomValues(new Uint8Array(32)))
      const verifier = base64url.encode(crypto.getRandomValues(new Uint8Array(32)))
      const challenge = base64url.encode(
        new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))),
      )
      const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      auth.search = new URLSearchParams({
        client_id: runtime.clientId,
        redirect_uri: runtime.redirectUri,
        response_type: 'code',
        scope: ANALYTICS_SCOPE,
        access_type: 'offline',
        prompt: 'consent',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString()
      const encrypted = await seal(runtime, {
        state,
        verifier,
        userId: String(user.id),
        expires: Date.now() + 600000,
        redirectUri: runtime.redirectUri,
      } satisfies State)
      return Response.json(
        { url: auth.toString() },
        { headers: { ...headers, 'Set-Cookie': cookie(encrypted, secure, 600) } },
      )
    }
    const params = new URL(request.url).searchParams
    const rawCookie = request.headers
      .get('cookie')
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1)
    let state: State
    try {
      state = await unseal<State>(runtime, rawCookie || '')
    } catch {
      throw new AnalyticsError('invalid_state', '授权会话无效，请从后台重新连接。')
    }
    if (
      !state.state ||
      state.state !== params.get('state') ||
      state.userId !== String(user.id) ||
      !Number.isFinite(state.expires) ||
      state.expires < Date.now() ||
      state.redirectUri !== runtime.redirectUri
    ) {
      throw new AnalyticsError('invalid_state', '授权会话已过期或不匹配，请从后台重新连接。')
    }
    if (params.has('error'))
      throw new AnalyticsError('consent_denied', 'Google 授权未完成，请重试。')
    const code = params.get('code')
    if (!code || code.length > 4096)
      throw new AnalyticsError('invalid_code', 'Google 未返回有效授权码。')
    await saveAuthorization(runtime, code, state.verifier)
    return new Response(null, {
      status: 303,
      headers: {
        ...headers,
        Location: `${origin}/admin/analytics?google=connected`,
        'Set-Cookie': cookie('', secure, 0),
      },
    })
  } catch (error) {
    // Never return Google's raw response, authorization codes, tokens or client secrets.
    const safe =
      error instanceof AnalyticsError
        ? error
        : new AnalyticsError('unavailable', '分析服务暂不可用，请稍后重试或联系维护者。', 503)
    if (action === 'callback' && runtime) {
      return new Response(null, {
        status: 303,
        headers: {
          ...headers,
          Location: `${new URL(runtime.redirectUri).origin}/admin/analytics?google=${encodeURIComponent(safe.code)}`,
          'Set-Cookie': cookie('', runtime.redirectUri.startsWith('https:'), 0),
        },
      })
    }
    return json({ error: safe.code, message: safe.message }, safe.status)
  }
}
