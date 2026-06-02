// @ts-expect-error OpenNext 在构建后生成该入口，源码阶段不会存在类型声明。
import openNextWorker from './.open-next/worker.js'

/** 快照刷新 Worker 环境变量。 */
type SnapshotWorkerEnv = Cloudflare.Env & {
  /** 手动/定时刷新快照的独立 token。 */
  OFFICIAL_SNAPSHOT_REFRESH_TOKEN?: string
  /** 定时任务调用内部刷新 API 时使用的站点 origin。 */
  OFFICIAL_SNAPSHOT_REFRESH_ORIGIN?: string
  /** Payload 主密钥，未配置独立 token 时作为刷新 token 兜底。 */
  PAYLOAD_SECRET?: string
}

/** R2 中官网快照的默认目录前缀。 */
const DEFAULT_OFFICIAL_SNAPSHOT_R2_PREFIX = 'official-site-snapshots'
/** 跳过 HTML 快照读取的内部请求头。 */
const OFFICIAL_HTML_SNAPSHOT_BYPASS_HEADER = 'x-official-snapshot-bypass'
/** HTML 快照命中响应头。 */
const OFFICIAL_HTML_SNAPSHOT_HEADER = 'x-official-snapshot'
/** 不应按页面 HTML 快照处理的路径前缀。 */
const HTML_SNAPSHOT_EXCLUDED_PREFIXES = ['/api', '/admin', '/_next', '/assets', '/cdn-cgi']
/** 不应按页面 HTML 快照处理的独立文件路径。 */
const HTML_SNAPSHOT_EXCLUDED_PATHS = [
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-48x48.png',
  '/favicon-96x96.png',
  '/favicon-192x192.png',
  '/noumi.svg',
  '/noumi-white.svg',
  '/robots.txt',
  '/sitemap.xml',
]
/** 带扩展名路径通常是静态资源，不写 HTML 快照。 */
const HTML_SNAPSHOT_FILE_PATTERN = /\/[^/?#]+\.[^/?#]+$/

/**
 * 读取快照刷新 token。
 * @param env Worker 环境变量
 * @returns token；未配置时返回空串
 */
function getSnapshotRefreshToken(env: SnapshotWorkerEnv): string {
  return env.OFFICIAL_SNAPSHOT_REFRESH_TOKEN?.trim() || env.PAYLOAD_SECRET?.trim() || ''
}

/**
 * 读取定时刷新使用的站点 origin。
 * @param env Worker 环境变量
 * @returns 站点 origin
 */
function getSnapshotRefreshOrigin(env: SnapshotWorkerEnv): string {
  const rawOrigin = env.OFFICIAL_SNAPSHOT_REFRESH_ORIGIN?.trim() || 'https://noumi.ai'

  try {
    return new URL(rawOrigin).origin
  } catch {
    return 'https://noumi.ai'
  }
}

/**
 * 读取官网快照 R2 前缀。
 * @param env Worker 环境变量
 * @returns R2 key 前缀
 */
function getOfficialSnapshotPrefix(env: SnapshotWorkerEnv): string {
  const prefix = (env as { OFFICIAL_SNAPSHOT_R2_PREFIX?: string }).OFFICIAL_SNAPSHOT_R2_PREFIX

  return (prefix?.trim() || DEFAULT_OFFICIAL_SNAPSHOT_R2_PREFIX).replace(/^\/+|\/+$/g, '')
}

/**
 * 编码路径片段，避免 R2 key 里出现不稳定字符。
 * @param segment URL 路径片段
 * @returns 安全片段
 */
function encodeSnapshotPathSegment(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment))
  } catch {
    return encodeURIComponent(segment)
  }
}

/**
 * 生成页面 HTML 快照 R2 key。
 * @param env Worker 环境变量
 * @param pathname 页面路径
 * @returns R2 key
 */
function createOfficialHtmlSnapshotKey(env: SnapshotWorkerEnv, pathname: string): string {
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/g, '')
  const pathKey =
    normalizedPathname === '/'
      ? 'index'
      : normalizedPathname.replace(/^\/+/, '').split('/').map(encodeSnapshotPathSegment).join('/')

  return `${getOfficialSnapshotPrefix(env)}/html/${pathKey}/index.html`
}

/**
 * 判断当前路径是否可做页面 HTML 快照。
 * @param pathname 请求路径
 * @returns 是否为可缓存页面路径
 */
function isOfficialHtmlSnapshotPath(pathname: string): boolean {
  if (HTML_SNAPSHOT_EXCLUDED_PATHS.includes(pathname)) {
    return false
  }

  if (
    HTML_SNAPSHOT_EXCLUDED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return false
  }

  if (pathname !== '/' && pathname.endsWith('/')) {
    return false
  }

  return !HTML_SNAPSHOT_FILE_PATTERN.test(pathname)
}

/**
 * 判断请求是否处于草稿预览态。
 * @param request 当前请求
 * @returns 是否应绕过 HTML 快照
 */
function hasPreviewCookie(request: Request): boolean {
  const cookie = request.headers.get('cookie') || ''

  return cookie.includes('__prerender_bypass') || cookie.includes('__next_preview_data')
}

/**
 * 判断请求是否可以读取 HTML 快照。
 * @param request 当前请求
 * @returns 是否可以读取
 */
function canReadOfficialHtmlSnapshot(request: Request): boolean {
  const url = new URL(request.url)

  return (
    (request.method === 'GET' || request.method === 'HEAD') &&
    !request.headers.has(OFFICIAL_HTML_SNAPSHOT_BYPASS_HEADER) &&
    !hasPreviewCookie(request) &&
    !url.search &&
    isOfficialHtmlSnapshotPath(url.pathname)
  )
}

/**
 * 判断响应是否可以写入 HTML 快照。
 * @param response OpenNext 响应
 * @returns 是否可以缓存
 */
function canWriteOfficialHtmlSnapshot(response: Response): boolean {
  const contentType = response.headers.get('content-type') || ''

  return (
    response.status === 200 &&
    contentType.includes('text/html') &&
    !response.headers.has('set-cookie')
  )
}

/**
 * 读取快照脏标记是否存在。
 * @param env Worker 环境变量
 * @returns 是否存在 dirty marker
 */
async function hasOfficialSnapshotDirtyMarker(env: SnapshotWorkerEnv): Promise<boolean> {
  const object = await env.R2.get(`${getOfficialSnapshotPrefix(env)}/dirty.json`)

  return Boolean(object)
}

/**
 * 读取 R2 HTML 页面快照。
 * @param request 当前请求
 * @param env Worker 环境变量
 * @returns 命中时返回响应，否则返回 null
 */
async function readOfficialHtmlSnapshot(
  request: Request,
  env: SnapshotWorkerEnv,
): Promise<Response | null> {
  if (!canReadOfficialHtmlSnapshot(request) || (await hasOfficialSnapshotDirtyMarker(env))) {
    return null
  }

  const object = await env.R2.get(createOfficialHtmlSnapshotKey(env, new URL(request.url).pathname))

  if (!object) {
    return null
  }

  const headers = new Headers({
    'cache-control': 'public, max-age=0, s-maxage=3600',
    'content-type': object.httpMetadata?.contentType || 'text/html; charset=utf-8',
    [OFFICIAL_HTML_SNAPSHOT_HEADER]: 'hit',
  })

  return new Response(request.method === 'HEAD' ? null : object.body, {
    headers,
    status: 200,
  })
}

/**
 * 写入 R2 HTML 页面快照。
 * @param env Worker 环境变量
 * @param pathname 页面路径
 * @param response OpenNext 响应
 */
async function writeOfficialHtmlSnapshot(
  env: SnapshotWorkerEnv,
  pathname: string,
  response: Response,
): Promise<void> {
  if (!canWriteOfficialHtmlSnapshot(response) || (await hasOfficialSnapshotDirtyMarker(env))) {
    return
  }

  await env.R2.put(createOfficialHtmlSnapshotKey(env, pathname), await response.text(), {
    customMetadata: {
      generatedAt: new Date().toISOString(),
      pathname,
    },
    httpMetadata: {
      contentType: 'text/html; charset=utf-8',
    },
  })
}

/**
 * 在后台机会性回填当前页面 HTML 快照。
 * @param request 当前请求
 * @param response OpenNext 响应
 * @param env Worker 环境变量
 * @param ctx Worker 执行上下文
 */
function scheduleOfficialHtmlSnapshotBackfill(
  request: Request,
  response: Response,
  env: SnapshotWorkerEnv,
  ctx: ExecutionContext,
): void {
  const url = new URL(request.url)

  if (
    request.method !== 'GET' ||
    request.headers.has(OFFICIAL_HTML_SNAPSHOT_BYPASS_HEADER) ||
    url.search ||
    !isOfficialHtmlSnapshotPath(url.pathname)
  ) {
    return
  }

  ctx.waitUntil(writeOfficialHtmlSnapshot(env, url.pathname, response.clone()))
}

/**
 * 重新渲染并写入单个页面 HTML 快照。
 * @param route 页面路径
 * @param env Worker 环境变量
 * @param ctx Worker 执行上下文
 */
async function renderOfficialHtmlSnapshotRoute(
  route: string,
  env: SnapshotWorkerEnv,
  ctx: ExecutionContext,
): Promise<void> {
  const url = new URL(route, getSnapshotRefreshOrigin(env))

  if (!isOfficialHtmlSnapshotPath(url.pathname)) {
    return
  }

  const response = await openNextWorker.fetch(
    new Request(url, {
      headers: {
        [OFFICIAL_HTML_SNAPSHOT_BYPASS_HEADER]: '1',
      },
      method: 'GET',
    }),
    env,
    ctx,
  )

  await writeOfficialHtmlSnapshot(env, url.pathname, response)
}

/**
 * 从刷新 API 响应中读取本次覆盖的公开路由。
 * @param response 刷新 API 响应
 * @returns 公开路由列表
 */
async function readSnapshotRoutesFromRefreshResponse(response: Response): Promise<string[]> {
  try {
    const body = (await response.json()) as {
      result?: {
        routes?: unknown
      }
    }
    const routes = body.result?.routes

    return Array.isArray(routes)
      ? routes.filter((route): route is string => typeof route === 'string')
      : []
  } catch {
    return []
  }
}

/**
 * 按刷新结果重建全站页面 HTML 快照。
 * @param response 刷新 API 响应
 * @param env Worker 环境变量
 * @param ctx Worker 执行上下文
 */
async function populateOfficialHtmlSnapshotsFromRefreshResponse(
  response: Response,
  env: SnapshotWorkerEnv,
  ctx: ExecutionContext,
): Promise<void> {
  const routes = await readSnapshotRoutesFromRefreshResponse(response)

  for (const route of Array.from(new Set(routes))) {
    await renderOfficialHtmlSnapshotRoute(route, env, ctx)
  }
}

/**
 * 判断请求是否为手动刷新 API。
 * @param request 当前请求
 * @returns 是否为刷新 API 请求
 */
function isOfficialSnapshotRefreshApiRequest(request: Request): boolean {
  const url = new URL(request.url)

  return request.method === 'POST' && url.pathname === '/api/site/snapshots/refresh'
}

/**
 * 通过同一个手动刷新 API 触发全站快照刷新。
 * @param controller Cloudflare Cron 控制器
 * @param env Worker 环境变量
 * @param ctx Worker 执行上下文
 */
async function refreshOfficialSnapshotsFromCron(
  controller: ScheduledController,
  env: SnapshotWorkerEnv,
  ctx: ExecutionContext,
): Promise<void> {
  const token = getSnapshotRefreshToken(env)

  if (!token) {
    console.warn('[official-snapshot] skipped cron refresh because refresh token is missing')
    return
  }

  const url = new URL('/api/site/snapshots/refresh', getSnapshotRefreshOrigin(env))
  url.searchParams.set('mode', 'stale')
  url.searchParams.set('reason', `cron:${controller.cron}`)

  const response = await openNextWorker.fetch(
    new Request(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    }),
    env,
    ctx,
  )

  if (!response.ok) {
    console.error('[official-snapshot] cron refresh failed', {
      status: response.status,
      text: await response.text(),
    })

    return
  }

  await populateOfficialHtmlSnapshotsFromRefreshResponse(response.clone(), env, ctx)
}

export default {
  /**
   * 公开请求仍完全交给 OpenNext 生成的 Worker。
   */
  async fetch(request: Request, env: SnapshotWorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const snapshotResponse = await readOfficialHtmlSnapshot(request, env)

    if (snapshotResponse) {
      return snapshotResponse
    }

    const response = await openNextWorker.fetch(request, env, ctx)

    scheduleOfficialHtmlSnapshotBackfill(request, response, env, ctx)

    if (isOfficialSnapshotRefreshApiRequest(request) && response.ok) {
      ctx.waitUntil(populateOfficialHtmlSnapshotsFromRefreshResponse(response.clone(), env, ctx))
    }

    return response
  },

  /**
   * Cloudflare Cron 定时刷新 R2 JSON 快照。
   */
  scheduled(controller: ScheduledController, env: SnapshotWorkerEnv, ctx: ExecutionContext): void {
    ctx.waitUntil(refreshOfficialSnapshotsFromCron(controller, env, ctx))
  },
}
