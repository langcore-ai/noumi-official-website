# 官网测试环境

正式站保持 `https://noumi.ai`；云端测试站为 `https://staging.noumi.ai`，后台为 `/admin`。

| 环境 | Worker / D1 | R2 | 数据位置 |
| --- | --- | --- | --- |
| 本地 | noumi-official-website-local | official-website-local-bucket | `.wrangler/state` 本地模拟 |
| 云端测试 | noumi-official-website-staging | official-website-staging-bucket | Cloudflare 独立测试资源 |
| 生产 | noumi-official-website | official-website-bucket | 原有生产资源 |

本地 Next.js 与 OpenNext 预览使用相同的 `env.local` 和持久化目录。`NODE_ENV=production` 表示打包运行，不代表连接生产数据库。测试入口显式选择环境、覆盖测试配置与密钥，禁用正式统计和产品 API。站点外部产品登录链接仍指向产品站，不代表产品后端也已部署测试环境。

## 本地运行

```bash
bun run mode:setup             # 首次安装迁移及管理员；重复执行不会覆盖账号
bun run mode:start             # 打包运行，默认 3000，被占用则递增
bun run mode:status            # 本机/局域网地址、实例、构建版本及健康状态
bun run mode:health            # 就绪返回 0，否则非零
bun run mode:logs
bun run mode:reload            # 重建并重启当前模式
bun run mode:stop
bun run mode:preview up        # OpenNext / workerd 本地模拟，默认 8787
bun run mode:help
```

`mode:local up` 等原有入口继续可用。服务监听 `0.0.0.0`，支持可信局域网验收；修改代码后运行 `mode:reload`。构建、初始化和 staging 发布有共享锁；发布 staging 前先停止本地实例，避免覆盖共享构建目录。进程管理使用 Linux `/proc` 验证项目目录和进程启动标识，不会仅根据端口或 PID 停止其他项目。

## 云端测试发布

```bash
bun run mode:stop
bun run mode:staging deploy --dry-run  # 检查、构建和打包，不迁移/发布远程资源
bun run mode:staging deploy
bun run mode:staging status
bun run mode:staging logs
```

发布入口会验证目标 Worker、D1、R2、域名和统计配置；运行类型检查、集成测试和完整 OpenNext 构建；通过 Wrangler dry run 后备份 staging D1，再通过 D1 HTTPS 接口执行原有 Payload 迁移及管理员初始化、上传独立密钥、部署、刷新快照和探测站点。备份位于 `.local/infra/staging-before-*.sql`。应用发布失败不会自动回滚数据库，应使用兼容迁移并按需恢复测试库。

本轮采用手动命令发布，没有绑定 Git 推送自动部署。不要用原始 `deploy` / `deploy:database` 发布测试环境，它们属于既有生产流程。

## 账号与数据

- 独立生成的密钥保存在 `.local/infra/local.secrets.json` 和 `staging.secrets.json`。
- `mode:` 本地启动会将本地专用密钥写入已忽略的 `.dev.vars.local`，供 workerd 使用，不依赖正式 `.env`。
- 首个测试管理员的邮箱和随机密码保存在 `.local/infra/local.admin.json` 和 `staging.admin.json`。
- 上述文件权限为 `0600`，整个 `.local` 被 Git 忽略；终端不打印密码。
- 首次部署前初始化管理员，避免公开空 CMS 的首用户注册入口。
- 测试库从迁移和站点基础设置初始化，没有复制正式账号、申请数据或正式 CMS 内容。前台使用仓库内的默认展示内容；测试文章和媒体可通过后台添加。
- 本地和 staging 不自动同步数据。删除凭据文件不会重置已有管理员；跨机器部署需要安全迁移 staging 密钥文件，避免重新生成后覆盖云端密钥。

测试站响应包含 `X-Robots-Tag: noindex, nofollow`，robots 禁止抓取。它是可公开访问的测试站，noindex 不等于访问控制；CMS 写入仍需要登录。健康端点 `/api/site/health` 只执行 D1/R2 只读探测，不返回凭据或业务数据。

浏览器及写入验收可运行 `bunx tsx tooling/infra/smoke.ts local` 或 `staging`（也支持 `preview`），读取对应本地凭据文件，验证 CMS 登录、媒体上传、文章发布并清理自己创建的数据；截图保存在 `.local/infra`。需要 Chromium，默认 `/usr/bin/chromium`。
