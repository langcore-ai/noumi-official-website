import { existsSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import * as clack from '@clack/prompts'

import { capture, getWranglerTargets, probe, repositoryRoot, run, writeJson } from '../infra/shared'
import { command, danger, label, muted, success, warning } from '../infra/tui'

type ReleaseKind = 'app' | 'database-and-app' | 'verify'

type ReleaseOptions = {
  dryRun: boolean
  kind?: ReleaseKind
  skipChecks: boolean
  skipE2E: boolean
  yes: boolean
}

const args = new Set(process.argv.slice(2))
const options: ReleaseOptions = {
  dryRun: args.has('--dry-run'),
  kind: args.has('--app-only')
    ? 'app'
    : args.has('--with-migrations')
      ? 'database-and-app'
      : args.has('--verify-only')
        ? 'verify'
        : undefined,
  skipChecks: args.has('--skip-checks'),
  skipE2E: args.has('--skip-e2e'),
  yes: args.has('--yes'),
}

const startedAt = new Date()
const target = getWranglerTargets()
const report: Record<string, unknown> = {
  startedAt: startedAt.toISOString(),
  target,
  dryRun: options.dryRun,
  steps: [],
}

function step(name: string, commandArgs: string[], env: NodeJS.ProcessEnv = process.env): void {
  clack.log.step(label(name))
  ;(report.steps as unknown[]).push({
    command: commandArgs,
    name,
    startedAt: new Date().toISOString(),
  })
  if (options.dryRun) {
    clack.log.info(`${muted('[dry-run]')} ${command(commandArgs.join(' '))}`)
    return
  }
  const code = run(commandArgs, { env })
  if (code !== 0) throw new Error(`${name}失败（退出码 ${code}）`)
}

async function chooseKind(): Promise<ReleaseKind> {
  if (options.kind) return options.kind
  if (!process.stdin.isTTY)
    throw new Error('非交互环境必须指定 --app-only、--with-migrations 或 --verify-only')
  const answer = await clack.select<ReleaseKind>({
    message: '选择发布类型',
    initialValue: 'app',
    options: [
      { label: '仅部署应用代码', hint: '推荐，无 D1 schema 变化', value: 'app' },
      { label: '数据库迁移 + 应用', hint: '先备份生产 D1', value: 'database-and-app' },
      { label: '仅发布后验证', hint: '不部署代码', value: 'verify' },
    ],
  })
  if (clack.isCancel(answer)) throw new Error('用户取消发布')
  return answer
}

function checkGit(): { branch: string; commit: string } {
  const branch = capture(['git', 'branch', '--show-current']) ?? 'unknown'
  const commit = capture(['git', 'rev-parse', 'HEAD']) ?? 'unknown'
  const dirty = capture(['git', 'status', '--porcelain'])
  clack.log.info(`${label('Branch')}  ${branch}`)
  clack.log.info(`${label('Commit')}  ${commit}`)
  if (!options.dryRun && branch !== 'main')
    throw new Error(`生产发布要求 main 分支，当前为 ${branch}`)
  if (!options.dryRun && dirty) throw new Error('Git 工作区不干净，拒绝生产发布')
  if (!options.dryRun && capture(['git', 'rev-parse', '@{upstream}']) !== commit) {
    throw new Error('当前 commit 与 upstream 不一致，拒绝生产发布')
  }
  return { branch, commit }
}

function checkEnvironment(): void {
  if (process.env.CLOUDFLARE_ENV) {
    throw new Error(`CLOUDFLARE_ENV=${process.env.CLOUDFLARE_ENV}，但仓库没有命名 Cloudflare 环境`)
  }
  clack.log.info(`${label('Worker')}  ${target.workerName}`)
  clack.log.info(`${label('D1')}      ${target.databaseName} ${muted(`(${target.databaseId})`)}`)
  clack.log.info(`${label('R2')}      ${target.r2Bucket}`)
  if (!options.dryRun) {
    step('确认 Cloudflare 登录身份', ['bunx', 'wrangler', 'whoami'])
    step('确认生产 secrets 名称', ['bunx', 'wrangler', 'secret', 'list'])
  }
}

function runChecks(): void {
  if (options.skipChecks) {
    if (!options.dryRun) throw new Error('--skip-checks 只允许用于 dry run')
    clack.log.warn(warning('已跳过质量检查'))
    return
  }
  step('快速质量检查', ['bun', 'run', 'check:fast'])
  if (!options.skipE2E) step('浏览器 E2E', ['bun', 'run', 'test:e2e'])
  step('Cloudflare 产物构建', ['bun', 'run', 'build:cloudflare'])
}

async function confirmProduction(kind: ReleaseKind): Promise<void> {
  clack.note(
    [`类型: ${kind}`, `Worker: ${target.workerName}`, `D1: ${target.databaseName}`].join('\n'),
    options.dryRun ? 'Dry run 计划' : '生产发布目标',
  )
  if (options.dryRun) return
  if (options.yes) {
    if (!process.env.CI) throw new Error('--yes 只允许在受保护的 CI 环境使用')
    return
  }
  if (!process.stdin.isTTY) throw new Error('生产发布需要交互式终端或受保护 CI 的 --yes')
  const answer = await clack.text({
    message: `输入 Worker 名称确认生产发布`,
    placeholder: target.workerName,
    validate: (value) => (value === target.workerName ? undefined : `请输入 ${target.workerName}`),
  })
  if (clack.isCancel(answer)) throw new Error('用户取消发布')
}

function backupDatabase(): string {
  const timestamp = new Date().toISOString().replaceAll(':', '').replaceAll('.', '')
  const path = join(repositoryRoot, 'backups', `${target.databaseName}-${timestamp}.sql`)
  if (!options.dryRun) mkdirSync(join(repositoryRoot, 'backups'), { recursive: true })
  step('备份生产 D1', [
    'bunx',
    'wrangler',
    'd1',
    'export',
    target.databaseName,
    '--remote',
    `--output=${path}`,
  ])
  if (!options.dryRun && (!existsSync(path) || statSync(path).size === 0)) {
    throw new Error(`D1 备份不存在或为空: ${path}`)
  }
  report.databaseBackup = path
  return path
}

async function verify(): Promise<void> {
  clack.log.step(label('生产 smoke test'))
  for (const url of ['https://noumi.ai/', 'https://noumi.ai/blog', 'https://noumi.ai/admin']) {
    if (options.dryRun) {
      clack.log.info(`${muted('[dry-run]')} GET ${command(url)}`)
      continue
    }
    const ok = await probe(url, 15_000)
    clack.log.info(`${ok ? success('●') : danger('●')} ${url}`)
    if (!ok) throw new Error(`生产验证失败: ${url}`)
  }

  const refreshToken = process.env.OFFICIAL_SNAPSHOT_REFRESH_TOKEN
  if (!options.dryRun && refreshToken) {
    const response = await fetch(
      'https://noumi.ai/api/site/snapshots/refresh?mode=force&reason=release',
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        method: 'POST',
      },
    )
    if (!response.ok) throw new Error(`Snapshot 刷新失败: HTTP ${response.status}`)
    clack.log.success('Snapshot 刷新已触发')
  } else if (!options.dryRun) {
    clack.log.warn('未设置 OFFICIAL_SNAPSHOT_REFRESH_TOKEN，跳过主动刷新')
  }
}

async function main(): Promise<void> {
  clack.intro('Noumi Official Website 发布向导')
  clack.log.info(
    options.dryRun ? muted('Dry run：不修改远程资源') : danger('Production：将修改远程资源'),
  )

  const kind = await chooseKind()
  report.kind = kind
  const git = checkGit()
  Object.assign(report, git)
  checkEnvironment()

  if (kind !== 'verify') runChecks()
  await confirmProduction(kind)

  if (kind === 'database-and-app') {
    backupDatabase()
    step('执行生产 D1 migrations', ['bun', 'run', 'deploy:database'])
  }
  if (kind === 'app' || kind === 'database-and-app') {
    step('部署 Cloudflare Worker', ['bun', 'run', 'deploy:app'])
  }
  await verify()

  report.finishedAt = new Date().toISOString()
  report.status = 'success'
  const reportPath = join(
    repositoryRoot,
    '.local',
    'releases',
    `${startedAt.toISOString().replaceAll(':', '')}.json`,
  )
  writeJson(reportPath, report)
  clack.outro(`${success('发布流程完成')}  ${muted(reportPath)}`)
}

try {
  await main()
} catch (error) {
  report.finishedAt = new Date().toISOString()
  report.status = 'failed'
  report.error = (error as Error).message
  const reportPath = join(
    repositoryRoot,
    '.local',
    'releases',
    `${startedAt.toISOString().replaceAll(':', '')}.json`,
  )
  writeJson(reportPath, report)
  clack.log.error(danger((error as Error).message))
  clack.cancel(`流程终止；报告：${reportPath}`)
  process.exitCode = 1
}
