import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import {
  createPreviewLocaleCookie,
  getPreviewSecret,
  sanitizePreviewPath,
} from '@/lib/site/publishing'

/**
 * 开启官网草稿预览
 * 仅在密钥校验通过后允许进入预览态，避免未发布内容被公开访问。
 * @param request 当前请求
 * @returns 预览跳转响应
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const previewSecret = getPreviewSecret()
  const secret = url.searchParams.get('secret')

  if (!previewSecret || !secret || secret !== previewSecret) {
    return NextResponse.json({ message: 'Invalid preview secret.' }, { status: 401 })
  }

  const preview = await draftMode()
  preview.enable()

  const response = NextResponse.redirect(new URL(sanitizePreviewPath(url.searchParams.get('path')), url))
  const localeCookie = createPreviewLocaleCookie(url.searchParams.get('locale'))

  response.cookies.set(localeCookie.name, localeCookie.value, {
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
