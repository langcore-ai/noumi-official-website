import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'

/**
 * 是否正在通过 Payload CLI 执行命令。
 * 该判断用于避免 CLI 场景下误走远端运行时绑定。
 */
const isCLI = process.argv.some(
  (value) => value.endsWith('/payload/bin.js') || value.endsWith('\\payload\\bin.js'),
)

/**
 * 是否是 Next.js 生产构建阶段。
 * 构建期间不应尝试连接真实 Cloudflare 运行时。
 */
const isNextBuild =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build' ||
  process.argv.some(
    (value) =>
      (value.endsWith('/next/dist/bin/next') || value.endsWith('\\next\\dist\\bin\\next')) &&
      process.argv.includes('build'),
  )

/** 是否为生产环境 */
const isProduction = process.env.NODE_ENV === 'production'

// Adapted from OpenNext Cloudflare runtime context bootstrap.
/**
 * 从 Wrangler 侧获取 Cloudflare 上下文。
 * 开发环境默认关闭远端绑定，确保本地调试写入本地 D1。
 * @returns Cloudflare 运行时上下文
 */
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}

/**
 * 统一获取项目使用的 Cloudflare 上下文。
 * Payload 后台与临时 API 都应复用该方法，避免本地/远端 D1 绑定分叉。
 * @returns 可供当前运行时使用的 Cloudflare 上下文
 */
export async function getProjectCloudflareContext(): Promise<CloudflareContext> {
  // 构建阶段只需要占位绑定，避免 next build 期间触发真实连接。
  if (isNextBuild) {
    return {
      env: {
        D1: {} as CloudflareContext['env']['D1'],
        R2: {} as CloudflareContext['env']['R2'],
      },
    } as CloudflareContext
  }

  if (isCLI || !isProduction) {
    return getCloudflareContextFromWrangler()
  }

  return getCloudflareContext({ async: true })
}
