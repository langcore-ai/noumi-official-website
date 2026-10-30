import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { denyNonSiteAdmin } from './admin-access'

/** 只代理一个固定只读接口；浏览器 Cookie 与 Payload 凭据永不转发给产品。 */
export async function conversionAdminRequest(request: Request): Promise<Response> {
  const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' }
  const json = (error: string, status: number) => Response.json({ error }, { status, headers })
  try {
    const denied = await denyNonSiteAdmin(request)
    if (denied) return denied
    let env: Record<string, unknown> = {}
    try {
      env = (await getCloudflareContext({ async: true })).env as unknown as Record<string, unknown>
    } catch {
      /* 本地由 process.env 提供。 */
    }
    const originValue = String(
      env.VISITOR_CONVERSION_PRODUCT_ORIGIN ?? process.env.VISITOR_CONVERSION_PRODUCT_ORIGIN ?? '',
    ).trim()
    const token = String(
      env.VISITOR_CONVERSION_SERVICE_TOKEN ?? process.env.VISITOR_CONVERSION_SERVICE_TOKEN ?? '',
    ).trim()
    if (!originValue || !token) return json('conversion_not_configured', 503)
    const origin = new URL(originValue)
    if (
      origin.username ||
      origin.password ||
      origin.pathname !== '/' ||
      origin.search ||
      origin.hash ||
      (origin.protocol !== 'https:' &&
        !(origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname)))
    )
      return json('conversion_not_configured', 503)
    const incoming = new URL(request.url)
    const query = new URLSearchParams()
    for (const key of ['from', 'to', 'search', 'offset', 'visitor']) {
      const value = incoming.searchParams.get(key)
      if (value !== null) {
        if (value.length > 253) return json('invalid_request', 400)
        query.set(key, value)
      }
    }
    const response = await fetch(`${origin.origin}/_internal/visitor-conversions?${query}`, {
      headers: { authorization: `Bearer ${token}` },
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60000)]),
    })
    if (!response.ok) {
      const data = (await response.json().catch((): null => null)) as { error?: string } | null
      const code = [
        'conversion_not_configured',
        'conversion_limit_exceeded',
        'invalid_request',
        'conversion_visitor_not_found',
      ].includes(data?.error ?? '')
        ? data!.error!
        : 'conversion_unavailable'
      return json(code, [400, 404, 422, 503].includes(response.status) ? response.status : 502)
    }
    if (!response.body) return json('conversion_unavailable', 502)
    const reader = response.body.getReader()
    let size = 0
    const chunks: Uint8Array[] = []
    for (;;) {
      const chunk = await reader.read()
      if (chunk.done) break
      size += chunk.value.length
      if (size > 8 * 1024 * 1024) {
        await reader.cancel()
        return json('conversion_unavailable', 502)
      }
      chunks.push(chunk.value)
    }
    const data = JSON.parse(await new Blob(chunks).text()) as { version?: number }
    if (data.version !== 1) return json('conversion_unavailable', 502)
    return Response.json(data, { headers })
  } catch {
    return json('conversion_unavailable', 502)
  }
}
