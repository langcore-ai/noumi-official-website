import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

import { buildPublicOfficialAnalyticsConfig } from '@/lib/site/analytics'

/** 官网分析配置接口依赖 runtime env，避免构建期静态化。 */
export const dynamic = 'force-dynamic'

/**
 * 读取当前环境中的公开埋点配置。
 *
 * @param key 埋点相关环境变量名
 * @returns 当前环境变量值；未配置时返回空串
 */
async function readRuntimeEnv(key: 'POSTHOG_ENABLED' | 'POSTHOG_PROJECT_KEY'): Promise<string> {
  const processValue = process.env[key]?.trim()
  if (processValue) {
    return processValue
  }

  try {
    const cloudflareContext = await getCloudflareContext({ async: true })
    const cloudflareValue = (
      cloudflareContext.env as typeof cloudflareContext.env & {
        POSTHOG_ENABLED?: string
        POSTHOG_PROJECT_KEY?: string
      }
    )[key]?.trim()

    return cloudflareValue || ''
  } catch {
    return ''
  }
}

/**
 * 返回浏览器可见的 PostHog 开关。
 * project key 与 ingest host 不下发浏览器，只由同源事件接口使用。
 *
 * @returns 埋点开关
 */
export async function GET() {
  const [enabledEnv, projectKey] = await Promise.all([
    readRuntimeEnv('POSTHOG_ENABLED'),
    readRuntimeEnv('POSTHOG_PROJECT_KEY'),
  ])

  return NextResponse.json(buildPublicOfficialAnalyticsConfig({ enabledEnv, projectKey }), {
    headers: { 'cache-control': 'no-store' },
  })
}
