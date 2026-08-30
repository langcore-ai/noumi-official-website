const commandGroups = [
  {
    title: '环境准备',
    commands: [
      ['bun run infra:doctor', '检查工具、配置和 Cloudflare 资源目标'],
      ['bun run infra:setup', '安装锁定依赖并初始化本地 .env'],
    ],
  },
  {
    title: '开发模式',
    commands: [
      ['bun run mode:local up', '后台启动 Next.js + Payload 本地开发'],
      ['bun run mode:preview up', '构建并启动 OpenNext/Cloudflare 本地预览'],
      ['bun run mode:preview rebuild', '测试、重新构建并启动固定产物'],
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
      ['bun run release', '交互式生产发布向导'],
      ['bun run release --dry-run --app-only', '预演仅应用发布，不写远程资源'],
      ['bun run release --dry-run --with-migrations', '预演 D1 备份、迁移和应用发布'],
      ['bun run release --verify-only', '只执行生产 smoke test 和快照刷新'],
    ],
  },
] as const

console.log(title('Noumi Official Website — 开发与发布帮助'))
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
