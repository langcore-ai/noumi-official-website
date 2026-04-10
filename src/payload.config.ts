import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Field } from 'payload'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

/** 是否正在通过 Payload CLI 执行命令 */
const isCLI = process.argv.some((value) => realpath(value).endsWith(path.join('payload', 'bin.js')))
/** 是否是 Next.js 生产构建阶段 */
const isNextBuild =
  process.argv.some((value) => realpath(value)?.endsWith(path.join('next', 'dist', 'bin', 'next'))) &&
  process.argv.includes('build')
/** 是否为生产环境 */
const isProduction = process.env.NODE_ENV === 'production'
/** redirects 插件可引用的内部集合；当前站点尚未接入页面内容集合 */
const redirectTargetCollections: string[] = []
/** Payload 密钥；开发环境提供稳定兜底值，避免本地启动因缺少环境变量而失败 */
const payloadSecret =
  process.env.PAYLOAD_SECRET || (isProduction ? (() => {
    throw new Error('Missing PAYLOAD_SECRET in production environment.')
  })() : 'noumi-local-dev-secret')

/**
 * 创建结构化日志方法
 * @param level 日志等级
 * @param fn 底层输出函数
 * @returns Payload 兼容的日志输出函数
 */
const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare = await getCloudflareContextForPayload()

/**
 * 为 redirects 插件生成兼容当前项目阶段的字段配置
 * @param defaultFields 插件默认提供的字段
 * @returns 适配当前站点的跳转字段列表
 */
function getRedirectFields(defaultFields: Field[]): Field[] {
  // 尚无页面类集合时，只保留自定义 URL 跳转，避免 relationship 字段出现空 relationTo
  if (redirectTargetCollections.length > 0) {
    return defaultFields
  }

  return defaultFields.map((field) => {
    if (field.type !== 'group' || !('name' in field) || field.name !== 'to') {
      return field
    }

    return {
      ...field,
      fields: [
        {
          name: 'type',
          type: 'radio',
          label: 'To URL Type',
          defaultValue: 'custom',
          options: [{ label: 'Custom URL', value: 'custom' }],
          required: true,
          admin: {
            layout: 'horizontal',
            readOnly: true,
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Custom URL',
          required: true,
        },
      ],
    }
  })
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    seoPlugin({
      globals: [SiteSettings.slug],
      uploadsCollection: Media.slug,
      tabbedUI: true,
      generateTitle: ({ doc }) => {
        const siteName = typeof doc?.siteName === 'string' ? doc.siteName.trim() : ''
        return siteName ? `${siteName} | Noumi` : 'Noumi'
      },
      generateDescription: ({ doc }) =>
        typeof doc?.defaultDescription === 'string' ? doc.defaultDescription : '',
      generateURL: ({ doc }) => (typeof doc?.siteUrl === 'string' ? doc.siteUrl : ''),
    }),
    redirectsPlugin({
      // 当前仓库还没有页面内容集合，先降级为仅支持自定义 URL 的跳转管理
      collections: redirectTargetCollections,
      overrides: {
        fields: ({ defaultFields }) => getRedirectFields(defaultFields),
      },
      redirectTypes: ['301', '302'],
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
/**
 * 从 Wrangler 侧获取 Cloudflare 上下文
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
 * 为 Payload 选择合适的 Cloudflare 上下文来源
 * @returns 可供 Payload 使用的 Cloudflare 上下文
 */
async function getCloudflareContextForPayload(): Promise<CloudflareContext> {
  // Next.js 构建阶段只需要能成功创建 Payload 配置；此时不应启动 Wrangler 远程代理
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
