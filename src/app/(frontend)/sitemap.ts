import type { MetadataRoute } from 'next'

import { getPublishedBlogPosts, getFeaturePages, getSiteSettings, getUseCasePages } from '@/lib/site/cms'
import { buildAbsoluteUrl } from '@/lib/site/seo'
import { TEMPORARY_UI_PUBLIC_PATHS } from '@/lib/site/temporary-ui'

/** sitemap 依赖 Payload 运行时数据，避免在构建期访问占位 D1 绑定 */
export const dynamic = 'force-dynamic'

/**
 * 生成 sitemap
 * @returns sitemap 项
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [siteSettings, featurePages, useCasePages, blogPosts] = await Promise.all([
    getSiteSettings(),
    getFeaturePages(),
    getUseCasePages(),
    getPublishedBlogPosts(),
  ])
  const siteUrl = siteSettings.siteUrl?.trim()

  if (!siteUrl) {
    return []
  }

  const lastModified = new Date()
  const staticRoutes = TEMPORARY_UI_PUBLIC_PATHS.map((pathname) => ({
      url: buildAbsoluteUrl(pathname, siteUrl),
      lastModified,
      changeFrequency: pathname === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: pathname === '/' ? 1 : 0.7,
    }))

  const featureRoutes = featurePages.map((page) => ({
    url: buildAbsoluteUrl(`/features/${page.slug}/`, siteUrl),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const useCaseRoutes = useCasePages.map((page) => ({
    url: buildAbsoluteUrl(`/use-cases/${page.slug}/`, siteUrl),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const blogRoutes = blogPosts.map((post) => ({
    url: buildAbsoluteUrl(`/blog/${post.slug}/`, siteUrl),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.72,
  }))

  return [...staticRoutes, ...featureRoutes, ...useCaseRoutes, ...blogRoutes]
}
