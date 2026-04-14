import type { MetadataRoute } from 'next'

import { getSiteSettings } from '@/lib/site/cms'
import { buildAbsoluteUrl } from '@/lib/site/seo'

/** robots 依赖 Payload 运行时数据，避免在构建期访问占位 D1 绑定 */
export const dynamic = 'force-dynamic'

/**
 * 生成 robots.txt
 * @returns robots 配置
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteSettings = await getSiteSettings()
  const siteUrl = siteSettings.siteUrl?.trim()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: siteUrl ? buildAbsoluteUrl('/sitemap.xml', siteUrl) : undefined,
    host: siteUrl || undefined,
  }
}
