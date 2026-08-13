# Noumi Official Website

Noumi 官方网站与内容管理项目，基于 Next.js 15、React 19、Payload CMS 3、Cloudflare Workers、D1 和 R2 构建。仓库同时承载公开官网、Payload 管理后台、草稿预览、媒体存储、内容快照、SEO/埋点以及 Invite 申请数据管理。

> 完整的代码、CMS、Cloudflare、部署、回滚与离项交接说明见 [docs/HANDOVER.md](docs/HANDOVER.md)。在执行生产迁移或部署前，必须先阅读该文档。

## 项目现状

- 正式域名以 `https://noumi.ai` 为 canonical，产品登录/注册入口为 `https://www.noumi.ai/auth`。
- Payload Admin 位于 `/admin`，Payload REST/GraphQL 位于 `/api`。
- D1 保存 Payload 数据；同一个 R2 bucket 保存 Payload 媒体、CMS JSON 快照、页面 HTML 快照和 OpenNext 增量缓存。
- 前台 layout 保持动态渲染，公开流量由 Worker 层的 R2 HTML 快照提供伪静态加速。
- Invite 已经是正式 Payload collection；当前公开 `/invite` 和 Try Free 按钮跳转产品站，公开 waitlist 提交暂时关闭，服务端同步接口仍保留。
- 仓库当前只有 Cloudflare 顶层环境，没有可用的 `production` 或 `staging` 命名环境。

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
| Script runner   | pnpm 9/10；部分脚本会在内部继续调用 pnpm         |

## 快速开始

要求：Node.js `^18.20.2 || >=20.9.0`，建议使用当前 LTS；同时安装 Bun 和 pnpm 9/10。

```bash
cp .env.example .env
bun install --frozen-lockfile
pnpm run payload migrate
pnpm run dev
```

打开：

- 官网：`http://localhost:3000`
- Payload Admin：`http://localhost:3000/admin`

说明：

- `bun.lock` 是仓库唯一锁文件，因此依赖安装以 Bun 为可复现基线。
- `package.json` 的部署、类型生成和测试聚合脚本会调用 pnpm，不能只安装 Bun。
- Payload adapter 配置为 `push: false`，全新本地 D1 需要先执行 migration。
- 本地 autosave 和 live preview 默认关闭，以降低 Miniflare/D1 锁竞争；按需在 `.env` 中开启。
- `pnpm run preview` 可能连接远程 D1，不应作为无风险的本地预览命令使用。

## 常用命令

```bash
pnpm run dev                 # 本地 Next.js 开发
pnpm run devsafe             # 删除 .next/.open-next 后启动开发
pnpm run build               # Next.js 构建
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
- [工程实现约束](AGENTS.md)
- [环境变量模板](.env.example)

## 安全原则

- 不在 Git、README、issue 或聊天记录中保存真实 secret。
- 未备份和确认兼容性前，不执行远程 migration。
- 不把来源不可信的 HTML 粘贴到 HTML 模式；该模式可执行内联脚本并影响全局 CSS。
- 不清空 `official-website-bucket`；其中同时存在媒体和多类缓存/快照。
- 不把 Worker 回滚等同于数据回滚；D1 与 R2 必须单独处理。
