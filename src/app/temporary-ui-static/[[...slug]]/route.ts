import { NextResponse } from 'next/server'

/** route handler 依赖运行时请求链路，避免构建期静态化 */
export const dynamic = 'force-dynamic'

/** 内部别名到静态资产路径的映射 */
const TEMPORARY_UI_ALIAS_TO_ASSET_PATH: Record<string, string> = {
  __about: '/temporaryUI/company/about.html',
  __blog: '/temporaryUI/resources/blog.html',
  __contact: '/temporaryUI/company/contact.html',
  __faqs: '/temporaryUI/resources/faq.html',
  __home: '/temporaryUI/index.html',
  __invite: '/temporaryUI/invite.html',
  __pricing: '/temporaryUI/company/pricing.html',
  __privacy: '/temporaryUI/legal/privacy.html',
  __terms: '/temporaryUI/legal/terms.html',
  '__use-case-journalist': '/temporaryUI/use-cases/journalist.html',
  '__use-case-product-manager': '/temporaryUI/use-cases/product-manager.html',
  '__use-case-solutions-engineer': '/temporaryUI/use-cases/solutions-engineer.html',
}

/**
 * 根据别名获取需要代理的临时 UI 静态资源地址。
 * @param slug 动态路由参数
 * @returns 静态资源路径；未知别名返回 null
 */
function getTemporaryUiAssetPath(slug: string[] | undefined): null | string {
  const joinedSlug = slug?.length ? slug.join('/') : '__home'

  return TEMPORARY_UI_ALIAS_TO_ASSET_PATH[joinedSlug] ?? null
}

/**
 * 输出临时 UI 页面。
 * 这里通过同源 fetch 访问真正的静态资产，兼容 dev 与 OpenNext preview。
 * @param request 当前请求
 * @param context 动态路由上下文
 * @returns HTML 响应
 */
export async function GET(request: Request, context: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await context.params
  const assetPath = getTemporaryUiAssetPath(slug)

  if (!assetPath) {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  }

  const assetUrl = new URL(assetPath, request.url)
  const response = await fetch(assetUrl, {
    headers: {
      'x-tempui-internal': '1',
    },
  })

  if (!response.ok) {
    return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  }

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'text/html; charset=utf-8',
    },
    status: response.status,
  })
}
