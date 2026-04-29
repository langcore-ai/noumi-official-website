import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

import {
  buildPublicOfficialAnalyticsConfig,
  OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
  OFFICIAL_ANALYTICS_DEFAULT_UI_HOST,
} from '@/lib/site/analytics'

/** 官网分析配置接口依赖 runtime env，避免构建期静态化。 */
export const dynamic = 'force-dynamic'

/**
 * 读取当前环境中的公开埋点配置。
 *
 * @param key 埋点相关环境变量名
 * @returns 当前环境变量值；未配置时返回空串
 */
async function readRuntimeEnv(
  key: 'POSTHOG_BROWSER_API_HOST' | 'POSTHOG_ENABLED' | 'POSTHOG_PROJECT_KEY' | 'POSTHOG_UI_HOST',
): Promise<string> {
  const processValue = process.env[key]?.trim()
  if (processValue) {
    return processValue
  }

  try {
    const cloudflareContext = await getCloudflareContext({ async: true })
    const cloudflareValue = (
      cloudflareContext.env as typeof cloudflareContext.env & {
        POSTHOG_BROWSER_API_HOST?: string
        POSTHOG_ENABLED?: string
        POSTHOG_PROJECT_KEY?: string
        POSTHOG_UI_HOST?: string
      }
    )[key]?.trim()

    return cloudflareValue || ''
  } catch {
    return ''
  }
}

/**
 * 返回浏览器可公开的 PostHog 配置。
 *
 * @returns PostHog 浏览器配置
 */
export async function GET() {
  const [enabledEnv, projectKey, apiHost, uiHost] = await Promise.all([
    readRuntimeEnv('POSTHOG_ENABLED'),
    readRuntimeEnv('POSTHOG_PROJECT_KEY'),
    readRuntimeEnv('POSTHOG_BROWSER_API_HOST'),
    readRuntimeEnv('POSTHOG_UI_HOST'),
  ])

  const config = buildPublicOfficialAnalyticsConfig({
    apiHost: apiHost || OFFICIAL_ANALYTICS_DEFAULT_API_HOST,
    enabledEnv,
    projectKey,
    uiHost: uiHost || OFFICIAL_ANALYTICS_DEFAULT_UI_HOST,
  })

  return NextResponse.json(config)
}
