import { resolveOfficialShortLink } from '@/lib/site/short-links'

/** 短链按请求解析 slug，不能在构建期静态化。 */
export const dynamic = 'force-dynamic'

/** 短链只做跳转，不允许搜索引擎索引。 */
const NO_INDEX_HEADERS = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex',
} as const

/**
 * 营销短链跳转：`/go/<slug>` → 302 到带完整 UTM 的落地页。
 *
 * 短链用于私信与邮件（飞书 UTM 规则表），完整链接太长不适合直接发送；
 * 跳转落地后由页面层现有 UTM/首触链路采集，PostHog 只看到带 UTM 的正常落地。
 *
 * @param request 当前请求
 * @param context 路由参数（slug）
 * @returns 302 重定向或 404
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await context.params
  const target = resolveOfficialShortLink(slug)

  if (!target) {
    return new Response('Not Found', { status: 404, headers: NO_INDEX_HEADERS })
  }

  return new Response(null, {
    status: 302,
    headers: { ...NO_INDEX_HEADERS, location: target },
  })
}
