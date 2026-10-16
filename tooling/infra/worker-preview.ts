import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  acquireBuildLock,
  capture,
  ensureLocalInfraDir,
  localInfraDir,
  readPid,
  run,
} from './shared'
import { previewConfig } from './worker-preview-config'

async function main() {
  const action = process.argv[2]
  if (!['build', 'deploy', 'migrate'].includes(action))
    throw new Error('Specify build, deploy or migrate')
  const branch = process.env.WORKERS_CI_BRANCH || capture(['git', 'branch', '--show-current']) || ''
  const revision = process.env.WORKERS_CI_COMMIT_SHA || capture(['git', 'rev-parse', 'HEAD']) || ''
  const { config, identity } = previewConfig(branch, revision)
  ensureLocalInfraDir()
  const configFile = join(localInfraDir, 'worker-preview.json')
  const stampFile = join(localInfraDir, 'worker-preview-build.json')
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...config.vars,
    CLOUDFLARE_ACCOUNT_ID: config.account_id,
    CLOUDFLARE_ENV: undefined,
    NEXT_DEV_WRANGLER_ENV: 'staging',
    OPEN_NEXT_LOCAL_BINDINGS: 'false',
    CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
    OFFICIAL_WAITLIST_SYNC_TOKEN: '',
    OPEN_NEXT_DEPLOY: 'true',
  }
  const step = (args: string[]) => {
    if (run(args, { env })) throw new Error(`步骤失败: ${args.join(' ')}`)
  }
  if (action === 'migrate') {
    const { migratePreview } = await import('./preview-migrate')
    await migratePreview(branch, env)
    process.exit(0)
  }
  acquireBuildLock()
  if (readPid('local') || readPid('preview')) throw new Error('先执行 bun run mode:stop')
  writeFileSync(configFile, JSON.stringify(config, null, 2))
  if (action === 'build') {
    step(['bunx', 'tsc', '--noEmit'])
    step(['bun', 'run', 'test:int'])
    step(['bun', 'run', 'build:cloudflare', '--config', configFile])
    step(['bunx', 'wrangler', 'deploy', '--config', configFile, '--dry-run'])
    writeFileSync(stampFile, JSON.stringify({ revision, branch, name: identity.name, config }))
    return
  }
  const built = JSON.parse(readFileSync(stampFile, 'utf8'))
  if (
    built.revision !== revision ||
    built.branch !== branch ||
    JSON.stringify(built.config) !== JSON.stringify(config)
  )
    throw new Error('请先 build:worker-preview 构建当前版本和配置')
  step(['bunx', 'wrangler', 'd1', 'time-travel', 'info', 'D1', '--config', configFile, '--json'])
  step(['bunx', 'tsx', 'tooling/infra/worker-preview.ts', 'migrate'])
  step(['bunx', 'opennextjs-cloudflare', 'populateCache', 'remote', '--config', configFile])
  step([
    'bunx',
    'wrangler',
    'preview',
    '--config',
    configFile,
    '--name',
    identity.name,
    '--worker-name',
    config.name,
  ])
  const response = await fetch(`${identity.origin}/api/site/health`, {
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
    throw new Error('Preview 健康/版本检查失败，请检查域名和证书')
  console.log(`Preview ${identity.name}: ${identity.origin} (${revision.slice(0, 7)})`)
}
main().catch((error: Error) => {
  console.error(error.message)
  process.exitCode = 1
})
