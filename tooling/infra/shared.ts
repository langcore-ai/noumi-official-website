import { spawn, spawnSync } from 'node:child_process'
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:net'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
export const localInfraDir = join(repositoryRoot, '.local', 'infra')

export type CommandOptions = {
  env?: NodeJS.ProcessEnv
  quiet?: boolean
}

export function run(command: string[], options: CommandOptions = {}): number {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: repositoryRoot,
    env: options.env ?? process.env,
    stdio: options.quiet ? 'pipe' : 'inherit',
  })

  if (result.error) {
    console.error(`无法执行 ${command.join(' ')}: ${result.error.message}`)
    return 1
  }
  return result.status ?? 1
}

export function capture(command: string[], env: NodeJS.ProcessEnv = process.env): string | null {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return result.status === 0 ? result.stdout.trim() : null
}

export function commandExists(command: string): boolean {
  return spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0
}

export function ensureLocalInfraDir(): void {
  mkdirSync(localInfraDir, { recursive: true })
}

export function readPid(name: string): number | null {
  const path = join(localInfraDir, `${name}.pid`)
  if (!existsSync(path)) return null
  const pid = Number(readFileSync(path, 'utf8').trim())
  if (!Number.isInteger(pid) || pid <= 0) return null
  try {
    process.kill(pid, 0)
    return pid
  } catch {
    return null
  }
}

export function startBackground(
  name: string,
  command: string[],
  extraEnv: Record<string, string> = {},
): number {
  ensureLocalInfraDir()
  const logPath = join(localInfraDir, `${name}.log`)
  // 每次启动只保留本次运行日志，避免错误诊断被前一次构建输出干扰。
  const logFd = openSync(logPath, 'w', 0o600)
  const child = spawn(command[0], command.slice(1), {
    cwd: repositoryRoot,
    detached: true,
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', logFd, logFd],
  })
  child.unref()
  closeSync(logFd)
  writeFileSync(join(localInfraDir, `${name}.pid`), `${child.pid}\n`)
  writeFileSync(join(localInfraDir, `${name}.command`), `${command.join(' ')}\n`)
  console.log(`已启动 ${name}（PID ${child.pid}）`)
  console.log(`日志：${logPath}`)
  return child.pid ?? 0
}

export function stopBackground(name: string): boolean {
  const pid = readPid(name)
  if (!pid) {
    clearManagedPort(name)
    return false
  }
  try {
    process.kill(-pid, 'SIGTERM')
  } catch {
    process.kill(pid, 'SIGTERM')
  }
  clearManagedPort(name)
  return true
}

export async function probe(url: string, timeoutMs = 5_000): Promise<boolean> {
  const status = await probeStatus(url, timeoutMs)
  return status !== null && status < 500
}

export async function probeStatus(url: string, timeoutMs = 5_000): Promise<number | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { redirect: 'manual', signal: controller.signal })
    return response.status
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export function readLogTail(name: string, maxLines = 30): string {
  const path = join(localInfraDir, `${name}.log`)
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf8').trimEnd().split('\n').slice(-maxLines).join('\n')
}

export async function waitFor(url: string, timeoutMs = 90_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await probe(url, 2_500)) return true
    await new Promise((resolve) => setTimeout(resolve, 1_500))
  }
  return false
}

export function isPortAvailable(port: number, host = '0.0.0.0'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.once('error', () => resolve(false))
    server.listen({ host, port }, () => server.close(() => resolve(true)))
  })
}

export function getLanIPv4Addresses(): string[] {
  return Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => address.address)
}

export function readManagedPort(name: string, fallback: number): number {
  const path = join(localInfraDir, `${name}.port`)
  if (!existsSync(path)) return fallback
  const port = Number(readFileSync(path, 'utf8').trim())
  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : fallback
}

export function writeManagedPort(name: string, port: number): void {
  ensureLocalInfraDir()
  writeFileSync(join(localInfraDir, `${name}.port`), `${port}\n`)
}

export function clearManagedPort(name: string): void {
  rmSync(join(localInfraDir, `${name}.port`), { force: true })
}

export function getWranglerTargets(): {
  databaseId: string
  databaseName: string
  r2Bucket: string
  workerName: string
} {
  const source = readFileSync(join(repositoryRoot, 'wrangler.jsonc'), 'utf8')
  const value = (pattern: RegExp, label: string): string => {
    const match = source.match(pattern)?.[1]
    if (!match) throw new Error(`无法从 wrangler.jsonc 解析 ${label}`)
    return match
  }
  return {
    workerName: value(/"name"\s*:\s*"([^"]+)"/, 'Worker name'),
    databaseId: value(/"database_id"\s*:\s*"([^"]+)"/, 'D1 database_id'),
    databaseName: value(/"database_name"\s*:\s*"([^"]+)"/, 'D1 database_name'),
    r2Bucket: value(/"bucket_name"\s*:\s*"([^"]+)"/, 'R2 bucket_name'),
  }
}

export function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
}
