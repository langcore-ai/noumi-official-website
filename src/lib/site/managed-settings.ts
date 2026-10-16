import 'server-only'
import { cache } from 'react'
import type { Metadata } from 'next'
import { createOfficialMetadata as defaults, OFFICIAL_SITE_URL } from './official-site'
import type { MenuSetting, SeoConfig } from '@/payload-types'

export const getMenuSettings = cache(async (): Promise<MenuSetting | null> => {
  const { getSitePayloadClient } = await import('./payload-client')
  const payload = await getSitePayloadClient()
  const menu = await payload.findGlobal({
    slug: 'menu-settings',
    depth: 0,
    draft: false,
    overrideAccess: false,
  })
  return menu._status === 'published' && menu.enabled ? menu : null
})

const getSeo = cache(async (path: string): Promise<SeoConfig | undefined> => {
  const { getSitePayloadClient } = await import('./payload-client')
  const payload = await getSitePayloadClient()
  const { docs } = await payload.find({
    collection: 'seo-configs',
    locale: 'en',
    depth: 1,
    draft: false,
    overrideAccess: false,
    limit: 1,
    where: { and: [{ path: { equals: path } }, { _status: { equals: 'published' } }] },
  })
  return docs[0]
})

export async function createManagedMetadata(
  options: Parameters<typeof defaults>[0],
): Promise<Metadata> {
  const seo = await getSeo(options.pathname.replace(/\/+$/, '') || '/')
  if (!seo) return defaults(options)
  const image = typeof seo.image === 'object' ? seo.image?.url : undefined
  const base = defaults({
    ...options,
    title: seo.title?.trim() || options.title,
    description: seo.description?.trim() || options.description,
    image: seo.ogImageUrl?.trim() || image || options.image,
  })
  const canonical = seo.canonical?.trim() || new URL(options.pathname, OFFICIAL_SITE_URL).href
  const title = seo.ogTitle?.trim() || seo.title?.trim() || options.title
  const description = seo.ogDescription?.trim() || seo.description?.trim() || options.description
  return {
    ...base,
    keywords: seo.keywords
      ?.split(',')
      .map((word) => word.trim())
      .filter(Boolean),
    alternates: { ...base.alternates, canonical },
    openGraph: { ...base.openGraph, title, description, url: canonical },
    twitter: { ...base.twitter, title, description },
    robots: { index: !seo.noIndex, follow: !seo.noFollow },
  }
}

export async function getManagedJsonLd(
  path: string,
  fallback?: object | null,
): Promise<object | null> {
  const seo = await getSeo(path)
  return seo?.jsonLd && typeof seo.jsonLd === 'object' ? seo.jsonLd : (fallback ?? null)
}
