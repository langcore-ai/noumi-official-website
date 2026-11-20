/**
 * Footer 数据同步：把测试环境的「菜单配置」页脚（栏目、链接、版权、说明）同步到生产。
 *
 * 用法：
 *   bun tooling/infra/footer-sync.ts snapshot container   # 从 SSH 开发容器导出
 *   bun tooling/infra/footer-sync.ts snapshot staging     # 从云端 Preview 导出
 *   bun tooling/infra/footer-sync.ts snapshot production  # 导出生产当前值（回退用）
 *   bun tooling/infra/footer-sync.ts diff staging         # 只比较，不写
 *   bun tooling/infra/footer-sync.ts apply staging --yes  # 备份后写入生产并发布
 *   bun tooling/infra/footer-sync.ts export staging       # 写回 src/lib/site/footer-defaults.json
 *   bun tooling/infra/footer-sync.ts refresh              # 触发生产页面快照刷新
 *
 * 源参数可以是 staging / production / container，或任意快照 JSON 路径。
 * 容器访问依赖 NOUMI_DEV_SSH（user@host）、NOUMI_DEV_PORT、NOUMI_DEV_PSK（可选）、
 * NOUMI_DEV_CONTAINER；这些值属于本机环境，不写入仓库。
 * 凭据只从 .local/infra/*.admin.json 读取，可用 <NAME>_ADMIN 环境变量指向其他文件。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

import { capture, localInfraDir, repositoryRoot } from './shared'
import { command, danger, label, muted, success, warning } from './tui'

const STAGING_ORIGIN = 'https://preview.staging.noumi.ai'
const PRODUCTION_ORIGIN = 'https://noumi.ai'
const GLOBAL_SLUG = 'menu-settings'
const SNAPSHOT_DIR = join(localInfraDir, 'footer-sync')
const DEFAULTS_PATH = join(repositoryRoot, 'src/lib/site/footer-defaults.json')

const LinkSchema = z.object({
  href: z.string(),
  label: z.string(),
  hidden: z.boolean().catch(false),
})
const ColumnSchema = z.object({
  title: z.string().min(1),
  hidden: z.boolean().catch(false),
  links: z.array(LinkSchema).default([]),
})
const MenuGlobalSchema = z.object({
  enabled: z.boolean().catch(false),
  header: z.array(z.unknown()).default([]),
  footer: z.array(ColumnSchema).default([]),
  ctaLabel: z.string().nullish(),
  ctaHref: z.string().nullish(),
  description: z.string().nullish(),
  copyright: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  icp: z.string().nullish(),
  publicSecurity: z.string().nullish(),
  _status: z.string().nullish(),
  updatedAt: z.string().nullish(),
})
const CredentialsSchema = z.object({ email: z.string().min(1), password: z.string().min(1) })

type Column = z.infer<typeof ColumnSchema>
type MenuGlobal = z.infer<typeof MenuGlobalSchema>
type FooterSnapshot = { footer: Column[]; copyright: string; description: string }

/** 只同步页脚；Header、按钮、联系方式等字段保持生产现值。 */
const SCALAR_KEYS = [
  'ctaLabel',
  'ctaHref',
  'description',
  'copyright',
  'email',
  'phone',
  'address',
  'icp',
  'publicSecurity',
] as const

const args = process.argv.slice(2)
const action = args[0] ?? 'diff'
const sourceArg = args[1]
const flags = new Set(args.slice(2))

/** 解析外部响应或快照，失败时带上来源便于定位。 */
function parseMenuGlobal(input: unknown, origin: string): MenuGlobal {
  const apiError = z
    .object({ errors: z.array(z.object({ message: z.string().optional() })) })
    .safeParse(input)
  if (apiError.success) {
    const detail = apiError.data.errors.map((error) => error.message ?? '未知错误').join('; ')
    throw new Error(`${origin} 读取失败：${detail}`)
  }
  const parsed = MenuGlobalSchema.safeParse(input)
  if (!parsed.success) throw new Error(`${origin} 数据格式不符：${parsed.error.issues[0]?.message}`)
  return parsed.data
}

/**
 * 读取管理员凭据。
 * 凭据文件属于本机私有配置，接受 .local 与 .local/infra 下的既有命名。
 */
function readCredentials(name: string): z.infer<typeof CredentialsSchema> {
  const override = process.env[`${name.toUpperCase()}_ADMIN`]
  const path =
    override ??
    [`${name}-test-admin.json`, `${name}.admin.json`]
      .flatMap((file) => [join(localInfraDir, file), join(repositoryRoot, '.local', file)])
      .find((candidate) => existsSync(candidate))
  if (!path) {
    throw new Error(
      `缺少 ${name} 管理员凭据：.local/${name}-test-admin.json 或 .local/infra/${name}.admin.json`,
    )
  }
  const parsed = CredentialsSchema.safeParse(JSON.parse(readFileSync(path, 'utf8')))
  if (!parsed.success) throw new Error(`凭据文件不完整：${path}`)
  return parsed.data
}

/** 登录并返回 JWT；登录响应只有 token 字段会被使用。 */
async function login(origin: string, account: string): Promise<string> {
  const response = await fetch(`${origin}/api/users/login`, {
    body: JSON.stringify(readCredentials(account)),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const body: unknown = await response.json()
  const token = z.object({ token: z.string() }).safeParse(body)
  if (!response.ok || !token.success)
    throw new Error(`${account} 登录失败：HTTP ${response.status}`)
  return token.data.token
}

/** 读取「菜单配置」全局。已发布内容可匿名读取，草稿需要管理员令牌。 */
async function fetchMenuGlobal(
  origin: string,
  options: { account?: string } = {},
): Promise<MenuGlobal> {
  const query = new URLSearchParams({ depth: '0' })
  const headers: Record<string, string> = { 'Cache-Control': 'no-cache' }
  if (options.account) {
    headers.Authorization = `JWT ${await login(origin, options.account)}`
    query.set('draft', 'true')
  }
  const response = await fetch(`${origin}/api/globals/${GLOBAL_SLUG}?${query}`, { headers })
  if (!response.ok) throw new Error(`${origin} 读取失败：HTTP ${response.status}`)
  return parseMenuGlobal(await response.json(), origin)
}

/** 通过 SSH 在开发容器内请求本地站点，避免把服务端口暴露到公网。 */
function fetchContainerGlobal(): MenuGlobal {
  const sshTarget = process.env.NOUMI_DEV_SSH
  if (!sshTarget) throw new Error('缺少 NOUMI_DEV_SSH（形如 用户名#用户#资产@跳板机）')
  const url = `http://127.0.0.1:${process.env.NOUMI_DEV_APP_PORT ?? '3000'}/api/globals/${GLOBAL_SLUG}?depth=0`
  const container = process.env.NOUMI_DEV_CONTAINER ?? 'noumi-dev-workspace-1'
  const sshArgs = [
    'ssh',
    '-o',
    'BatchMode=yes',
    '-i',
    process.env.NOUMI_DEV_KEY ?? join(process.env.HOME ?? '', '.ssh/id_ed25519'),
    '-p',
    process.env.NOUMI_DEV_PORT ?? '28131',
  ]
  if (process.env.NOUMI_DEV_PSK) {
    sshArgs.push('-o', `ProxyCommand=ssh -o BatchMode=yes -W %h:%p ${process.env.NOUMI_DEV_PSK}`)
  }
  sshArgs.push(sshTarget, `docker exec -u agent ${container} curl -sf "${url}"`)
  const stdout = capture(sshArgs)
  if (!stdout) throw new Error('容器读取失败：检查 SSH 目标、容器名与站点端口')
  return parseMenuGlobal(JSON.parse(stdout), 'container')
}

/** 解析源参数为站点地址 / 快照文件 / 容器。 */
async function readSource(target: string): Promise<{ data: MenuGlobal; label: string }> {
  if (target === 'staging') {
    return { data: await fetchMenuGlobal(STAGING_ORIGIN, { account: 'staging' }), label: 'staging' }
  }
  if (target === 'production') {
    return { data: await fetchMenuGlobal(PRODUCTION_ORIGIN), label: 'production' }
  }
  if (target === 'container') return { data: fetchContainerGlobal(), label: 'container' }
  const path = existsSync(target) ? target : join(SNAPSHOT_DIR, `${target}.json`)
  if (!existsSync(path)) {
    throw new Error(`未知来源：${target}（可选 staging / production / container 或快照路径）`)
  }
  return { data: parseMenuGlobal(JSON.parse(readFileSync(path, 'utf8')), path), label: path }
}

function pickFooter(data: MenuGlobal): FooterSnapshot {
  return {
    copyright: data.copyright ?? '',
    description: data.description ?? '',
    footer: data.footer,
  }
}

/** 生成写入 Payload 的完整数据：覆盖页脚三元组，其余沿用生产现值。 */
function buildUpdate(source: MenuGlobal, current: MenuGlobal): Record<string, unknown> {
  const footer = pickFooter(source)
  const scalars = Object.fromEntries(SCALAR_KEYS.map((key) => [key, current[key] ?? null]))
  return {
    ...scalars,
    copyright: footer.copyright,
    description: footer.description,
    enabled: current.enabled,
    footer: footer.footer.map((column) => ({
      hidden: column.hidden,
      links: column.links.map(({ href, label }) => ({ href, label })),
      title: column.title,
    })),
    header: stripIds(current.header),
  }
}

/** 去掉数组行 id，避免写入时与目标环境已有行冲突。 */
function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds)
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'id')
        .map(([key, child]) => [key, stripIds(child)]),
    )
  }
  return value
}

/** 逐字段比较两份页脚数据，返回可读差异。 */
function diffFooter(source: FooterSnapshot, current: FooterSnapshot): string[] {
  const lines: string[] = []
  if (source.copyright !== current.copyright) {
    lines.push(
      `版权\n  当前: ${current.copyright || '(空)'}\n  来源: ${source.copyright || '(空)'}`,
    )
  }
  if (source.description !== current.description) {
    lines.push(
      `页脚说明\n  当前: ${current.description || '(空)'}\n  来源: ${source.description || '(空)'}`,
    )
  }
  const format = (column: Column): string =>
    column.links.map((link) => `${link.label} → ${link.href}`).join(', ') || '(空)'
  const titles = [...new Set([...source.footer, ...current.footer].map((column) => column.title))]
  for (const title of titles) {
    const from = source.footer.find((column) => column.title === title)
    const to = current.footer.find((column) => column.title === title)
    if (!from) {
      lines.push(`栏目「${title}」仅生产存在（同步后删除）`)
      continue
    }
    if (!to) {
      lines.push(`栏目「${title}」仅来源存在（同步后新增）`)
      continue
    }
    if (format(from) !== format(to)) {
      lines.push(`栏目「${title}」\n  当前: ${format(to)}\n  来源: ${format(from)}`)
    }
    if (from.hidden !== to.hidden) {
      lines.push(`栏目「${title}」隐藏状态：当前 ${to.hidden} → 来源 ${from.hidden}`)
    }
  }
  const orderOf = (snapshot: FooterSnapshot): string =>
    snapshot.footer.map((column) => column.title).join(' / ')
  if (orderOf(source) !== orderOf(current)) {
    lines.push(`栏目顺序\n  当前: ${orderOf(current)}\n  来源: ${orderOf(source)}`)
  }
  return lines
}

/** 写入生产并发布；成功后回读已发布内容确认。 */
async function applyToProduction(source: MenuGlobal, sourceLabel: string): Promise<void> {
  const current = await fetchMenuGlobal(PRODUCTION_ORIGIN, { account: 'production' })
  const pending = diffFooter(pickFooter(source), pickFooter(current))
  if (pending.length === 0) {
    console.log(success('页脚已是最新，无需同步。'))
    return
  }
  console.log(`${label('待同步差异')} ${muted(`(${sourceLabel} → production)`)}`)
  for (const line of pending) console.log(`  ${line}`)
  if (!flags.has('--yes')) {
    console.log(warning('未写入。确认后加 --yes 执行。'))
    return
  }

  mkdirSync(SNAPSHOT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replaceAll(':', '')
  const backupPath = join(SNAPSHOT_DIR, `production-before-${stamp}.json`)
  writeFileSync(backupPath, JSON.stringify(current, null, 2))
  console.log(`${label('已备份生产当前配置')} ${muted(backupPath)}`)

  const response = await fetch(`${PRODUCTION_ORIGIN}/api/globals/${GLOBAL_SLUG}`, {
    body: JSON.stringify(buildUpdate(source, current)),
    headers: {
      Authorization: `JWT ${await login(PRODUCTION_ORIGIN, 'production')}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  if (!response.ok) throw new Error(`写入失败：HTTP ${response.status} ${await response.text()}`)

  const published = await fetchMenuGlobal(PRODUCTION_ORIGIN)
  const remaining = diffFooter(pickFooter(source), pickFooter(published))
  if (remaining.length) {
    console.log(danger('写入完成但回读仍有差异：'))
    for (const line of remaining) console.log(`  ${line}`)
    process.exitCode = 1
    return
  }
  console.log(
    success(
      `已发布：${published.footer.map((c) => c.title).join(' / ')}；${published.copyright ?? ''}`,
    ),
  )
  console.log(muted('页面快照需刷新：bun tooling/infra/footer-sync.ts refresh'))
}

/** 把来源页脚写回仓库默认值，供新建环境使用。 */
function exportDefaults(source: MenuGlobal): void {
  const footer = pickFooter(source)
  const next = {
    copyright: footer.copyright,
    footer: footer.footer.map((column) => ({
      links: column.links.map(({ href, label }) => ({ href, label })),
      title: column.title,
    })),
  }
  writeFileSync(DEFAULTS_PATH, `${JSON.stringify(next, null, 2)}\n`)
  console.log(success(`已写入 ${DEFAULTS_PATH}`))
}

/** 触发生产快照刷新；没有刷新令牌时提示等待定时任务。 */
async function refreshSnapshots(): Promise<void> {
  const path = join(localInfraDir, 'production.snapshot-secret.json')
  const secret = existsSync(path)
    ? z
        .object({ OFFICIAL_SNAPSHOT_REFRESH_TOKEN: z.string().min(1) })
        .safeParse(JSON.parse(readFileSync(path, 'utf8')))
    : null
  if (!secret?.success) {
    console.log(warning('缺少 .local/infra/production.snapshot-secret.json，跳过主动刷新。'))
    return
  }
  const response = await fetch(
    `${PRODUCTION_ORIGIN}/api/site/snapshots/refresh?mode=force&reason=footer-sync`,
    {
      headers: { Authorization: `Bearer ${secret.data.OFFICIAL_SNAPSHOT_REFRESH_TOKEN}` },
      method: 'POST',
    },
  )
  const body = z
    .object({ ok: z.boolean(), message: z.string().optional() })
    .safeParse(await response.json())
  if (response.ok && body.success && body.data.ok) {
    console.log(success('已触发生产快照刷新。'))
    return
  }
  console.log(
    warning(
      `快照刷新未执行：${body.success ? (body.data.message ?? '已被拒绝') : `HTTP ${response.status}`}`,
    ),
  )
}

async function main(): Promise<void> {
  if (action === 'refresh') {
    await refreshSnapshots()
    return
  }
  if (!sourceArg) throw new Error('缺少来源：staging / production / container 或快照路径')
  const source = await readSource(sourceArg)
  console.log(
    `${label('来源')} ${command(source.label)} ${muted(`updatedAt=${source.data.updatedAt ?? '—'}`)}`,
  )
  console.log(
    `  ${source.data.footer.map((c) => `${c.title}(${c.links.length})`).join(' / ') || '(无栏目)'}`,
  )

  if (action === 'snapshot') {
    mkdirSync(SNAPSHOT_DIR, { recursive: true })
    const path = join(SNAPSHOT_DIR, `${sourceArg.replaceAll('/', '_')}.json`)
    writeFileSync(path, JSON.stringify(source.data, null, 2))
    console.log(success(`已保存 ${path}`))
    return
  }
  if (action === 'export') {
    exportDefaults(source.data)
    return
  }
  if (action !== 'diff' && action !== 'apply') throw new Error(`未知动作：${action}`)
  await applyToProduction(source.data, source.label)
}

await main()
