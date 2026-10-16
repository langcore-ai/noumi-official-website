# Cloudflare Builds：原 Worker 下的分支预览

日常开发者和 Agent 只需 GitHub 权限。Cloudflare 平台执行构建和发布，不需要开发者登录 Wrangler，也不需要分发测试密钥。

## 控制台设置

在原官网 Worker **`noumi-official-website`** 连接 `langcore-ai/noumi-official-website` 仓库，正式分支保留 `main`。在 **预览构建** 页填写：

| 设置         | 值                              |
| ------------ | ------------------------------- |
| 预览分支构建 | 开启                            |
| 构建命令     | `bun run build:worker-preview`  |
| 预览命令     | `bun run deploy:worker-preview` |
| 根目录       | `/`（仓库根目录）               |

这里只修改预览构建页，不覆盖正式构建命令。当前 Wrangler 已升级到 4.151.0；代码调用 `wrangler preview`，不是 `versions upload`，也不是部署独立 Worker。

平台的 API 令牌必须有效，并有 Worker Preview、D1 和 R2 所需权限。若显示“已配置的 API 令牌不可用”，由维护者重新选择或创建。开发者无需接触它。当前本机 OAuth 能操作 Preview，但读取 Builds 触发器可能返回 403，因此控制台保存和首次 Git 自动构建需在平台核实。

## 地址与分支

Worker 的预览基础域名为 **`staging.noumi.ai`**，仅用于预览；生产 `noumi.ai` 不开启预览。不要删除现有 `*.noumi.ai` DNS。

- `staging` 分支固定创建名为 `preview` 的 Preview，地址为 **https://preview.staging.noumi.ai**。
- 其他非 main 分支使用 `branch-<分支简写>-<哈希>`，地址为 `https://<名称>.staging.noumi.ai`，具体看构建输出。
- `main` 被这两个命令拒绝；其他分支即使叫 `preview` 也不会覆盖 staging 固定地址。

自定义域名需要 `*.staging.noumi.ai` 的 DNS 和证书覆盖。多级域名可能需要额外证书能力，以控制台证书状态为准。新增域名不等于已有 Preview 或可访问应用。

## 数据、密钥与缓存

`wrangler.jsonc` 的 `previews` 声明测试 D1、R2 和变量。发布脚本在 `.local/infra/worker-preview.json` 生成测试专用构建配置：顶层和 Preview 绑定均只能是测试资源，避免构建阶段读取正式资源。生成配置不会改写生产 Worker 或域名。

- D1：`noumi-official-website-staging`。
- R2：`official-website-staging-bucket`，各分支使用独立 Next 缓存前缀。
- 所有预览共用测试 CMS 内容和媒体；分支地址不同不代表数据库不同。
- 只有 staging 发布可应用迁移。其他分支如含未应用迁移会报错，先合入 staging 应用迁移，再重试分支预览。采用兼容迁移，避免影响其他分支。
- 已有测试密钥一次性写入原 Worker 的 **Previews Base**，新 Preview 继承。命令不读取个人 staging 密钥文件、不生成或上传密钥；正式密钥不受影响。
- 后续修改 Base 密钥不会自动更新已存在 Preview，维护者需针对已有 Preview 更新。

**Worker Previews 不执行 Cron。** 预览配置开启 `NOUMI_DISABLE_SNAPSHOTS=true`，直接读取测试 CMS，不读写官网 JSON/HTML 快照。正式站继续使用原快照机制。OpenNext 缓存单独按分支管理。

## 发布与验收

1. 推送功能分支或合入 staging，Cloudflare 执行类型检查、集成测试、OpenNext 构建和打包预检。
2. 发布前核对提交与构建配置，记录 D1 Time Travel 恢复书签，应用或检查迁移。
3. 填充该分支的 Next 缓存，运行 `wrangler preview`，保留预览环境已配置密钥。
4. 请求对应域名的 `/api/site/health`，验证 `healthy: true`、`environment: staging` 和发布提交前七位。
5. 验证官网、后台登录、媒体上传和修改的功能。

Time Travel 受 D1 恢复保留期限制，不是永久导出备份。迁移先于应用发布，失败不会自动回滚；日志中的恢复书签供维护者判断使用。

如果构建成功但健康检查失败，检查 Preview URL、证书、密钥和资源绑定；不要改成顶层 `wrangler deploy`。共享数据库不支持并发发布协调锁，维护者应避免 staging 多次发布与手动迁移重叠。

维护者也可在有 Cloudflare 权限的机器执行相同两条命令排查；普通开发者无需执行。旧独立 staging Worker 已删除，旧 `mode:staging deploy` 已禁用；`mode:staging status` 只读检查新预览地址。`build:staging` / `deploy:staging` 是新 Preview 命令别名。

参考：[Preview 配置](https://developers.cloudflare.com/workers/previews/configuration/)、[Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[Preview 域名](https://developers.cloudflare.com/workers/previews/custom-domains/)。
