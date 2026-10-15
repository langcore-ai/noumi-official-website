const commandGroups = [
  {
    title: '环境准备',
    commands: [
      ['bun run mode:help', '显示本地测试、云端测试和发布命令帮助'],
      ['bun run mode:setup', '迁移本地 D1 并初始化独立测试管理员（可重复执行）'],
      ['bun run mode:start', '构建并后台启动本地测试'],
      ['bun run mode:health', '检查本地实例身份、D1 和 R2'],
      ['bun run mode:logs', '查看当前本地模式日志'],
      ['bun run mode:build', '仅构建本地测试产物'],
      ['bun run infra:doctor', '检查工具、配置和 Cloudflare 资源目标'],
      ['bun run infra:setup', '安装锁定依赖并初始化本地 .env'],
    ],
  },
  {
    title: '开发模式',
    commands: [
      ['bun run mode:local up', '快速构建(跳过 tsc/lint)并后台启动,非热加载'],
      ['bun run mode:preview up', '构建并启动 OpenNext/Cloudflare 本地预览'],
      ['bun run mode:<local|preview> rebuild', '检查、重新构建并启动固定产物'],
      ['bun run mode:reload', '重新构建并重启当前运行的模式'],
      ['bun run mode:restart', 'mode:reload 的别名，重新构建并重启当前模式'],
      ['bun run mode:<local|preview> stop', '停止指定模式'],
      ['bun run mode:<local|preview> restart', '重启指定模式'],
      ['bun run mode:<local|preview> logs', '查看指定模式日志'],
      ['bun run mode:status', '查看所有模式和就绪状态'],
      ['bun run mode:stop', '停止所有托管模式'],
    ],
  },
  {
    title: '质量检查',
    commands: [
      ['bun run check:fast', '格式、ESLint、类型、集成测试和 Next build'],
      ['bun run check:full', '追加 Playwright E2E 和 OpenNext build'],
    ],
  },
  {
    title: '发布运维',
    commands: [
      ['bun run mode:staging deploy', '检查、构建、备份测试库并部署 staging.noumi.ai'],
      ['bun run mode:staging deploy --dry-run', '构建并检查测试部署包，不写远程资源'],
      ['bun run mode:staging status', '检查云端测试站、数据库、存储及 noindex'],
      ['bun run mode:staging logs', '查看 staging Worker 实时日志'],
      ['bun run release', '交互式生产发布向导'],
      ['bun run release --dry-run --app-only', '预演仅应用发布，不写远程资源'],
      ['bun run release --dry-run --with-migrations', '预演 D1 备份、迁移和应用发布'],
      ['bun run release --verify-only', '只执行生产 smoke test 和快照刷新'],
    ],
  },
] as const

console.log(title('Noumi Official Website — 开发与发布帮助'))
console.log('')
console.log('首次本地使用：bun run mode:setup → bun run mode:start')
console.log('修改代码后：bun run mode:reload')
console.log('发布测试站：bun run mode:stop → bun run mode:staging deploy')
console.log('')
for (const group of commandGroups) {
  console.log(title(group.title))
  const width = Math.max(...group.commands.map(([command]) => command.length))
  for (const [commandText, description] of group.commands) {
    console.log(`  ${command(commandText.padEnd(width))}  ${muted(description)}`)
  }
  console.log('')
}
console.log(
  warning('生产提醒：当前顶层 Cloudflare 环境就是生产，禁止设置 CLOUDFLARE_ENV=production。'),
)
console.log(`建议先执行 ${command('bun run release --dry-run --app-only')}。`)
import { command, muted, title, warning } from './tui'
