# Noumi 官网：开发与预览上手指南

这份文档面向需要修改官网的同事。按照下面的步骤，可以把项目拉到电脑上、修改页面、在本地查看效果，再交给大家在云端测试站验收。

日常开发不需要登录 Cloudflare，也不需要找别人索要部署 Token。本地后台账号由初始化命令生成；云端后台账号由维护者分配。

你只需完成“拉取代码 → 本地修改与验证 → 推送功能分支 → PR 合入 staging”。云端构建由 Cloudflare 执行。

**当前验收状态（2026-10-16）：** 固定预览站已发布，官网、后台登录、媒体上传和文章发布已实测通过。GitHub 推送自动发布仍需维护者确认控制台命令并验证首次自动构建；手动发布成功不等于自动发布已接通。

## 1. 准备工具与权限

需要安装 Git、Node.js 和 Bun，并拥有 GitHub 仓库 `langcore-ai/noumi-official-website` 的读取权限。提交代码还需要对应写入权限，或通过团队允许的 Pull Request 流程提交。

**不需要另外安装全局 Wrangler，也不需要执行 `wrangler login`。** 安装项目依赖时会自动安装项目使用的 Wrangler，本地模拟由 `mode:` 命令调用。GitHub 登录用于拉取和推送代码，与 Cloudflare 登录无关。

当前依赖声明要求 Bun 至少 1.3.0，Node.js 为 `^18.20.2` 或 `>=20.9.0`。团队可统一使用 Node.js 22。在终端确认工具已安装：

```bash
git --version
node --version
bun --version
```

**运行环境：当前 `mode:` 进程管理依赖 Linux 的 `/proc`。** Linux 可以直接使用；Windows 请在 WSL2 的 Linux 终端中操作，建议将仓库放在 Linux 用户目录，例如 `~/projects`。macOS 原生尚未适配这套进程管理，请使用团队 Linux 开发环境。下面的命令均在 Linux/WSL 终端执行。

## 2. 第一次拉取仓库

进入你想存放项目的目录，执行：

```bash
git clone --branch staging https://github.com/langcore-ai/noumi-official-website.git
cd noumi-official-website
bun install --frozen-lockfile
```

如果 GitHub 要求登录，使用自己的 GitHub 身份完成认证；仓库不存在或没有权限时，联系仓库维护者开通权限。

开始一项修改前，创建自己的功能分支。下面的 `my-task` 换成任务名称，例如 `update-pricing-copy`：

```bash
git switch -c agent/my-task
```

如果已经有仓库，先保存或提交自己的修改，再更新 staging：

```bash
git status --short
git fetch origin
git switch staging
git pull --ff-only origin staging
bun install --frozen-lockfile
git switch -c agent/my-task
```

如果还没有本地 staging 分支，用 `git switch --track origin/staging` 代替 `git switch staging`。已有同名功能分支时用 `git switch agent/my-task` 切换，不要重复创建。遇到冲突或无法快进时先处理分支差异，不要使用强制覆盖命令。

## 3. 初始化并打开本地官网

在项目根目录执行：

```bash
bun run mode:setup
bun run mode:start
bun run mode:status
```

- `mode:setup`：创建或迁移本地数据库，初始化本地后台管理员。重复执行会保留已有账号。
- `mode:start`：构建网页并启动本地服务，第一次运行需要等待构建完成。
- `mode:status`：查看当前模式、运行状态、本机地址和局域网地址。

默认官网地址是 `http://localhost:3000`，后台是 `http://localhost:3000/admin`。端口被占用时会尝试后续端口，**实际地址以 `mode:status` 为准**，不要只打开 IP 而省略端口。

在编辑器中打开本地文件 `.local/infra/local.admin.json`，使用其中的 `email` 和 `password` 登录本地后台。该文件不进入 Git；不要把密码放入截图或提交记录。忘记账号时重新查看文件，删除文件不会重置数据库里的账号。

本地数据库与云端分开：你在本地上传的图片、创建的文章、修改的菜单不会自动同步到测试站。

## 4. 日常修改与本地查看

用编辑器或 Agent 打开项目目录，修改代码后执行：

```bash
bun run mode:reload
```

等待重建成功，再刷新浏览器。**当前推荐流程不是热更新：只保存代码不会自动更新运行中的页面。** 已运行时再次执行 `mode:start` 也不会代替重建。

可以这样给 Agent 下任务：

> 先阅读 AGENTS.md 和项目开发指南，从当前功能分支修改价格页文案。完成后执行相关检查，用 mode:reload 重建，并告诉我本地预览地址。

常用命令：

| 需求                 | 命令                  |
| -------------------- | --------------------- |
| 查看地址、模式和状态 | `bun run mode:status` |
| 检查服务是否健康     | `bun run mode:health` |
| 查看运行日志         | `bun run mode:logs`   |
| 修改后重建重启       | `bun run mode:reload` |
| 停止本地服务         | `bun run mode:stop`   |
| 查看命令帮助         | `bun run mode:help`   |

同一局域网的同事可以尝试访问 status 显示的局域网地址。使用 WSL、虚拟机或远程开发机时，还可能需要宿主机端口转发及防火墙放行；Linux 环境显示的地址不保证其他电脑一定可达。需要稳定共享时使用下文的云端测试站。

## 5. 本地 Cloudflare 预览

普通页面修改可以先用上面的本地模式。如果改动涉及 Cloudflare Worker、路由、媒体存储或缓存，再使用更接近云端运行方式的预览：

```bash
bun run mode:preview up
bun run mode:status
```

默认端口为 `8787`，例如 `http://localhost:8787`；后台仍是在地址末尾加 `/admin`。以实际输出为准。

这个命令会构建 OpenNext 产物，在本机模拟 Cloudflare 运行环境，**不会发布到互联网，也不需要 Wrangler 登录**。它与普通本地模式共用本地数据库、媒体和管理员账号。

两种本地模式会自动切换，不会在同一目录同时运行。修改后仍使用 `bun run mode:reload`；要切回普通本地模式，执行 `bun run mode:start`。

## 6. 提交修改，准备云端验收

在提交前执行完整本地检查：

```bash
bun run mode:local rebuild
git diff --check
git status --short
```

检查失败时先解决错误。数据库字段变更还需要迁移文件与类型生成，Admin 组件变更需要生成 import map，详见 [开发流程](STAGING-WORKFLOW.md)。

用编辑器的 Git 界面选择本次修改的文件并暂存，确认没有密码、`.env`、`.local` 或无关文件，然后提交并推送功能分支：

```bash
git commit -m "Update pricing page copy"
git push -u origin HEAD
```

提交说明换成实际改动内容。在 GitHub 创建 Pull Request，**目标分支选择 `staging`**，附上改动说明、本地验证结果和必要截图。经团队审查后合入 staging。

维护者配置并验证自动构建后：

| 你做的操作                  | 云端结果                                |
| --------------------------- | --------------------------------------- |
| 推送自己的功能分支          | 更新该分支的独立预览，不更新固定测试站  |
| PR 合入 staging             | 更新 `https://preview.staging.noumi.ai` |
| 只在本地修改代码或 CMS 内容 | 不更新云端                              |

功能分支地址为 `https://branch-<分支简写>-<哈希>.staging.noumi.ai`，准确地址见构建输出；没有查看权限时请维护者提供。所有云端预览共用测试数据库和媒体，避免修改其他人的测试内容。若改动新增数据库迁移，功能分支预览会等待迁移先在 staging 应用，请通过 PR 与维护者协调。

## 7. 打开云端测试站

- 官网：[https://preview.staging.noumi.ai](https://preview.staging.noumi.ai)
- 后台：[https://preview.staging.noumi.ai/admin](https://preview.staging.noumi.ai/admin)
- 健康与版本：[https://preview.staging.noumi.ai/api/site/health](https://preview.staging.noumi.ai/api/site/health)

**请使用完整地址 `preview.staging.noumi.ai`。** `staging.noumi.ai` 只是预览基础域名，直接打开它目前可能进入正式站。

**自动部署的前提：维护者已在 Cloudflare 完成 GitHub 连接，并验证首次构建成功。** 仓库已提供构建命令，但不能仅凭文档判断平台连接已启用。连接配置见 [Cloudflare Builds 指南](CLOUDFLARE-BUILDS.md)。

启用后，流程是：

1. 代码合入 staging。
2. Cloudflare 自动检查、构建、迁移测试数据库并部署。
3. 等待构建成功，再打开测试站验收。
4. 打开健康接口，确认 `healthy` 为 `true`、`environment` 为 `staging`，`revision` 与合入后 staging 提交前七位一致。

没有 Cloudflare 控制台权限的同事可通过健康接口核对线上版本；构建进度和失败日志由有权限的维护者查看。GitHub 若显示构建检查，也可从对应提交查看结果。**推送或合并成功不等于部署成功。**

预览环境直接读取测试 CMS，不需要等待 Cron 快照刷新。页面仍旧时，先核对预览地址与健康接口 revision，再请维护者检查构建和发布日志。

云端后台账号需要维护者提供，不能使用本地初始化生成的账号。云端测试站由大家共用，测试时不要删除其他人的文章、图片或配置。测试站不等于正式站，正式网址 `https://noumi.ai` 不在本文的发布范围内。

## 8. 常见问题

| 现象                         | 处理方式                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------- |
| 拉取仓库提示没有权限         | 确认 GitHub 登录身份，联系维护者开通仓库权限                                      |
| 启动后打不开网页             | 等待构建完成，执行 `mode:status` 和 `mode:logs`，使用实际端口                     |
| 改完代码页面没变             | 执行 `mode:reload`，等待成功后刷新浏览器                                          |
| 切换分支后依赖或数据库报错   | 停止服务，重新安装锁定依赖，运行 `mode:setup` 后启动                              |
| 本地后台没有云端内容         | 正常，本地和云端数据独立，不自动同步                                              |
| 后台菜单或 SEO 保存后未生效  | 检查是否已发布；菜单还需勾选启用，再核对预览地址和实际页面；云端 Preview 不用快照 |
| 已合入 staging，云端还是旧版 | 核对健康接口 revision，请维护者查看构建结果                                       |
| 自动构建出现权限错误         | 交给维护者处理平台部署权限，不要改用生产部署命令                                  |

如果需要让 Agent 帮你提交并发布预览，可以这样说：

> 阅读 AGENTS.md 和 docs/STAGING-WORKFLOW.md，完成本次修改并验证，提交和推送当前功能分支。通过 Cloudflare Builds 更新该分支预览，核对线上 revision；如果无法确认部署，请明确说明。不要合并 staging，不要在本机登录 Wrangler。

维护者只需一次性配置 GitHub 连接、预览构建命令和有效的平台权限，详见 [Cloudflare Builds 指南](CLOUDFLARE-BUILDS.md)。普通开发者不需要复制维护者的密钥文件，也不需要在本机运行 `build:worker-preview` / `deploy:worker-preview`。

日常开发使用 `mode:`；同事不需要在本机执行 `deploy`、`deploy:database` 或 `release`。这些涉及生产或运维，避免为解决预览问题而运行。
