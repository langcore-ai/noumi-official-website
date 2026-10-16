# staging 开发与发布流程

本仓库负责 Noumi 官网及 Payload CMS。开始任务先读根目录 `AGENTS.md`、`README-AI.md` 和本文；环境详情见 [测试环境指南](TEST-ENVIRONMENTS.md)，生产操作见 [交接文档](HANDOVER.md)。

## 分支与环境

- `agent/<task>`：从最新 staging 创建的功能分支，用于单项开发。
- `staging`：集成并验证团队修改，发布到 `https://preview.staging.noumi.ai`。
- `main`：接收已验收版本；合并或推送本身不代表已发布生产。
- Git 分支与 Cloudflare 环境独立：切到 staging 不会自动切换数据库。使用 `mode:` 命令显式选择本地或测试资源。
- 已提供 Cloudflare Builds 自动部署入口，连接方法见 [Cloudflare Builds](CLOUDFLARE-BUILDS.md)。平台连接生效后，推送 staging 将触发部署；在控制台确认构建结果，不要把推送成功等同于发布成功。

远端 main 和 staging 已建立。新成员从 origin/staging 开始；若无法获取该分支，检查 GitHub 仓库权限。

## 开始开发

检查工作区后再切分支；不要丢弃或混入其他任务的改动。

```bash
git status --short
git fetch origin
git switch staging
git pull --ff-only origin staging
git switch -c agent/my-task
bun install --frozen-lockfile
bun run mode:setup
bun run mode:start
bun run mode:status
```

首次克隆且没有本地 staging 时，使用 `git switch --track origin/staging`。本地 `mode:setup` 初始化独立模拟 D1 和管理员，不复制正式数据。账号位置见测试环境指南；不得将凭据加入提交。

`mode:start` 构建后运行，非热加载。每次修改后执行 `bun run mode:reload`；通过 `mode:status` 获取实际本机和局域网地址。不要直接运行生产迁移或绕过脚本启动远程 binding proxy。

## 验证与提交

- Schema 变更：编写并检查 Payload migration，更新 `src/migrations/index.ts`，运行 `bun run generate:types`；已有数据要有兼容迁移。
- Admin 组件变更：运行 `bun run generate:importmap`。
- 业务变更：至少类型检查和相关测试，并验证实际页面或 API。完整本地门禁可用 `bun run mode:local rebuild`；Worker/binding 变更额外用 `bun run mode:preview up` 验证。
- 文档变更：检查链接、命令与实际实现，运行 Prettier 和 `git diff --check`。
- SEO、菜单与重定向：同时验证草稿和已发布行为；菜单需启用且发布才替换默认内容。测试数据应清理，版本历史可保留。

```bash
bunx tsc --noEmit
bun run test:int
git diff --check
git diff --stat
```

检查提交内容后提交功能分支，通过团队代码审查合入 staging，再从最新 staging 发布。不要用强推覆盖同事历史。发布测试站前协调其他使用者，共享 staging 只有一套内容与运行版本；本机锁不能防止两台机器同时发布。

## 云端预览发布

开发者将验证后的代码合入 staging，Cloudflare Builds 自动运行 `build:worker-preview` 和 `deploy:worker-preview`。不需要登录 Wrangler 或持有部署密钥。固定验收地址为 https://preview.staging.noumi.ai。

其他功能分支也可产生独立 Preview 地址，名称见构建日志。所有分支共用 staging 数据库；只有 staging 发布应用迁移，其他分支存在新迁移时须先合入 staging。命名、资源和控制台设置详见 [自动预览指南](CLOUDFLARE-BUILDS.md)。

维护者手动排查可使用同样两条命令，但需要平台权限，且不要与自动发布并行。旧 `mode:staging deploy` 已禁用，不会重新创建已删除的独立 Worker。

## 验收

- 检查 `/api/site/health` 的 environment 为 staging、healthy 为 true，revision 匹配提交前七位。
- 检查官网、后台及本次修改功能；发布后通过 Preview 直接读取测试内容，无需等待旧 Cron 快照。
- 查看原官网 Worker 下对应 Preview 的部署日志。没有平台权限时请维护者提供日志。
- 自动构建失败不能视为发布成功。不要因预览失败而调用生产 `deploy:*` 或 `release`。
