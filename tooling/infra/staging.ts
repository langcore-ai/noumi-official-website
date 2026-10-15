import { join } from 'node:path'
import { acquireBuildLock, capture, localInfraDir, readPid, run, writeJson } from './shared'
import { testConfig, testEnv, testSecrets } from './environment'

const config = testConfig('staging')
const origin = config.vars.NEXT_PUBLIC_SITE_URL
let env = process.env
const action = process.argv[2] || 'status'
function step(args: string[], overrides: Partial<NodeJS.ProcessEnv> = {}) {
  const code = run(args, { env: { ...env, ...overrides } })
  if (code) throw new Error(`步骤失败 (${code}): ${args.join(' ')}`)
}

async function verify(expectedRevision?: string) {
  const health = await fetch(`${origin}/api/site/health`, { signal: AbortSignal.timeout(30_000) })
  const data = (await health.json()) as {
    healthy?: boolean
    environment?: string
    revision?: string
  }
  if (!health.ok || !data.healthy || data.environment !== 'staging')
    throw new Error('staging 健康检查失败')
  if (expectedRevision && data.revision !== expectedRevision)
    throw new Error('staging 运行版本与本次构建不匹配')
  for (const path of ['/', '/admin', '/robots.txt']) {
    const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30_000) })
    if (!response.ok || !response.headers.get('x-robots-tag')?.includes('noindex'))
      throw new Error(`staging 验证失败: ${path} HTTP ${response.status}`)
    if (path === '/robots.txt' && !(await response.text()).includes('Disallow: /'))
      throw new Error('测试站 robots 配置错误')
  }
  console.log(`✓ staging 健康，D1/R2 可访问，禁止收录：${origin}`)
}

async function main() {
  console.log(
    `Noumi · STAGING\nWorker: ${config.name}\nD1: ${config.d1_databases[0].database_name}\nR2: ${config.r2_buckets[0].bucket_name}\n地址: ${origin}`,
  )
  if (action === 'status' || action === 'health') return verify()
  if (action === 'logs') return step(['bunx', 'wrangler', 'tail', '--env', 'staging'])
  if (action !== 'deploy')
    throw new Error('用法: bun run mode:staging <deploy|status|health|logs> [--dry-run]')
  const dryRun = process.argv.includes('--dry-run')
  acquireBuildLock()
  env = testEnv('staging')
  const revision = capture(['git', 'rev-parse', 'HEAD']) || 'unknown'
  if (readPid('local') || readPid('preview'))
    throw new Error('请先 bun run mode:stop，再构建 staging，避免覆盖本地运行产物。')
  step(['bunx', 'tsc', '--noEmit'])
  step(['bun', 'run', 'test:int'])
  step(['bun', 'run', 'build:cloudflare', '--env', 'staging'], {
    NEXT_PUBLIC_BUILD_REVISION: revision.slice(0, 7),
  })
  step(['bunx', 'wrangler', 'deploy', '--env', 'staging', '--dry-run'])
  if (dryRun) return
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  step([
    'bunx',
    'wrangler',
    'd1',
    'export',
    'D1',
    '--env',
    'staging',
    '--remote',
    '--output',
    join(localInfraDir, `staging-before-${stamp}.sql`),
  ])
  step(['bunx', 'tsx', 'tooling/infra/seed.ts', 'staging'])
  // Upload only this environment's independently generated secrets, never .env.
  step([
    'bunx',
    'wrangler',
    'secret',
    'bulk',
    join(localInfraDir, 'staging.secrets.json'),
    '--env',
    'staging',
  ])
  step(['bunx', 'opennextjs-cloudflare', 'deploy', '--env', 'staging'])
  const response = await fetch(
    `${origin}/api/site/snapshots/refresh?mode=force&reason=staging-release`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testSecrets('staging').OFFICIAL_SNAPSHOT_REFRESH_TOKEN}`,
      },
      signal: AbortSignal.timeout(120_000),
    },
  )
  if (!response.ok) throw new Error(`测试快照刷新失败: HTTP ${response.status}`)
  await verify(revision.slice(0, 7))
  writeJson(join(localInfraDir, 'staging-release.json'), {
    deployedAt: new Date().toISOString(),
    origin,
    revision,
  })
}

main().catch((error: Error) => {
  console.error(error.message)
  process.exitCode = 1
})
