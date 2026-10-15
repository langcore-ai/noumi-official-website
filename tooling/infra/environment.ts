import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseConfigFileTextToJson } from 'typescript'
import { ensureLocalInfraDir, localInfraDir, repositoryRoot } from './shared'

export type TestEnvironment = 'local' | 'staging'
type EnvironmentConfig = {
  name: string
  vars: Record<string, string>
  d1_databases: { binding: string; database_id: string; database_name: string; remote?: boolean }[]
  r2_buckets: { binding: string; bucket_name: string }[]
  routes?: { pattern: string; custom_domain?: boolean }[]
}

export function testConfig(target: TestEnvironment): EnvironmentConfig {
  const parsed = parseConfigFileTextToJson(
    'wrangler.jsonc',
    readFileSync(join(repositoryRoot, 'wrangler.jsonc'), 'utf8'),
  )
  if (parsed.error) throw new Error('无法解析 wrangler.jsonc')
  const root = parsed.config as EnvironmentConfig & {
    env: Record<TestEnvironment, EnvironmentConfig>
  }
  const config = root.env[target]
  if (!config || config.name !== `noumi-official-website-${target}`)
    throw new Error('测试 Worker 目标不匹配')
  const db = config.d1_databases
  if (
    db.length !== 1 ||
    db[0].binding !== 'D1' ||
    db[0].database_name !== config.name ||
    db[0].database_id === root.d1_databases[0].database_id
  )
    throw new Error('测试数据库必须独立于生产')
  if (
    config.r2_buckets.length !== 2 ||
    config.r2_buckets.some(
      (bucket) =>
        bucket.bucket_name !== `official-website-${target}-bucket` ||
        root.r2_buckets.some((prod) => prod.bucket_name === bucket.bucket_name),
    )
  )
    throw new Error('测试 R2 必须独立于生产')
  if (
    config.vars.APP_ENV !== target ||
    config.vars.POSTHOG_ENABLED !== 'false' ||
    config.vars.NOUMI_PRODUCT_API_URL !== ''
  )
    throw new Error('测试环境配置不安全')
  if (
    target === 'staging' &&
    (config.routes?.length !== 1 ||
      config.routes[0].pattern !== 'staging.noumi.ai' ||
      !config.routes[0].custom_domain ||
      config.vars.OFFICIAL_SNAPSHOT_REFRESH_ORIGIN !== 'https://staging.noumi.ai')
  )
    throw new Error('staging 域名不匹配')
  return config
}

export function testSecrets(target: TestEnvironment): Record<string, string> {
  ensureLocalInfraDir()
  const file = join(localInfraDir, `${target}.secrets.json`)
  if (!existsSync(file)) {
    const secrets = Object.fromEntries(
      ['PAYLOAD_SECRET', 'PAYLOAD_PREVIEW_SECRET', 'OFFICIAL_SNAPSHOT_REFRESH_TOKEN'].map((key) => [
        key,
        randomBytes(32).toString('hex'),
      ]),
    )
    writeFileSync(file, JSON.stringify(secrets, null, 2), { mode: 0o600 })
  }
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, string>
}

/** Explicit values take precedence over the existing production-oriented .env. */
export function testEnv(target: TestEnvironment, port = 3000): NodeJS.ProcessEnv {
  const config = testConfig(target)
  const origin = target === 'local' ? `http://localhost:${port}` : 'https://staging.noumi.ai'
  return {
    ...process.env,
    ...config.vars,
    ...testSecrets(target),
    CLOUDFLARE_ENV: target,
    OPEN_NEXT_LOCAL_BINDINGS: target === 'local' ? 'true' : 'false',
    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
    NEXT_PUBLIC_SITE_URL: origin,
    OFFICIAL_SNAPSHOT_REFRESH_ORIGIN: origin,
    OFFICIAL_WAITLIST_SYNC_TOKEN: '',
    WRANGLER_LOG_PATH: join(localInfraDir, 'wrangler-logs'),
  }
}
