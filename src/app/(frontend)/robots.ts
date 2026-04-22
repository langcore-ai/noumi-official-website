import type { MetadataRoute } from 'next'

import { OFFICIAL_SITE_URL } from '@/lib/site/official-site'

/** robots 依赖 Payload 运行时数据，避免在构建期访问占位 D1 绑定 */
export const dynamic = 'force-dynamic'

/**
 * 生成 robots.txt
 * @returns robots 配置
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${OFFICIAL_SITE_URL}/sitemap.xml`,
    host: OFFICIAL_SITE_URL,
  }
}
