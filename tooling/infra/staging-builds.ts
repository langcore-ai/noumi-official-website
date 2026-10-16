import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { testConfig } from './environment'
import { capture, ensureLocalInfraDir, localInfraDir, run } from './shared'

// No testEnv/testSecrets here: Builds must never generate or upload application secrets.
const config = testConfig('staging')
const action = process.argv[2]
const branch = process.env.WORKERS_CI_BRANCH || capture(['git', 'branch', '--show-current'])
if (branch !== 'staging') throw new Error('Cloudflare Builds 只允许 staging 分支')
const revision = process.env.WORKERS_CI_COMMIT_SHA || capture(['git', 'rev-parse', 'HEAD'])
if (!revision || !/^[a-f0-9]{40}$/.test(revision)) throw new Error('无法确定发布提交')
if (!['build', 'deploy', 'migrate'].includes(action))
  throw new Error('Specify build, deploy or migrate')
ensureLocalInfraDir()
const env = {
  ...process.env,
  ...config.vars,
  CLOUDFLARE_ACCOUNT_ID: config.account_id,
  CLOUDFLARE_ENV: 'staging',
  NEXT_DEV_WRANGLER_ENV: 'staging',
  OPEN_NEXT_LOCAL_BINDINGS: 'false',
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
  NEXT_PUBLIC_BUILD_REVISION: revision.slice(0, 7),
  OFFICIAL_WAITLIST_SYNC_TOKEN: '',
}
function step(args: string[]) {
  if (run(args, { env })) throw new Error(`步骤失败: ${args.join(' ')}`)
}
const stamp = join(localInfraDir, 'staging-builds.json')
if (action === 'build') {
  step(['bunx', 'tsc', '--noEmit'])
  step(['bun', 'run', 'test:int'])
  step(['bun', 'run', 'build:cloudflare', '--env', 'staging'])
  step(['bunx', 'wrangler', 'deploy', '--env', 'staging', '--dry-run'])
  writeFileSync(stamp, JSON.stringify({ revision, worker: config.name }))
} else if (action === 'migrate') {
  Object.assign(process.env, env, {
    NODE_ENV: 'production',
    // Only needed to instantiate Payload for schema migration, never used to authenticate,
    // create users or deploy. Existing runtime secrets remain on the Worker.
    PAYLOAD_SECRET: randomBytes(32).toString('hex'),
  })
  const { getPlatformProxy } = await import('wrangler')
  const { stagingD1 } = await import('./staging-d1')
  const proxy = await getPlatformProxy({ environment: 'staging', remoteBindings: false })
  const database = stagingD1()
  proxy.env.D1 = database
  ;(globalThis as Record<symbol, unknown>)[Symbol.for('__cloudflare-context__')] = proxy
  try {
    // Cloud deployment only supports the already bootstrapped testing site.
    const count = await database.prepare('SELECT COUNT(*) AS n FROM users').first<number>('n')
    if (!count) throw new Error('测试站尚未初始化管理员，请维护者先初始化')
    const { getPayload } = await import('payload')
    const { default: payloadConfig } = await import('../../src/payload.config')
    const payload = await getPayload({ config: payloadConfig })
    try {
      await payload.db.migrate()
    } finally {
      await payload.destroy()
    }
  } finally {
    await proxy.dispose()
  }
  process.exit(0)
} else {
  const built = JSON.parse(readFileSync(stamp, 'utf8')) as { revision: string; worker: string }
  if (built.revision !== revision || built.worker !== config.name)
    throw new Error('请先构建当前提交')
  // D1 retains recovery history remotely; print its pre-migration bookmark in build logs.
  step(['bunx', 'wrangler', 'd1', 'time-travel', 'info', 'D1', '--env', 'staging', '--json'])
  step(['bunx', 'tsx', 'tooling/infra/staging-builds.ts', 'migrate'])
  step(['bunx', 'opennextjs-cloudflare', 'deploy', '--env', 'staging'])
  const marker = join(localInfraDir, 'staging-builds-dirty.json')
  writeFileSync(
    marker,
    JSON.stringify({
      markedAt: new Date().toISOString(),
      reason: `build:${revision}`,
      source: 'workers-builds',
    }),
  )
  step([
    'bunx',
    'wrangler',
    'r2',
    'object',
    'put',
    `${config.r2_buckets[0].bucket_name}/${config.vars.OFFICIAL_SNAPSHOT_R2_PREFIX}/dirty.json`,
    '--file',
    marker,
    '--remote',
    '--env',
    'staging',
  ])
  const response = await fetch(`${config.vars.NEXT_PUBLIC_SITE_URL}/api/site/health`, {
    signal: AbortSignal.timeout(30000),
  })
  const health = (await response.json()) as {
    healthy?: boolean
    environment?: string
    revision?: string
  }
  if (
    !response.ok ||
    !health.healthy ||
    health.environment !== 'staging' ||
    health.revision !== revision.slice(0, 7)
  )
    throw new Error('部署健康或版本检查失败')
  console.log(`staging 已部署 ${revision}; 已标记快照刷新，下一次 Cron（每 5 分钟）将处理。`)
}
