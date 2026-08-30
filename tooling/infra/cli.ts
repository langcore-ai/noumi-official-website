import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { capture, commandExists, getWranglerTargets, repositoryRoot, run } from './shared'
import { danger, label, muted, statusMark, success, title } from './tui'

function doctor(): number {
  const checks = [
    ['bun', commandExists('bun'), capture(['bun', '--version'])],
    ['node', commandExists('node'), capture(['node', '--version'])],
    ['git', commandExists('git'), capture(['git', '--version'])],
  ] as const

  console.log(title('Noumi Website Infra Doctor'))
  let failed = false
  for (const [name, ok, version] of checks) {
    console.log(
      `  ${statusMark(ok ? 'ok' : 'error')} ${label(name)}${version ? ` ${muted(version)}` : ''}`,
    )
    failed ||= !ok
  }

  for (const [pathLabel, path] of [
    ['.env', join(repositoryRoot, '.env')],
    ['node_modules', join(repositoryRoot, 'node_modules')],
  ] as const) {
    const ok = existsSync(path)
    console.log(`  ${statusMark(ok ? 'ok' : 'idle')} ${pathLabel}`)
  }

  try {
    const target = getWranglerTargets()
    console.log(
      `\n${label('Cloudflare 配置目标')} ${muted('（只读自 wrangler.jsonc，未连接远程）')}`,
    )
    console.log(`  ${label('Worker')}  ${target.workerName}`)
    console.log(`  ${label('D1')}      ${target.databaseName} ${muted(`(${target.databaseId})`)}`)
    console.log(`  ${label('R2')}      ${target.r2Bucket}`)
  } catch (error) {
    failed = true
    console.error(`  ${statusMark('error')} ${danger((error as Error).message)}`)
  }

  if (process.env.CLOUDFLARE_ENV) {
    failed = true
    console.error(danger(`  ● CLOUDFLARE_ENV=${process.env.CLOUDFLARE_ENV}；本仓库没有命名环境`))
  } else {
    console.log(`  ${statusMark('ok')} ${success('CLOUDFLARE_ENV 未设置（顶层环境）')}`)
  }

  return failed ? 1 : 0
}

function setup(): number {
  if (!existsSync(join(repositoryRoot, '.env'))) {
    copyFileSync(join(repositoryRoot, '.env.example'), join(repositoryRoot, '.env'))
    console.log('已从 .env.example 创建 .env；请填写本地 PAYLOAD_SECRET。')
  }
  if (!existsSync(join(repositoryRoot, 'node_modules'))) {
    return run(['bun', 'install', '--frozen-lockfile'])
  }
  console.log('依赖和 .env 已存在。')
  return 0
}

const action = process.argv[2] ?? 'doctor'
const code = action === 'doctor' ? doctor() : action === 'setup' ? setup() : 1
if (!['doctor', 'setup'].includes(action))
  console.error('用法: bun tooling/infra/cli.ts <doctor|setup>')
process.exit(code)
