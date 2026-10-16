# staging 开发与发布流程

本仓库负责 Noumi 官网及 Payload CMS。开始任务先读根目录 `AGENTS.md`、`README-AI.md` 和本文；环境详情见 [测试环境指南](TEST-ENVIRONMENTS.md)，生产操作见 [交接文档](HANDOVER.md)。

## 分支与环境

- `agent/<task>`：从最新 staging 创建的功能分支，用于单项开发。
- `staging`：集成并验证团队修改，发布到 `https://staging.noumi.ai`。
- `main`：接收已验收版本；合并或推送本身不代表已发布生产。
- Git 分支与 Cloudflare 环境独立：切到 staging 不会自动切换数据库。使用 `mode:` 命令显式选择本地或测试资源。
- 仓库未配置 Git push 自动部署。当前发布通过本机命令执行；不要将提交、推送和云端部署混为一谈。

截至本文建立时，main 与 staging 已在本机同步，远端 staging 尚未建立。首次共享需由维护者推送 staging（`git push -u origin staging`）；新成员只有在远端分支存在后才能按下面流程开始。若 fetch 后找不到 `origin/staging`，联系维护者，不要擅自用旧 main 代替。

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

## 发布 staging

前置条件：任务范围包含测试站发布；Cloudflare 账号拥有目标 Worker、D1、R2 及密钥操作权限；现有 staging 密钥已安全交接到本机 `.local/infra/staging.secrets.json`。可通过 `bunx wrangler login` 登录及 `bunx wrangler whoami` 检查身份。不要将登录令牌或密钥贴进日志、文档或聊天。

**已有测试站而本机没有密钥文件时，先向维护者获取现有文件。** 当前脚本会自动生成缺失文件，并在真实发布时上传覆盖远程密钥；dry run 也会在本机创建缺失文件。不要把新生成的文件当作共享测试站的正确密钥。CMS 验收需要现有管理员账号；删除本地管理员文件不会重置云端账号。

```bash
git switch staging
git pull --ff-only origin staging
git status --short
git rev-parse HEAD
git rev-parse origin/staging
```

确认工作区无输出且两个提交相同后执行：

```bash
bun run mode:stop
bun run mode:staging deploy --dry-run
bun run mode:staging deploy
bun run mode:staging status
```

当前脚本不会自动拒绝错误分支、脏工作区或未推送提交，以上检查由操作者执行。发布版本标记来自 HEAD，未提交代码会使版本标记无法代表真实产物。停止本地模式是为了避免 staging 构建覆盖共享产物目录。

目标由 `wrangler.jsonc` 的 `env.staging` 指定：

| 资源             | 目标                              |
| ---------------- | --------------------------------- |
| Worker / D1 名称 | `noumi-official-website-staging`  |
| R2               | `official-website-staging-bucket` |
| 网站             | `https://staging.noumi.ai`        |
| 后台             | `https://staging.noumi.ai/admin`  |

`tooling/infra/staging.ts` 校验目标，执行类型检查、集成测试、OpenNext 构建、Wrangler dry run，随后导出测试库、执行迁移与初始化、上传密钥、部署 Worker、刷新快照并核对健康与版本。dry run 在远程备份和写入步骤之前结束，但仍会构建并修改本地产物。

`release`、`deploy`、`deploy:database`、`deploy:app` 为生产流程入口，不能拿来替代 staging 发布命令。

## 验收与故障处理

- `/api/site/health` 应返回 `healthy: true`、`environment: staging`，revision 与发布提交前七位一致。
- 检查官网、`/admin`、本次修改页面；测试站应带 noindex，robots 禁止抓取。
- `bun run mode:staging logs` 查看实时日志。
- 需要真实 CMS 写入验收时运行 `bunx tsx tooling/infra/smoke.ts staging`；它读取本机测试管理员文件并创建、清理测试数据，需要 Chromium。
- 发布报告位于 `.local/infra/staging-release.json`，D1 备份位于 `.local/infra/staging-before-*.sql`；这些文件不进入 Git。
- 发布不是原子的：数据库迁移先于 Worker 发布。失败后先确认哪个步骤完成，不要直接回退数据库、执行 reset/fresh 或清空 R2。Worker 回滚不会回滚 D1/R2，须依据备份和迁移兼容性制定恢复方案。
