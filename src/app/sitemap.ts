import type { MetadataRoute } from 'next'

import { getOfficialBlogPosts, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { OFFICIAL_SITE_URL } from '@/lib/site/official-site'

/** sitemap 依赖运行时 CMS 数据 */
export const dynamic = 'force-dynamic'

/**
 * 自动生成站点 sitemap
 * @returns sitemap 条目
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, useCases] = await Promise.all([
    getOfficialBlogPosts(),
    getOfficialUseCaseNavItems(),
  ])

  return [
    '',
    '/about/',
    '/blog/',
    '/contact/',
    '/faqs/',
    '/invite/',
    '/pricing/',
    '/privacy/',
    '/terms/',
    ...blogPosts.map((post) => `/blog/${post.slug}/`),
    ...useCases.map((useCase) => `/use-cases/${useCase.slug}/`),
  ].map((pathname) => ({
    url: new URL(pathname || '/', OFFICIAL_SITE_URL).toString(),
  }))
}
