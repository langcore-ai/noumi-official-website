/**
 * 官网 PostHog 同域 ingest 代理。
 *
 * 浏览器里的 posthog-js 把 `api_host` 指向 `/ingest`，请求先到达官网 Worker，
 * 再由这里原样转发给 PostHog。代理不解析事件体、不改属性，只处理传输层：
 * - 用 `CF-Connecting-IP` 覆盖 `X-Forwarded-For`，让 PostHog 按访客真实 IP 解析地理；
 * - 删除浏览器 Cookie、Referer 与非 PostHog 的 Authorization，避免把站点凭据或地址参数带给第三方；
 * - `/static/*` 与 `/array/*` 走资源域名并写入 Cloudflare 边缘缓存。
 */

/** 浏览器使用的同域 ingest 路径；与 `posthog.init({ api_host })` 保持一致。 */
export const POSTHOG_INGEST_PATH = '/ingest'

/** PostHog 事件/配置接口上游。 */
const POSTHOG_API_HOST = 'us.i.posthog.com'

/** PostHog SDK 静态资源与远程配置上游。 */
const POSTHOG_ASSET_HOST = 'us-assets.i.posthog.com'

/** PostHog SDK 使用 `Bearer phc_`/`phs_`/`phx_` 传递项目 token。 */
const POSTHOG_BEARER_PATTERN = /^Bearer ph[csx]_/

/** Worker 执行上下文里的后台任务入口。 */
type PostHogProxyContext = {
  waitUntil: (promise: Promise<unknown>) => void
}

/** Workers 运行时提供的 Cache API；DOM 类型里没有 `default`。 */
type WorkerCaches = CacheStorage & { default?: Cache }

/**
 * 把官网同域路径映射到 PostHog 上游 URL。
 *
 * @param pathname 请求 pathname
 * @param search 请求 query（含前导 `?`）
 * @returns 上游 URL；不属于 ingest 路径时返回 null
 */
export function resolvePostHogUpstream(pathname: string, search: string): string | null {
  if (pathname !== POSTHOG_INGEST_PATH && !pathname.startsWith(`${POSTHOG_INGEST_PATH}/`)) {
    return null
  }

  const rest = pathname.slice(POSTHOG_INGEST_PATH.length) || '/'
  const host =
    rest.startsWith('/static/') || rest.startsWith('/array/')
      ? POSTHOG_ASSET_HOST
      : POSTHOG_API_HOST

  return `https://${host}${rest}${search}`
}

/**
 * 构造转发给 PostHog 的请求头。
 *
 * @param headers 浏览器原始请求头
 * @param clientIp Cloudflare 边缘读到的访客 IP
 * @returns 清洗后的请求头
 */
export function buildPostHogProxyHeaders(headers: Headers, clientIp: string): Headers {
  const proxyHeaders = new Headers(headers)
  proxyHeaders.delete('cookie')
  proxyHeaders.delete('host')
  // 请求 Referer 是当前页面的完整 URL；来源已由 SDK 的 `$referrer` 属性携带，
  // 这里删除可避免把地址栏里的非渠道参数带给第三方。
  proxyHeaders.delete('referer')

  const authorization = proxyHeaders.get('authorization') ?? ''
  if (!POSTHOG_BEARER_PATTERN.test(authorization)) {
    proxyHeaders.delete('authorization')
  }

  if (clientIp) {
    proxyHeaders.set('x-forwarded-for', clientIp)
  }

  return proxyHeaders
}

/**
 * 判断路径是否属于可缓存的 SDK 静态资源或远程配置。
 *
 * @param pathname 请求 pathname
 * @returns 是否可缓存
 */
export function isCacheablePostHogAsset(pathname: string): boolean {
  return (
    pathname.startsWith(`${POSTHOG_INGEST_PATH}/static/`) ||
    pathname.startsWith(`${POSTHOG_INGEST_PATH}/array/`)
  )
}

/**
 * 把官网 ingest 请求转发到 PostHog。
 *
 * @param request 浏览器请求
 * @param ctx Worker 执行上下文，用于后台写入边缘缓存
 * @param send fetch 实现，便于测试注入
 * @returns PostHog 响应；路径不匹配时返回 404
 */
export async function proxyPostHogIngest(
  request: Request,
  ctx?: PostHogProxyContext,
  send: typeof fetch = fetch,
): Promise<Response> {
  const url = new URL(request.url)
  const upstreamUrl = resolvePostHogUpstream(url.pathname, url.search)
  if (!upstreamUrl) {
    return new Response(null, { status: 404 })
  }

  const headers = buildPostHogProxyHeaders(
    request.headers,
    request.headers.get('cf-connecting-ip')?.trim() || '',
  )
  const globalScope = globalThis as typeof globalThis & { caches?: WorkerCaches }
  const workerCaches = globalScope.caches
  const cache =
    isCacheablePostHogAsset(url.pathname) && request.method === 'GET'
      ? workerCaches?.default
      : undefined

  if (cache) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    const response = await send(upstreamUrl, { method: 'GET', headers })
    if (response.ok && ctx) {
      ctx.waitUntil(cache.put(request, response.clone()))
    }
    return response
  }

  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer()

  return send(upstreamUrl, {
    body,
    headers,
    method: request.method,
    redirect: 'manual',
  })
}
