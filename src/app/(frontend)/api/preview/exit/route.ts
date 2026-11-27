import { cookies, draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { sanitizePreviewPath } from '@/lib/site/publishing'

/**
 * 退出官网草稿预览
 * @param request 当前请求
 * @returns 退出预览后的跳转响应
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const preview = await draftMode()

  preview.disable()

  if (process.env.CLOUDFLARE_ENV === 'local' && url.protocol === 'http:') {
    const cookieStore = await cookies()
    cookieStore.set('__prerender_bypass', '', {
      expires: new Date(0),
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
    })
  }

  return new NextResponse(null, {
    status: 307,
    headers: { Location: sanitizePreviewPath(url.searchParams.get('path')) },
  })
}
