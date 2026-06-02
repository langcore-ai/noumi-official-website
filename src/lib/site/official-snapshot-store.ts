import { getCloudflareContext, type CloudflareContext } from '@opennextjs/cloudflare'

/** 快照存储 schema 版本。 */
const OFFICIAL_SNAPSHOT_VERSION = 1
/** R2 中官网快照的默认目录前缀。 */
const DEFAULT_OFFICIAL_SNAPSHOT_R2_PREFIX = 'official-site-snapshots'
/** 自动刷新快照的默认间隔。 */
const DEFAULT_OFFICIAL_SNAPSHOT_REFRESH_SECONDS = 60 * 60
/** 快照刷新锁默认 5 分钟过期，避免异常任务永久阻塞刷新。 */
const DEFAULT_OFFICIAL_SNAPSHOT_LOCK_SECONDS = 5 * 60

/** 官网快照运行时环境。 */
type OfficialSnapshotEnv = CloudflareContext['env'] & {
  /** 定时/发布后刷新快照的站点 origin。 */
  OFFICIAL_SNAPSHOT_REFRESH_ORIGIN?: string
  /** 官网快照刷新间隔，单位秒；0 表示关闭自动 stale refresh。 */
  OFFICIAL_SNAPSHOT_REFRESH_SECONDS?: string
  /** 手动/定时刷新快照的独立 token。 */
  OFFICIAL_SNAPSHOT_REFRESH_TOKEN?: string
  /** 官网快照 R2 key 前缀。 */
  OFFICIAL_SNAPSHOT_R2_PREFIX?: string
  /** Payload 主密钥，未配置独立 token 时作为刷新 token 兜底。 */
  PAYLOAD_SECRET?: string
}

/** R2 快照运行时。 */
type OfficialSnapshotRuntime = {
  /** Cloudflare 运行时上下文 */
  cloudflare: CloudflareContext
  /** 快照所在 R2 bucket */
  bucket: R2Bucket
  /** R2 key 前缀 */
  prefix: string
}

/** R2 JSON 快照包裹结构。 */
type OfficialSnapshotEnvelope<T> = {
  /** 业务数据 */
  data: T
  /** 生成时间 */
  generatedAt: string
  /** 业务快照 key */
  key: string
  /** schema 版本 */
  version: typeof OFFICIAL_SNAPSHOT_VERSION
}

/** 快照脏标记。 */
export type OfficialSnapshotDirtyMarker = {
  /** 标记时间 */
  markedAt: string
  /** 标记原因 */
  reason: string
  /** 来源模块 */
  source?: string
}

/** 全站快照 manifest。 */
export type OfficialSnapshotManifest = {
  /** 各类内容数量。 */
  counts: {
    /** Blog 详情数量 */
    blogPosts: number
    /** Feature 详情数量 */
    featurePages: number
    /** Use Case 详情数量 */
    useCasePages: number
  }
  /** 快照生成耗时 */
  durationMs: number
  /** 生成时间 */
  generatedAt: string
  /** 本次生成写入的业务快照 key */
  keys: string[]
  /** 本次生成覆盖的公开路径 */
  routes: string[]
  /** 生成原因 */
  reason: string
  /** schema 版本 */
  version: typeof OFFICIAL_SNAPSHOT_VERSION
}

/** 快照刷新设置。 */
export type OfficialSnapshotSettings = {
  /** 自动刷新间隔，单位秒；0 表示只允许发布后/手动刷新。 */
  refreshSeconds: number
  /** 更新时间 */
  updatedAt: string
}

/** 快照刷新状态。 */
export type OfficialSnapshotRefreshState = {
  /** 当前 dirty marker */
  dirty: null | OfficialSnapshotDirtyMarker
  /** 当前 manifest */
  manifest: OfficialSnapshotManifest | null
  /** 刷新原因 */
  reason: string | null
  /** 当前生效的自动刷新间隔。 */
  refreshSeconds: number
  /** 是否应该刷新 */
  shouldRefresh: boolean
}

/**
 * 解析正整数环境变量。
 * @param value 原始环境变量
 * @param fallback 默认值
 * @returns 正整数值
 */
function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const numberValue = value ? Number.parseInt(value, 10) : fallback

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback
}

/**
 * 规范化 R2 key 前缀。
 * @param value 原始前缀
 * @returns 不带首尾斜杠的前缀
 */
function normalizeSnapshotPrefix(value: string | undefined): string {
  const prefix = value?.trim() || DEFAULT_OFFICIAL_SNAPSHOT_R2_PREFIX

  return prefix.replace(/^\/+|\/+$/g, '') || DEFAULT_OFFICIAL_SNAPSHOT_R2_PREFIX
}

/**
 * 读取 Cloudflare R2 快照运行时。
 * @returns 快照运行时；不可用时返回 null
 */
async function getOfficialSnapshotRuntime(): Promise<OfficialSnapshotRuntime | null> {
  try {
    const cloudflare = await getCloudflareContext({ async: true })
    const env = cloudflare.env as OfficialSnapshotEnv
    const bucket = env.R2

    if (!bucket) {
      return null
    }

    return {
      bucket,
      cloudflare,
      prefix: normalizeSnapshotPrefix(
        env.OFFICIAL_SNAPSHOT_R2_PREFIX ?? process.env.OFFICIAL_SNAPSHOT_R2_PREFIX,
      ),
    }
  } catch {
    return null
  }
}

/**
 * 判断 Cloudflare R2 快照运行时是否可用。
 * @returns 是否可访问 R2
 */
export async function isOfficialSnapshotRuntimeAvailable(): Promise<boolean> {
  return Boolean(await getOfficialSnapshotRuntime())
}

/**
 * 生成业务快照 key。
 * @param parts key 片段
 * @returns 业务快照 key
 */
export function createOfficialSnapshotKey(...parts: Array<number | string | boolean>): string {
  return parts.map((part) => encodeURIComponent(String(part))).join('/')
}

/**
 * 转换为 R2 对象 key。
 * @param runtime 快照运行时
 * @param key 业务 key
 * @returns R2 对象 key
 */
function toDataObjectKey(runtime: OfficialSnapshotRuntime, key: string): string {
  return `${runtime.prefix}/data/${key}.json`
}

/**
 * 读取管理对象 key。
 * @param runtime 快照运行时
 * @param name 管理对象名
 * @returns R2 对象 key
 */
function toMetaObjectKey(runtime: OfficialSnapshotRuntime, name: string): string {
  return `${runtime.prefix}/${name}.json`
}

/**
 * 读取 JSON 对象。
 * @param bucket R2 bucket
 * @param objectKey R2 对象 key
 * @returns JSON 对象；不存在或解析失败时返回 null
 */
async function readJsonObject<T>(bucket: R2Bucket, objectKey: string): Promise<T | null> {
  const object = await bucket.get(objectKey)

  if (!object) {
    return null
  }

  try {
    return (await object.json()) as T
  } catch {
    return null
  }
}

/**
 * 写入 JSON 对象。
 * @param bucket R2 bucket
 * @param objectKey R2 对象 key
 * @param data JSON 数据
 */
async function writeJsonObject<T>(bucket: R2Bucket, objectKey: string, data: T): Promise<void> {
  await bucket.put(objectKey, JSON.stringify(data), {
    httpMetadata: {
      contentType: 'application/json; charset=utf-8',
    },
  })
}

/**
 * 读取业务快照。
 * @param key 业务快照 key
 * @returns 快照数据；不存在时返回 null
 */
export async function readOfficialSnapshot<T>(key: string): Promise<T | null> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return null
  }

  const envelope = await readJsonObject<OfficialSnapshotEnvelope<T>>(
    runtime.bucket,
    toDataObjectKey(runtime, key),
  )

  if (!envelope || envelope.version !== OFFICIAL_SNAPSHOT_VERSION || envelope.key !== key) {
    return null
  }

  return envelope.data
}

/**
 * 写入业务快照到指定运行时。
 * @param runtime 快照运行时
 * @param key 业务快照 key
 * @param data 快照数据
 * @param generatedAt 生成时间
 */
async function writeOfficialSnapshotToRuntime<T>(
  runtime: OfficialSnapshotRuntime,
  key: string,
  data: T,
  generatedAt = new Date().toISOString(),
): Promise<void> {
  await writeJsonObject<OfficialSnapshotEnvelope<T>>(
    runtime.bucket,
    toDataObjectKey(runtime, key),
    {
      data,
      generatedAt,
      key,
      version: OFFICIAL_SNAPSHOT_VERSION,
    },
  )
}

/**
 * 写入业务快照。
 * @param key 业务快照 key
 * @param data 快照数据
 * @param generatedAt 生成时间
 */
export async function writeOfficialSnapshot<T>(
  key: string,
  data: T,
  generatedAt = new Date().toISOString(),
): Promise<void> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    throw new Error('Official snapshot R2 runtime is unavailable.')
  }

  await writeOfficialSnapshotToRuntime(runtime, key, data, generatedAt)
}

/**
 * 尝试写入业务快照；本地开发或构建期没有 R2 runtime 时静默跳过。
 * @param key 业务快照 key
 * @param data 快照数据
 * @param generatedAt 生成时间
 * @returns 是否实际写入
 */
export async function tryWriteOfficialSnapshot<T>(
  key: string,
  data: T,
  generatedAt = new Date().toISOString(),
): Promise<boolean> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return false
  }

  await writeOfficialSnapshotToRuntime(runtime, key, data, generatedAt)
  return true
}

/**
 * 删除业务快照。
 * @param key 业务快照 key
 */
export async function deleteOfficialSnapshot(key: string): Promise<void> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return
  }

  await runtime.bucket.delete(toDataObjectKey(runtime, key))
}

/**
 * 读取全站快照 manifest。
 * @returns manifest；不存在时返回 null
 */
export async function readOfficialSnapshotManifest(): Promise<OfficialSnapshotManifest | null> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return null
  }

  const manifest = await readJsonObject<OfficialSnapshotManifest>(
    runtime.bucket,
    toMetaObjectKey(runtime, 'manifest'),
  )

  return manifest?.version === OFFICIAL_SNAPSHOT_VERSION ? manifest : null
}

/**
 * 写入全站快照 manifest。
 * @param manifest manifest 数据
 */
export async function writeOfficialSnapshotManifest(
  manifest: OfficialSnapshotManifest,
): Promise<void> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    throw new Error('Official snapshot R2 runtime is unavailable.')
  }

  await writeJsonObject(runtime.bucket, toMetaObjectKey(runtime, 'manifest'), manifest)
}

/**
 * 读取快照刷新设置。
 * @returns 刷新设置；未配置时返回 null
 */
export async function readOfficialSnapshotSettings(): Promise<OfficialSnapshotSettings | null> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return null
  }

  const settings = await readJsonObject<OfficialSnapshotSettings>(
    runtime.bucket,
    toMetaObjectKey(runtime, 'settings'),
  )

  if (!settings || !Number.isFinite(settings.refreshSeconds) || settings.refreshSeconds < 0) {
    return null
  }

  return settings
}

/**
 * 写入快照刷新设置。
 * @param input 设置输入
 * @returns 保存后的设置
 */
export async function writeOfficialSnapshotSettings(input: {
  refreshSeconds: number
}): Promise<OfficialSnapshotSettings> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    throw new Error('Official snapshot R2 runtime is unavailable.')
  }

  const settings: OfficialSnapshotSettings = {
    refreshSeconds: input.refreshSeconds,
    updatedAt: new Date().toISOString(),
  }

  await writeJsonObject(runtime.bucket, toMetaObjectKey(runtime, 'settings'), settings)

  return settings
}

/**
 * 标记官网快照已过期。
 * @param input 标记信息
 */
export async function markOfficialSnapshotDirty(input: {
  reason: string
  source?: string
}): Promise<void> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return
  }

  await writeJsonObject<OfficialSnapshotDirtyMarker>(
    runtime.bucket,
    toMetaObjectKey(runtime, 'dirty'),
    {
      markedAt: new Date().toISOString(),
      reason: input.reason,
      source: input.source,
    },
  )
}

/**
 * 读取快照刷新 token。
 * @param env Cloudflare 环境变量
 * @returns token；未配置时返回空串
 */
function getOfficialSnapshotRefreshToken(env?: OfficialSnapshotEnv): string {
  return (
    env?.OFFICIAL_SNAPSHOT_REFRESH_TOKEN?.trim() ||
    env?.PAYLOAD_SECRET?.trim() ||
    process.env.OFFICIAL_SNAPSHOT_REFRESH_TOKEN?.trim() ||
    process.env.PAYLOAD_SECRET?.trim() ||
    ''
  )
}

/**
 * 读取刷新 API 的站点 origin。
 * @param env Cloudflare 环境变量
 * @returns 可请求的站点 origin
 */
function getOfficialSnapshotRefreshOrigin(env?: OfficialSnapshotEnv): string {
  const rawOrigin =
    env?.OFFICIAL_SNAPSHOT_REFRESH_ORIGIN?.trim() ||
    process.env.OFFICIAL_SNAPSHOT_REFRESH_ORIGIN?.trim() ||
    'https://noumi.ai'

  try {
    return new URL(rawOrigin).origin
  } catch {
    return 'https://noumi.ai'
  }
}

/**
 * 后台请求快照刷新 API。
 * @param reason 刷新原因
 */
export async function requestOfficialSnapshotRefresh(reason: string): Promise<void> {
  let env: OfficialSnapshotEnv | undefined

  try {
    const cloudflare = await getCloudflareContext({ async: true })
    env = cloudflare.env as OfficialSnapshotEnv
  } catch {
    env = undefined
  }

  const token = getOfficialSnapshotRefreshToken(env)

  if (!token) {
    return
  }

  const url = new URL('/api/site/snapshots/refresh', getOfficialSnapshotRefreshOrigin(env))
  url.searchParams.set('reason', reason)

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
  })

  if (!response.ok && response.status !== 409) {
    console.error('[official-snapshot] failed to request snapshot refresh', {
      reason,
      status: response.status,
      text: await response.text(),
    })
  }
}

/**
 * 清除官网快照脏标记。
 */
export async function clearOfficialSnapshotDirty(): Promise<void> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return
  }

  await runtime.bucket.delete(toMetaObjectKey(runtime, 'dirty'))
}

/**
 * 读取官网快照脏标记。
 * @returns dirty marker；不存在时返回 null
 */
export async function readOfficialSnapshotDirty(): Promise<OfficialSnapshotDirtyMarker | null> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return null
  }

  return readJsonObject<OfficialSnapshotDirtyMarker>(
    runtime.bucket,
    toMetaObjectKey(runtime, 'dirty'),
  )
}

/**
 * 获取自动刷新间隔。
 * @returns 自动刷新间隔秒数；0 表示关闭
 */
async function getOfficialSnapshotRefreshSeconds(): Promise<number> {
  const settings = await readOfficialSnapshotSettings()

  if (settings) {
    return settings.refreshSeconds
  }

  try {
    const cloudflare = await getCloudflareContext({ async: true })
    const env = cloudflare.env as OfficialSnapshotEnv

    return parsePositiveInteger(
      env.OFFICIAL_SNAPSHOT_REFRESH_SECONDS ?? process.env.OFFICIAL_SNAPSHOT_REFRESH_SECONDS,
      DEFAULT_OFFICIAL_SNAPSHOT_REFRESH_SECONDS,
    )
  } catch {
    return parsePositiveInteger(
      process.env.OFFICIAL_SNAPSHOT_REFRESH_SECONDS,
      DEFAULT_OFFICIAL_SNAPSHOT_REFRESH_SECONDS,
    )
  }
}

/**
 * 判断快照是否需要刷新。
 * @returns 快照刷新状态
 */
export async function getOfficialSnapshotRefreshState(): Promise<OfficialSnapshotRefreshState> {
  const [manifest, dirty, refreshSeconds] = await Promise.all([
    readOfficialSnapshotManifest(),
    readOfficialSnapshotDirty(),
    getOfficialSnapshotRefreshSeconds(),
  ])

  if (dirty) {
    return {
      dirty,
      manifest,
      reason: `dirty:${dirty.reason}`,
      refreshSeconds,
      shouldRefresh: true,
    }
  }

  if (!manifest) {
    return {
      dirty,
      manifest,
      reason: 'missing-manifest',
      refreshSeconds,
      shouldRefresh: true,
    }
  }

  if (refreshSeconds === 0) {
    return {
      dirty,
      manifest,
      reason: null,
      refreshSeconds,
      shouldRefresh: false,
    }
  }

  const generatedAt = Date.parse(manifest.generatedAt)
  const isStale = !Number.isFinite(generatedAt) || Date.now() - generatedAt > refreshSeconds * 1000

  return {
    dirty,
    manifest,
    reason: isStale ? 'stale-manifest' : null,
    refreshSeconds,
    shouldRefresh: isStale,
  }
}

/**
 * 尝试获取快照刷新锁。
 * @param reason 刷新原因
 * @returns 是否成功获取锁
 */
export async function acquireOfficialSnapshotRefreshLock(reason: string): Promise<boolean> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return false
  }

  const lockKey = toMetaObjectKey(runtime, 'refresh-lock')
  const now = Date.now()
  const currentLock = await readJsonObject<{ expiresAt: number }>(runtime.bucket, lockKey)

  if (currentLock?.expiresAt && currentLock.expiresAt > now) {
    return false
  }

  await writeJsonObject(runtime.bucket, lockKey, {
    expiresAt: now + DEFAULT_OFFICIAL_SNAPSHOT_LOCK_SECONDS * 1000,
    lockedAt: new Date(now).toISOString(),
    reason,
  })

  return true
}

/**
 * 释放快照刷新锁。
 */
export async function releaseOfficialSnapshotRefreshLock(): Promise<void> {
  const runtime = await getOfficialSnapshotRuntime()

  if (!runtime) {
    return
  }

  await runtime.bucket.delete(toMetaObjectKey(runtime, 'refresh-lock'))
}

/**
 * 使用 Cloudflare waitUntil 在后台执行快照任务。
 * @param task 后台任务
 */
export async function runOfficialSnapshotTaskInBackground(task: Promise<unknown>): Promise<void> {
  try {
    const cloudflare = await getCloudflareContext({ async: true })
    cloudflare.ctx.waitUntil(task)
  } catch {
    task.catch((error) => {
      console.error('[official-snapshot] background task failed', error)
    })
  }
}
