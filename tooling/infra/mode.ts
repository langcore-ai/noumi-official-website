import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import * as clack from '@clack/prompts'

import {
  localInfraDir,
  getLanIPv4Addresses,
  isPortAvailable,
  probe,
  probeStatus,
  readLogTail,
  readPid,
  readManagedPort,
  repositoryRoot,
  run,
  startBackground,
  stopBackground,
  writeManagedPort,
} from './shared'
import { command, danger, muted, statusMark, success, title, warning } from './tui'

type Mode = 'local' | 'preview'

/** 不同模式的就绪预算；local 的 next build 在前台完成，后台只跑 next start；preview 含两段生产构建。 */
const STARTUP_TIMEOUT_MS: Record<Mode, number> = {
  local: 90_000,
  preview: 300_000,
}

/** 模式切换时等待旧进程组退出，避免多个 Next 进程同时写入 `.next`。 */
const PROCESS_STOP_TIMEOUT_MS = 10_000

function isManagedProcessGroupAlive(pid: number): boolean {
  try {
    process.kill(-pid, 0)
    return true
  } catch {
    try {
      process.kill(pid, 0)
      return true
    } catch {
      return false
    }
  }
}

const mode = process.argv[2] as Mode | 'status' | 'stop' | 'reload' | undefined
const action = process.argv[3] ?? 'status'

function commandFor(target: Mode, port: number): string[] {
  return target === 'local'
    ? ['bun', 'run', 'start', '--hostname', '0.0.0.0', '--port', String(port)]
    : ['bun', 'run', 'preview', '--ip', '0.0.0.0', '--port', String(port)]
}

function defaultPortFor(target: Mode): number {
  return target === 'local' ? 3000 : 8787
}

function urlFor(port: number, host = 'localhost'): string {
  return `http://${host}:${port}/`
}

async function chooseAvailablePort(target: Mode): Promise<number | null> {
  const first = defaultPortFor(target)
  for (let port = first; port < first + 20; port += 1) {
    if (await isPortAvailable(port)) return port
  }
  return null
}

async function status(): Promise<number> {
  console.log(title('Noumi Website 开发模式'))
  for (const target of ['local', 'preview'] as const) {
    const pid = readPid(target)
    const port = readManagedPort(target, defaultPortFor(target))
    const healthStatus = await probeStatus(urlFor(port), 6_000)
    const responding = healthStatus !== null
    const healthy = responding && healthStatus < 500
    const managedReady = pid !== null && healthy
    const state = managedReady
      ? ('ok' as const)
      : pid && healthStatus === null
        ? ('warn' as const)
        : pid
          ? ('error' as const)
          : responding
            ? ('warn' as const)
            : ('idle' as const)
    const stateText = managedReady
      ? success(`就绪 HTTP ${healthStatus}`)
      : pid && healthStatus === null
        ? warning('运行中，健康检查超时（可能正在编译）')
        : pid
          ? danger(`运行中但请求失败 HTTP ${healthStatus}`)
          : responding
            ? warning(`端口 ${port} 被外部进程占用`)
            : muted('未就绪')
    console.log(
      `  ${statusMark(state)} ${target.padEnd(8)} ${pid ? `PID ${pid}` : muted('未托管')}  :${port} ${stateText}`,
    )
  }
  return 0
}

async function stopAndWait(target: Mode): Promise<boolean> {
  const pid = readPid(target)
  const stopped = stopBackground(target)
  if (!stopped || !pid) return true

  const deadline = Date.now() + PROCESS_STOP_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (!isManagedProcessGroupAlive(pid)) return true
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.error(
    danger(`● ${target} 进程组收到停止信号后仍未退出；已中止启动，避免并发写入构建目录`),
  )
  return false
}

async function stop(target: Mode): Promise<number> {
  const wasRunning = readPid(target) !== null
  const stopped = await stopAndWait(target)
  if (!wasRunning) {
    console.log(muted(`○ ${target} 未运行`))
    return 0
  }
  if (!stopped) return 1

  console.log(success(`● 已停止 ${target}`))
  return 0
}

async function start(target: Mode, options: { skipBuild?: boolean } = {}): Promise<number> {
  const other = target === 'local' ? 'preview' : 'local'
  if (!(await stopAndWait(other))) return 1
  const existingPid = readPid(target)
  if (existingPid) {
    const existingPort = readManagedPort(target, defaultPortFor(target))
    const existingReady = await probe(urlFor(existingPort), 2_000)
    if (existingReady) {
      console.log(success(`● ${target} 已经运行：${urlFor(existingPort)}`))
      return 0
    }
    console.log(
      warning(
        `● 检测到 ${target} PID ${existingPid} 存活但 :${existingPort} 未就绪，正在清理并重新启动`,
      ),
    )
    if (!(await stopAndWait(target))) return 1
  }
  const port = await chooseAvailablePort(target)
  if (port === null) {
    console.error(
      warning(
        `● ${defaultPortFor(target)}-${defaultPortFor(target) + 19} 均被占用，无法启动 ${target}。`,
      ),
    )
    return 1
  }
  if (port !== defaultPortFor(target)) {
    console.log(warning(`● 端口 ${defaultPortFor(target)} 已被占用，自动切换到 ${port}`))
  }
  if (target === 'local' && !options.skipBuild) {
    console.log(title('构建 Next.js 生产产物'))
    const buildCode = run(['bun', 'run', 'build'])
    if (buildCode !== 0) {
      console.error(danger('● 构建失败，未启动 local'))
      return buildCode
    }
  }
  writeManagedPort(target, port)
  startBackground(target, commandFor(target, port))
  const spinner = clack.spinner()
  spinner.start(`等待 ${target} :${port} 就绪`)
  const interrupt = () => {
    spinner.stop('启动已取消')
    stopBackground(target)
    process.exit(130)
  }
  process.once('SIGINT', interrupt)
  const deadline = Date.now() + STARTUP_TIMEOUT_MS[target]
  let healthStatus: number | null = null
  while (Date.now() < deadline) {
    if (!readPid(target)) break
    healthStatus = await probeStatus(urlFor(port), 3_000)
    if (healthStatus !== null) break
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }
  process.removeListener('SIGINT', interrupt)

  if (healthStatus === null || healthStatus >= 500) {
    const reason =
      healthStatus === null ? '进程退出或就绪超时' : `健康检查返回 HTTP ${healthStatus}`
    spinner.stop(`${target} 启动失败`)
    clack.log.error(reason)
    stopBackground(target)
    const tail = readLogTail(target)
    if (tail) clack.note(tail, '日志尾部')
    if (tail.includes('table _cf_ALARM has 3 columns but 2 values were supplied')) {
      console.log(
        warning(
          '检测到本地 Wrangler/Miniflare 状态与当前 workerd 不兼容。请先备份需要的本地数据，再清理 .wrangler 状态。',
        ),
      )
    }
    return 1
  }
  spinner.stop(`${target} 已就绪`)
  console.log(success(`● ${target} 已就绪：${urlFor(port)}`))
  for (const address of getLanIPv4Addresses()) {
    console.log(`  局域网：${command(urlFor(port, address))}`)
  }
  return 0
}

async function logs(target: Mode): Promise<number> {
  const path = join(localInfraDir, `${target}.log`)
  if (!existsSync(path)) {
    console.error(`暂无托管日志：${path}`)
    return 1
  }
  createReadStream(path).pipe(process.stdout)
  return 0
}

async function reload(): Promise<number> {
  const running = (['local', 'preview'] as const).filter((target) => readPid(target) !== null)
  if (running.length === 0) {
    console.log(warning('没有正在运行的模式；请先执行 bun run mode:local up 或 mode:preview up'))
    return 1
  }
  const target = running[0]
  if (running.length > 1) {
    console.log(warning(`检测到 ${running.join('、')} 均在运行，本次只重载 ${target}`))
  }
  if (!(await stopAndWait(target))) return 1
  console.log(title(`重新构建并启动 ${target}`))
  return start(target)
}

async function main(): Promise<number> {
  if (mode === 'status') return status()
  if (mode === 'reload') return reload()
  if (mode === 'stop') {
    const localCode = await stop('local')
    const previewCode = await stop('preview')
    return localCode || previewCode
  }
  if (mode !== 'local' && mode !== 'preview') {
    console.log(
      `用法: ${command('bun tooling/infra/mode.ts <local|preview> <up|stop|restart|rebuild|status|logs>')}，或 ${command('bun tooling/infra/mode.ts reload')}`,
    )
    return 1
  }
  if (action === 'up' || action === 'start') return start(mode)
  if (action === 'stop') return await stop(mode)
  if (action === 'restart') {
    if (!(await stopAndWait(mode))) return 1
    return start(mode)
  }
  if (action === 'rebuild') {
    if (!(await stopAndWait(mode))) return 1
    // check:fast 里的 next build 会写 .next，先停掉 local 避免并发读写构建目录。
    if (!(await stopAndWait('local'))) return 1
    console.log(title('运行测试与生产构建检查'))
    const checkCode = run(['bun', 'run', 'check:fast'])
    if (checkCode !== 0) {
      console.error(danger('● 检查失败，未启动旧产物'))
      return checkCode
    }
    // check:fast 已包含 next build，这里直接启动产物，避免重复构建。
    return start(mode, { skipBuild: true })
  }
  if (action === 'status' || action === 'ps') return status()
  if (action === 'logs') return logs(mode)
  console.error(`未知动作: ${action}`)
  return 1
}

process.chdir(repositoryRoot)
process.exit(await main())
