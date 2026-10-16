import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getCanonicalRedirectPath } from '@/lib/site/url'

/**
 * 统一前台页面 URL：带 trailing slash 的页面永久重定向到首选无 slash 版本。
 * @param request 当前请求
 * @returns 继续处理或 301 重定向响应
 */
export async function middleware(request: NextRequest) {
  const redirectPathname = getCanonicalRedirectPath({
    method: request.method,
    pathname: request.nextUrl.pathname,
  })

  if (!redirectPathname) {
    // Production Worker resolves D1 rules before HTML snapshots. Next local mode uses the same resolver via API.
    if (
      !request.headers.has('x-noumi-routing-checked') &&
      ['GET', 'HEAD'].includes(request.method)
    ) {
      try {
        const endpoint = new URL('/api/site/redirect', request.url)
        endpoint.searchParams.set('path', request.nextUrl.pathname)
        const response = await fetch(endpoint, {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        })
        if (response.ok) {
          const rule = (await response.json()) as { target: string; type: string } | null
          if (
            rule?.target?.startsWith('/') &&
            !rule.target.startsWith('//') &&
            ['301', '302'].includes(rule.type)
          ) {
            const target = new URL(request.url)
            target.pathname = rule.target
            return NextResponse.redirect(target, Number(rule.type))
          }
        }
      } catch (error) {
        console.error('Managed redirect lookup failed', error)
      }
    }
    const headers = new Headers(request.headers)
    headers.set('x-noumi-pathname', request.nextUrl.pathname)
    return NextResponse.next({ request: { headers } })
  }

  const url = new URL(request.url)
  url.pathname = redirectPathname

  return NextResponse.redirect(url.toString(), 301)
}

export const config = {
  matcher: ['/((?!api|admin|_next|assets).*)'],
}
