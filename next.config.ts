import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 重定向状态码由 middleware 控制为 301，避免 Next 内置 trailing slash 跳转返回 308。
  skipTrailingSlashRedirect: true,
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
