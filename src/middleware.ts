import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getCanonicalRedirectPath } from '@/lib/site/url'

/**
 * 统一前台页面 URL：带 trailing slash 的页面永久重定向到首选无 slash 版本。
 * @param request 当前请求
 * @returns 继续处理或 301 重定向响应
 */
export function middleware(request: NextRequest) {
  const redirectPathname = getCanonicalRedirectPath({
    method: request.method,
    pathname: request.nextUrl.pathname,
  })

  if (!redirectPathname) {
    return NextResponse.next()
  }

  const url = new URL(request.url)
  url.pathname = redirectPathname

  return NextResponse.redirect(url.toString(), 301)
}

export const config = {
  matcher: ['/((?!api|admin|_next|assets).*)'],
}
