import { withPayload } from '@payloadcms/next/withPayload'

import {
  TEMPORARY_UI_BLOCKED_HTML_REWRITES,
  TEMPORARY_UI_STATIC_REWRITES,
} from './src/lib/site/temporary-ui'

/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Your Next.js config here
  async rewrites() {
    return {
      beforeFiles: [
        ...TEMPORARY_UI_STATIC_REWRITES,
        ...TEMPORARY_UI_BLOCKED_HTML_REWRITES,
      ],
    }
  },
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
