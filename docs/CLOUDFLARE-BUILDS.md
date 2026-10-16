# Cloudflare Builds：staging 自动部署

由维护者在 `noumi-official-website-staging` 的 Settings → Builds 连接 GitHub；同事及 Agent 此后只需将已验证代码推送到 staging，不需要登录 Wrangler 或持有应用密钥。

## 页面填写

| 设置         | 值                                      |
| ------------ | --------------------------------------- |
| GitHub 仓库  | `langcore-ai/noumi-official-website`    |
| 生产分支     | `staging`（指此测试 Worker 的发布分支） |
| 构建命令     | `bun run build:staging`                 |
| 部署命令     | `bun run deploy:staging`                |
| 启用预览构建 | 取消勾选                                |
| 根目录       | 仓库根目录                              |

平台会安装依赖，项目使用 bun.lock。构建入口强制选择 `env.staging` 并拒绝其他分支。不要在正式 Worker 上配置这两条命令。

Cloudflare Builds 默认生成部署 API token。迁移及快照标记还需要该平台凭据有目标账户 D1 写入、R2 对象写入权限；如果默认 token 权限不足，首次接入由维护者在 Builds 的 API token 设置中配置具备这些权限的凭据。无需把 token 分发给开发者，也不要将其提交到仓库。平台接入授权不等于所有资源权限必然齐全。

## 运行流程

1. `build:staging`：类型检查、集成测试、OpenNext 构建、Wrangler dry run，记录当前构建提交。
2. `deploy:staging`：检查构建提交一致，输出远程 D1 Time Travel 恢复书签，运行 Payload migrations，部署 Worker，写入 R2 快照脏标记，核对健康及版本。
3. 现有 Cron 每五分钟检查并刷新快照。部署检查通过后，页面快照更新可能仍需等待一轮 Cron；使用后台快照状态确认刷新完成。

云端入口不会读取或生成 `.local/infra/staging.secrets.json`，也不上传或覆盖 Worker 的应用密钥。迁移进程使用临时随机 Payload secret，仅实例化迁移运行时，不用于创建用户、认证或部署。测试站必须已经有管理员，首次初始化仍由维护者执行本地管理流程。

Time Travel 恢复历史保存在 D1，恢复书签写入构建日志；它不是永久 SQL 导出备份，受账户 D1 恢复保留期限制。长期归档备份需另行安排。迁移成功后若部署失败，不会自动回滚数据库；须按迁移兼容性处理，不要直接执行恢复命令。

## 首次验收

- 在 Cloudflare 完成 GitHub App 授权与连接后，检查第一轮构建日志是否完成两条命令。
- 确认 `/api/site/health` 返回 `environment: staging`、`healthy: true`，revision 等于 staging 提交前七位。
- 打开 `/admin`，验证新增配置入口，等待快照更新后检查官网。
- 如果出现权限不足，不要绕过迁移或改为顶层 `wrangler deploy`；由维护者检查 Builds 平台凭据权限。
- 共享 staging 不允许两次发布同时执行。首次接入检查平台队列，发布期间不要同时执行本机手动部署；脚本本身没有跨机器部署锁。

当前仓库提供构建入口；GitHub 连接、分支设置及首次自动构建成功与否，以 Cloudflare 控制台为准。仓库命令测试通过不等于平台连接已完成。

参考：[Workers Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)。
