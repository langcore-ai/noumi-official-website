import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Field } from 'payload'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext } from '@opennextjs/cloudflare'
import { r2Storage } from '@payloadcms/storage-r2'
import { en as enTranslations } from '@payloadcms/translations/languages/en'
import { zh as zhTranslations } from '@payloadcms/translations/languages/zh'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { BlogPosts } from './collections/BlogPosts'
import { FeaturePages } from './collections/FeaturePages'
import { UseCasePages } from './collections/UseCasePages'
import { FaqItems } from './collections/FaqItems'
import { AboutPage } from './globals/AboutPage'
import { HomePage } from './globals/HomePage'
import { PrivacyPage } from './globals/PrivacyPage'
import { PricingPage } from './globals/PricingPage'
import { SiteSettings } from './globals/SiteSettings'
import { TermsPage } from './globals/TermsPage'
import {
  buildLivePreviewURL,
  ENABLE_PAYLOAD_LIVE_PREVIEW,
  LIVE_PREVIEW_COLLECTIONS,
  LIVE_PREVIEW_GLOBALS,
} from './lib/site/publishing'
import { getProjectCloudflareContext } from './lib/cloudflare/context'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
/** 是否是 Next.js 生产构建阶段 */
const isNextBuild =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build' ||
  process.env.npm_lifecycle_event === 'preview' ||
  process.argv.some(
    (value) =>
      (value.endsWith('/opennextjs-cloudflare') || value.endsWith('\\opennextjs-cloudflare')) &&
      process.argv.includes('build'),
  ) ||
  (process.argv.some((value) => {
    const resolvedPath = fs.existsSync(value) ? fs.realpathSync(value) : undefined

    return resolvedPath?.endsWith(path.join('next', 'dist', 'bin', 'next'))
  }) &&
    process.argv.includes('build'))
/** 是否为生产环境 */
const isProduction = process.env.NODE_ENV === 'production'
/** redirects 插件可引用的内部集合 */
const redirectTargetCollections: string[] = [BlogPosts.slug, FeaturePages.slug, UseCasePages.slug]

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

/**
 * 判断错误是否来自 OpenNext Cloudflare 上下文初始化缺失。
 * 构建期若命中该错误，说明当前仅处于配置收集阶段，应回退到占位 binding。
 * @param error 捕获到的异常
 * @returns 是否为可安全降级的上下文初始化错误
 */
function isMissingOpenNextCloudflareContextError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)

  return (
    message.includes('initOpenNextCloudflareForDev') || message.includes('getCloudflareContextAsync')
  )
}

/**
 * 创建供 Payload 配置收集阶段使用的占位 Cloudflare 上下文。
 * 这里只为避免构建失败，真正运行时仍需使用真实 binding。
 * @returns 仅含占位 binding 的 Cloudflare 上下文
 */
function createPayloadConfigFallbackCloudflareContext(): CloudflareContext {
  return {
    env: {
      D1: {} as CloudflareContext['env']['D1'],
      R2: {} as CloudflareContext['env']['R2'],
    },
  } as CloudflareContext
}

/**
 * 安全获取 Payload 配置初始化所需的 Cloudflare 上下文。
 * 部署构建阶段若缺少 runtime context，则退回占位 binding，避免构建中断。
 * @returns 可用于本次 Payload 配置初始化的 Cloudflare 上下文
 */
async function getPayloadConfigCloudflareContext(): Promise<CloudflareContext> {
  try {
    return await getProjectCloudflareContext()
  } catch (error) {
    if (isNextBuild || isMissingOpenNextCloudflareContextError(error)) {
      return createPayloadConfigFallbackCloudflareContext()
    }

    throw error
  }
}

const cloudflare = await getPayloadConfigCloudflareContext()
const payloadSecret = getPayloadSecret(cloudflare)

/**
 * 为 redirects 插件生成兼容当前项目阶段的字段配置
 * @param defaultFields 插件默认提供的字段
 * @returns 适配当前站点的跳转字段列表
 */
function getRedirectFields(defaultFields: Field[]): Field[] {
  // 若后续再次缩减页面集合，这里仍保留兜底逻辑，避免 relationship 字段出现空 relationTo
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

/**
 * 解析 Payload 运行所需密钥
 * 构建阶段允许占位值通过静态收集；真正运行时仍要求提供真实密钥。
 * @param cloudflare Cloudflare 运行时上下文
 * @returns 可用于初始化 Payload 的密钥
 */
function getPayloadSecret(cloudflare: CloudflareContext): string {
  const cloudflarePayloadSecret = (
    cloudflare.env as CloudflareContext['env'] & { PAYLOAD_SECRET?: string }
  ).PAYLOAD_SECRET

  if (process.env.PAYLOAD_SECRET) {
    return process.env.PAYLOAD_SECRET
  }

  if (cloudflarePayloadSecret) {
    return cloudflarePayloadSecret
  }

  // Cloudflare 构建阶段尚未注入运行时 secret，此处使用占位值避免 next build 失败
  if (isNextBuild) {
    return 'noumi-build-secret'
  }

  if (!isProduction) {
    return 'noumi-local-dev-secret'
  }

  throw new Error('Missing PAYLOAD_SECRET in production environment.')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: ENABLE_PAYLOAD_LIVE_PREVIEW
      ? {
          collections: [...LIVE_PREVIEW_COLLECTIONS],
          globals: [...LIVE_PREVIEW_GLOBALS],
          url: ({ collectionConfig, data, globalConfig, locale }) =>
            buildLivePreviewURL({
              collectionSlug: collectionConfig?.slug,
              data,
              globalSlug: globalConfig?.slug,
              locale,
            }),
        }
      : undefined,
  },
  collections: [Users, Media, BlogPosts, FeaturePages, UseCasePages, FaqItems],
  globals: [SiteSettings, HomePage, AboutPage, PricingPage, PrivacyPage, TermsPage],
  editor: lexicalEditor(),
  i18n: {
    fallbackLanguage: 'zh',
    supportedLanguages: {
      en: enTranslations,
      zh: zhTranslations,
    },
  },
  localization: {
    defaultLocale: 'en',
    fallback: true,
    locales: [
      {
        code: 'en',
        label: {
          en: 'English',
          zh: '英文',
        },
      },
      {
        code: 'zh',
        fallbackLocale: 'en',
        label: {
          en: 'Chinese',
          zh: '中文',
        },
      },
    ],
  },
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    // 本项目以 migration 为准，避免 dev 模式再次自动推送 schema 与正式迁移互相冲突。
    push: false,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    seoPlugin({
      globals: [SiteSettings.slug],
      collections: [BlogPosts.slug, FeaturePages.slug, UseCasePages.slug],
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
