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
export const OFFICIAL_OG_IMAGE = '/assets/og-cover.webp'

/**
 * 官网浅色模式 favicon
 */
export const OFFICIAL_LIGHT_FAVICON = '/noumi.svg'

/**
 * 官网深色模式 favicon
 */
export const OFFICIAL_DARK_FAVICON = '/noumi-white.svg'

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
    title: options.title,
    description: options.description,
    icons: {
      icon: [
        {
          url: OFFICIAL_LIGHT_FAVICON,
          type: 'image/svg+xml',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: OFFICIAL_DARK_FAVICON,
          type: 'image/svg+xml',
          media: '(prefers-color-scheme: dark)',
        },
      ],
      shortcut: OFFICIAL_LIGHT_FAVICON,
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
