# 官网测试环境

正式站保持 `https://noumi.ai`；云端测试站为 `https://preview.staging.noumi.ai`，后台为 `/admin`。

| 环境     | Worker / D1                           | R2                              | 数据位置                   |
| -------- | ------------------------------------- | ------------------------------- | -------------------------- |
| 本地     | noumi-official-website-local          | official-website-local-bucket   | `.wrangler/state` 本地模拟 |
| 云端测试 | 原官网 Worker 的 Preview / staging D1 | official-website-staging-bucket | Cloudflare 独立测试资源    |
| 生产     | noumi-official-website                | official-website-bucket         | 原有生产资源               |

本地 Next.js 与 OpenNext 预览使用相同的 `env.local` 和持久化目录。`NODE_ENV=production` 表示打包运行，不代表连接生产数据库。测试入口显式选择环境、覆盖测试配置与密钥，禁用正式统计和产品 API。站点外部产品登录链接仍指向产品站，不代表产品后端也已部署测试环境。

分支协作、提交前检查及跨机器发布前置条件见 [staging 开发流程](STAGING-WORKFLOW.md)。Git 分支和 Cloudflare 环境是两个独立概念。

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

## 云端预览

云端测试改为原 Worker `noumi-official-website` 下的 Preview；旧独立 staging Worker 已删除。GitHub 合入 staging 后由 Cloudflare Builds 发布，开发者无需登录 Wrangler。固定地址为 https://preview.staging.noumi.ai，后台追加 `/admin`。

配置命令、测试资源和首次验收见 [自动预览指南](CLOUDFLARE-BUILDS.md)。`bun run mode:staging status` 可只读检查健康状态。不要运行旧独立 Worker 发布流程。

## 账号与数据

本地账号在 `.local/infra/local.admin.json`，本地密钥由 mode 命令维护。云端账号由维护者分配；测试应用密钥保存在 Preview Base，首次由维护者设置，开发者不需复制 `.local`。

本地与云端不自动同步数据。所有云端分支 Preview 共用 staging CMS 数据和媒体，各分支缓存前缀独立。Preview 不运行 Cron，因此关闭官网整页快照，正式站不变。测试站禁止收录但仍可公开访问。
