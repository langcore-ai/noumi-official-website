import type { MetadataRoute } from 'next'

import {
  getOfficialBlogPosts,
  getOfficialFeatureNavItems,
  getOfficialUseCaseNavItems,
} from '@/lib/site/official-cms'
import { OFFICIAL_SITE_URL } from '@/lib/site/official-site'
import { buildPreferredAbsoluteUrl } from '@/lib/site/url'

/** sitemap 依赖运行时 CMS 数据 */
export const dynamic = 'force-dynamic'

/**
 * 自动生成站点 sitemap
 * @returns sitemap 条目
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, features, useCases] = await Promise.all([
    getOfficialBlogPosts(),
    getOfficialFeatureNavItems({ includeFallback: false }),
    getOfficialUseCaseNavItems(),
  ])

  return [
    '',
    '/about',
    '/blog',
    '/contact',
    '/faqs',
    '/features',
    '/invite',
    '/pricing',
    '/privacy',
    '/terms',
    '/use-cases',
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...features.map((feature) => feature.href),
    ...useCases.map((useCase) => `/use-cases/${useCase.slug}`),
  ].map((pathname) => ({
    url: buildPreferredAbsoluteUrl(pathname || '/', OFFICIAL_SITE_URL),
  }))
}
