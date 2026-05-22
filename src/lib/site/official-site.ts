import type { Metadata } from 'next'

import { buildPreferredAbsoluteUrl, PREFERRED_SITE_URL } from '@/lib/site/url'

/**
 * 站点名称
 */
export const OFFICIAL_SITE_NAME = 'Noumi'

/**
 * 站点地址
 */
export const OFFICIAL_SITE_URL = PREFERRED_SITE_URL

/**
 * 默认分享图
 */
export const OFFICIAL_OG_IMAGE = '/assets/social/og-cover.webp'

/**
 * 标准品牌标识，适合浅色背景。
 */
export const OFFICIAL_LOGO = '/noumi.svg'

/**
 * 标准反白品牌标识，适合深色背景。
 */
export const OFFICIAL_LOGO_INVERTED = '/noumi-white.svg'

/**
 * 浏览器浅色模式使用的 favicon。
 */
export const OFFICIAL_FAVICON_LIGHT = `${OFFICIAL_LOGO}?v=light`

/**
 * 浏览器深色模式使用的 favicon。
 */
export const OFFICIAL_FAVICON_DARK = `${OFFICIAL_LOGO_INVERTED}?v=dark`

/**
 * Google Search 优先使用的稳定 favicon。
 */
export const OFFICIAL_FAVICON = '/favicon-96x96.png'

/**
 * 低分辨率场景使用的稳定 favicon。
 */
export const OFFICIAL_FAVICON_SMALL = '/favicon-48x48.png'

/**
 * 高分辨率场景使用的稳定 favicon。
 */
export const OFFICIAL_FAVICON_LARGE = '/favicon-192x192.png'

/**
 * 传统浏览器默认请求的 favicon。
 */
export const OFFICIAL_SHORTCUT_ICON = '/favicon.ico'

/**
 * iOS 主屏幕使用的触控图标。
 */
export const OFFICIAL_APPLE_TOUCH_ICON = '/apple-touch-icon.png'

/**
 * 解析分享图地址
 * @param image 页面级分享图
 * @returns 绝对 URL
 */
function resolveOfficialImageUrl(image?: null | string): string {
  const rawImage = image?.trim() || OFFICIAL_OG_IMAGE

  return buildPreferredAbsoluteUrl(rawImage, OFFICIAL_SITE_URL)
}

/**
 * 构建正式站点 metadata
 * @param options 标题与描述
 * @returns Next metadata
 */
export function createOfficialMetadata(options: {
  description: string
  image?: null | string
  pathname: string
  title: string
  type?: 'article' | 'website'
}): Metadata {
  const canonical = buildPreferredAbsoluteUrl(options.pathname, OFFICIAL_SITE_URL)
  const imageUrl = resolveOfficialImageUrl(options.image)

  return {
    metadataBase: new URL(OFFICIAL_SITE_URL),
    title: options.title,
    description: options.description,
    icons: {
      icon: [
        {
          url: OFFICIAL_FAVICON_LIGHT,
          sizes: 'any',
          type: 'image/svg+xml',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: OFFICIAL_FAVICON_DARK,
          sizes: 'any',
          type: 'image/svg+xml',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      apple: [
        {
          url: OFFICIAL_APPLE_TOUCH_ICON,
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    alternates: {
      canonical,
      languages: {
        'x-default': canonical,
      },
    },
    openGraph: {
      type: options.type ?? 'website',
      siteName: OFFICIAL_SITE_NAME,
      title: options.title,
      description: options.description,
      url: canonical,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${OFFICIAL_SITE_NAME} social preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [imageUrl],
    },
  }
}
