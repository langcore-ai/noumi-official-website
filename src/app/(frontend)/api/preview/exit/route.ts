import { draftMode } from 'next/headers'
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

  return NextResponse.redirect(new URL(sanitizePreviewPath(url.searchParams.get('path')), url))
}
