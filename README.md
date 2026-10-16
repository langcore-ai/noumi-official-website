# Noumi Official Website

Noumi 官方网站与内容管理项目，基于 Next.js 15、React 19、Payload CMS 3、Cloudflare Workers、D1 和 R2 构建。仓库同时承载公开官网、Payload 管理后台、草稿预览、媒体存储、内容快照、SEO/埋点以及 Invite 申请数据管理。

> 完整的代码、CMS、Cloudflare、部署、回滚与离项交接说明见 [docs/HANDOVER.md](docs/HANDOVER.md)。在执行生产迁移或部署前，必须先阅读该文档。

## 项目现状

- 正式域名以 `https://noumi.ai` 为 canonical，产品登录/注册入口为 `https://www.noumi.ai/auth`。
- Payload Admin 位于 `/admin`，Payload REST/GraphQL 位于 `/api`。
- D1 保存 Payload 数据；同一个 R2 bucket 保存 Payload 媒体、CMS JSON 快照、页面 HTML 快照和 OpenNext 增量缓存。
- 前台 layout 保持动态渲染，公开流量由 Worker 层的 R2 HTML 快照提供伪静态加速。
- Invite 已经是正式 Payload collection；当前公开 `/invite` 和 Try Free 按钮跳转产品站，公开 waitlist 提交暂时关闭，服务端同步接口仍保留。
- Cloudflare 顶层配置用于生产；`env.local` 使用本地模拟资源，`env.staging` 使用独立云端测试资源。没有 `env.production`。
- 本地/云端测试的命令、凭据位置与部署流程见 [测试环境指南](docs/TEST-ENVIRONMENTS.md)。

## 前端历史说明

前端页面最初因紧急上线从静态 HTML 快速派生，因此仍保留较多页面级 JSX、历史 class 名和非理想组件边界。当前 CSS 已从页面代码中拆出：基础样式位于 `official-base.css`、首页/共享样式位于 `official-home.css`，大多数内页使用各自的 `*.module.css`。

后续维护应优先保证视觉和 URL 兼容，不建议在没有完整回归的情况下做跨页面 CSS 合并或一次性组件化重构。CMS 另有“整页 HTML”渲染能力，这是受信任代码发布通道，不是安全沙箱，详见交接文档。

## 技术栈

| 领域            | 当前实现                                         |
| --------------- | ------------------------------------------------ |
| Web             | Next.js 15.4、React 19.2、TypeScript             |
| CMS             | Payload CMS 3.81、Lexical、SEO/Redirects plugins |
| Runtime         | Cloudflare Workers、OpenNext for Cloudflare      |
| Data            | Cloudflare D1 SQLite                             |
| Storage/cache   | Cloudflare R2                                    |
| Analytics       | GA4、可选 PostHog、Consent Mode                  |
| Test            | Vitest、Playwright                               |
| Dependency lock | `bun.lock`                                       |
| Script runner   | Bun（项目统一入口）；历史工具可能仍需 pnpm       |

## 快速开始

要求：Node.js `^18.20.2 || >=20.9.0`，建议使用当前 LTS；同时安装 Bun 和 pnpm 9/10。

```bash
bun install --frozen-lockfile
bun run mode:setup
bun run mode:start
bun run mode:status
```

打开：

- 官网：`http://localhost:3000`
- Payload Admin：`http://localhost:3000/admin`

说明：

- `bun.lock` 是仓库唯一锁文件，因此依赖安装以 Bun 为可复现基线。
- 使用 `bun run mode:` 系列命令管理测试环境；首次运行先执行 `bun run mode:setup`。
- Payload adapter 配置为 `push: false`，全新本地 D1 由 `mode:setup` 执行迁移。
- 本地 autosave 和 live preview 默认关闭，以降低 Miniflare/D1 锁竞争；按需在 `.env` 中开启。
- `bun run mode:local up` 是打包运行模式：先 `next build`（`build:quick`，跳过 tsc/lint）再后台 `next start`，不做热加载；完整类型/lint/测试门禁用 `mode:local rebuild`；日常 Agent 开发统一使用此隔离入口，修改后执行 `mode:reload`。`mode:local` 由 `tooling/infra/mode.ts` 强制注入 `OPEN_NEXT_LOCAL_BINDINGS=true`，因此 D1/R2 始终是本地 Miniflare 模拟资源；若看到生产内容（例如 `/api/globals/about-page` 的 `updatedAt` 不是本地值），说明服务不是由 `mode:local` 启动的。
- `pnpm run preview` 与 `bun run mode:preview up` 会同时禁用 OpenNext 预取阶段的远程 binding proxy，并显式传入 Wrangler `--local`，默认使用本地模拟的 D1/R2，不会读写远程资源；全新本地 D1 仍需先执行 migration 才能使用 Admin。
- 不要绕过项目脚本直接运行 `opennextjs-cloudflare preview`；上游命令的启动前环境读取不会自动继承 Wrangler `--local`，可能按主配置连接远程 D1。

## 常用命令

```bash
bun run mode:start           # 隔离本地环境，构建并运行
bun run mode:reload          # 修改后重建重启
pnpm run build               # Next.js 构建（完整类型检查）
pnpm run build:quick         # 快速构建：跳过 tsc/lint（本地快速迭代）
pnpm run generate:types      # 生成 Cloudflare/Payload 类型
pnpm run generate:importmap  # 生成 Payload Admin import map
pnpm run test:int            # Vitest 集成测试
pnpm run test:e2e            # Playwright E2E
pnpm run test                # 集成测试 + E2E
pnpm run deploy:database     # 危险：直接迁移远程 D1
pnpm run deploy:app          # OpenNext 构建并部署 Worker
pnpm run deploy              # 危险：先迁移远程 D1，再部署应用
```

生产部署的准确环境选择、备份、执行顺序和失败处理见 [docs/HANDOVER.md](docs/HANDOVER.md)。不要直接照抄 `CLOUDFLARE_ENV=production`：当前配置中不存在该命名环境。

## Infra 与发布入口

日常环境、检查和发布操作统一通过 Bun 执行，并以仓库中的 `bun.lock` 作为依赖基线：

```bash
bun run help                          # 查看开发、检查和发布命令总览
bun run infra:doctor                  # 环境、工具和 Cloudflare 目标检查
bun run infra:setup                   # 初始化依赖与本地 .env
bun run mode:local up                 # 构建 Next 生产产物并后台启动（非热加载）
bun run mode:local rebuild            # 检查、重新构建并启动 local 固定产物
bun run mode:preview up               # 构建并预览 Cloudflare 产物
bun run mode:preview rebuild          # 测试、重新构建并运行固定产物
bun run mode:status                   # 查看本地模式状态
bun run mode:stop                     # 停止所有托管模式
bun run check:fast                    # 格式、lint、类型、集成测试、Next build
bun run check:full                    # 加上 E2E 与 OpenNext build
bun run release                       # 交互式生产发布向导
bun run release --dry-run --app-only  # 不写远程资源的发布计划预演
```

`mode:local` 与 `mode:preview` 都监听 `0.0.0.0`；启动成功后会输出本机和局域网访问地址。只应在可信局域网中使用，Payload Admin 也会通过该端口暴露。

`release` 默认要求 `main`、干净且已推送的 Git commit，并展示 Worker、D1、R2 目标。涉及 migration 时会先导出远程 D1，再迁移和部署；完成后执行生产 smoke test，并将不含 secret 的报告写入 `.local/releases/`。底层 `deploy:*` 脚本保留用于流水线组合和故障排查，不建议作为日常人工发布入口。

## 目录导航

```text
src/
├── access/                  # Payload 角色与访问控制
├── app/(frontend)/          # 公开官网路由及页面专属样式
├── app/(payload)/           # Payload Admin、REST、GraphQL
├── app/api/site/            # Analytics、Invite、Snapshot API
├── collections/             # Payload collections
├── globals/                 # Payload globals
├── components/site/         # 官网共享组件与 HTML 渲染器
├── components/admin/        # Payload Admin 自定义组件
├── fields/                  # CMS 通用字段与 HTML 模式
├── lib/site/                # CMS view model、快照、预览、SEO、埋点
├── migrations/              # D1/Payload migrations
└── payload.config.ts        # Payload 主配置

worker.ts                    # OpenNext Worker 包装及 HTML 快照层
wrangler.jsonc               # Worker、D1、R2、Cron、变量和日志配置
open-next.config.ts          # OpenNext R2 incremental cache
scripts/                     # 构建兼容补丁
tests/                       # Vitest/Playwright
docs/HANDOVER.md             # 完整人类交接文档
README-AI.md                 # AI/代码代理导航
```

## 文档入口

- [完整交接与运维手册](docs/HANDOVER.md)
- [AI 代码导航](README-AI.md)
- [staging 分支开发与发布流程](docs/STAGING-WORKFLOW.md)
- [本地和测试环境指南](docs/TEST-ENVIRONMENTS.md)
- [工程实现约束](AGENTS.md)
- [环境变量模板](.env.example)

## 安全原则

- 不在 Git、README、issue 或聊天记录中保存真实 secret。
- 未备份和确认兼容性前，不执行远程 migration。
- 不把来源不可信的 HTML 粘贴到 HTML 模式；该模式可执行内联脚本并影响全局 CSS。
- 不清空 `official-website-bucket`；其中同时存在媒体和多类缓存/快照。
- 不把 Worker 回滚等同于数据回滚；D1 与 R2 必须单独处理。

## 网站管理：SEO、重定向与菜单

Payload 后台「网站管理」分组新增以下入口：

- **SEO 配置**（`/admin/collections/seo-configs`）：预置主要固定页面路径，也可添加任意公开页面路径。支持 Meta Title/Description/Keywords、独立 OG 标题/描述、上传或外部 URL 分享图、JSON-LD 覆盖、Canonical、noindex/nofollow。留空沿用页面原值；只有发布版本生效。当前官网为英文，前台读取英文配置。内容页已有 SEO 字段继续作为回退来源。
- **重定向**（`/admin/collections/redirects`）：站内路径精确匹配，301/302，支持自定义路径和内容引用。引用目标在保存规则时解析；目标 slug 改动后需重新保存规则。路径自动补全 `/`，禁止系统路径、自跳转及循环。保存草稿不生效；取消发布即可停用。既有规则迁移为草稿，需审核后发布。请求保留查询参数，多级规则合并到最终路径；超过 16 级或运行时发现循环则忽略规则。现有 URL 规范化及构建期旧路径映射优先。
- **菜单配置**（`/admin/globals/menu-settings`）：启用并发布后替换官网 Header、移动端导航和 Footer。支持排序、隐藏、子菜单、CTA、页脚说明、版权、联系方式与备案信息；关闭开关恢复原有官网菜单。启用后空列表表示不展示该区域。站点设置中的旧导航字段仅作历史数据保留。

沿用 `admin` / `content-editor` / `translator` 权限：管理员和内容编辑可新建/删除 SEO 与重定向，翻译角色可修改；菜单更新沿用内容更新权限。匿名访问只能读取发布态。SEO 和菜单发布沿用官网快照刷新机制；重定向由 Cloudflare Worker 在读取 HTML 快照前查询本地绑定的 D1，本地 Next 模式通过只读 API 使用相同规则。

本地升级使用 `bun run mode:setup` 应用迁移，然后 `bun run mode:local rebuild`。生产发布必须先按现有流程应用数据库迁移，再发布应用；本次开发不会自动迁移生产数据。

Cloudflare Builds 自动部署 staging 的配置与验证见 [部署指南](docs/CLOUDFLARE-BUILDS.md)。云端使用 `build:staging` / `deploy:staging`；本机使用 `mode:staging`，不要混用。
