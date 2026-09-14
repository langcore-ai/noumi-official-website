import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import prototypeRoutes from './src/lib/site/prototype/routes.json'

const nextConfig: NextConfig = {
  // 本地快速构建(build:quick)跳过类型检查以提速;不设 QUICK_BUILD 的生产/CI 构建保持完整检查。
  ...(process.env.QUICK_BUILD === 'true' ? { typescript: { ignoreBuildErrors: true } } : {}),
  // 重定向状态码由 middleware 控制为 301，避免 Next 内置 trailing slash 跳转返回 308。
  skipTrailingSlashRedirect: true,
  async redirects() {
    return Object.entries(prototypeRoutes).map(([file, destination]) => ({
      source: '/' + file,
      destination,
      permanent: true,
    }))
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: [
    'jose',
    'pg-cloudflare',
    // Payload 的 D1 适配器会间接触发 drizzle-kit/api；Next 16 打包后会导致 OpenNext 二次构建解析失败
    '@payloadcms/db-d1-sqlite',
  ],
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
