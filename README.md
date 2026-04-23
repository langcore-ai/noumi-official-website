# Noumi Official Website

Noumi Official Website 是基于 Next.js、Payload CMS 3、Cloudflare Workers、D1 和 R2 构建的官网项目。项目同时包含公开官网前台、Payload 内容管理后台、内容预览、媒体上传、基础 SEO、invite 申请收集，以及 Cloudflare 部署配置。

本仓库不是纯 Payload 模板项目。当前代码已经承载 Noumi 官网的正式页面与内容模型，但部分前端页面来自早期紧急上线阶段的 HTML 页面迁移，因此前端结构会保留一些历史形态：页面实现偏静态、样式按页面拆分为专属 CSS Module，同时仍有少量全局共享样式，部分页面没有完全组件化。后续维护时应优先保证稳定上线和最小改动，不建议为了“整理结构”一次性大重构。

## 技术栈

- Next.js 15 App Router
- React 19
- Payload CMS 3
- Cloudflare Workers / OpenNext for Cloudflare
- Cloudflare D1 SQLite
- Cloudflare R2 Storage
- TypeScript
- bun
- Vitest
- Playwright

## 主要能力

- 官网前台页面渲染
- Payload CMS 后台内容管理
- Blog、Use Case、FAQ、法律页面和站点设置管理
- Payload draft / preview 流程
- R2 媒体存储
- D1 数据库存储和 migration
- invite 申请收集与后台只读查看
- 基础 metadata、Open Graph、结构化数据支持

## 代码结构

```text
src/
├── access/                  # Payload 访问控制与 CMS 角色判断
├── app/
│   ├── (frontend)/          # 官网前台路由、布局、前台全局样式
│   ├── (payload)/           # Payload admin、Payload API、GraphQL 路由
│   ├── api/                 # 独立于 Payload 的业务 API
│   ├── sitemap.ts           # sitemap 输出
│   └── my-route/            # Payload 模板遗留示例路由，后续确认无用后可删除
├── collections/             # Payload collections
├── components/              # 前台、后台与站点组件
├── fields/                  # Payload 复用字段配置
├── globals/                 # Payload globals
├── lib/
│   └── site/                # 官网数据读取、CMS 映射、SEO、i18n、预览、invite 工具
├── locales/                 # 前台静态字典
├── migrations/              # Payload / D1 migration
├── payload-types.ts         # Payload 生成类型
└── payload.config.ts        # Payload 主配置
```

根目录重要文件：

```text
package.json                 # 脚本、依赖和 Node/bun 版本约束
wrangler.jsonc               # Cloudflare Workers、D1、R2 绑定配置
open-next.config.ts          # OpenNext Cloudflare 配置
tsconfig.json                # TypeScript 配置
next.config.ts               # Next.js 与 Payload 打包配置
vitest.config.mts            # 集成测试配置
playwright.config.ts         # E2E 测试配置
AGENTS.md                    # 工程协作与实现约束
```

## 前台页面结构说明

前台页面主要位于 `src/app/(frontend)`。当前官网页面可以分为三类：

1. **静态营销页面**：例如首页、About、Pricing、Contact、Invite。这些页面大多由早期 HTML 页面迁移而来，内容仍以 React JSX 和页面专属 CSS Module 为主。
2. **CMS 驱动页面**：例如 Blog 详情、Use Case 详情、FAQ、Privacy、Terms。页面从 Payload 读取内容，再映射为前台 view model 渲染。
3. **HTML 模式页面**：Blog 和 Use Case 支持在 CMS 中切换为 HTML 模式，用于承接从旧静态 HTML 或外部 HTML 页面迁移过来的内容。

### 前端历史背景

前台页面最初为了紧急上线，曾从静态 HTML 派生并快速接入 Next.js。因此当前结构并不完全遵循理想化的组件拆分方式：

- 一些页面仍保留大段 JSX 内容。
- 大多数内页已经拆出页面专属 `*.module.css`，例如 `about.module.css`、`blog.module.css`、`pricing.module.css`、`invite.module.css`。
- `official-home.css` 仍承担首页和部分官网共享样式。
- 部分 class 命名沿用旧 HTML 页面，未完全按组件边界重命名。
- 部分视觉模块为了保持上线效果，优先复刻旧页面，而不是先抽象为通用组件。

### CSS 组织现状

前台样式主要来自：

- `src/app/(frontend)/official-base.css`：官网基础样式、CSS 变量和全局元素样式。
- `src/app/(frontend)/official-home.css`：首页和部分官网共享样式。
- 各前台路由目录下的 `*.module.css`：页面专属 CSS Module，例如 About、Blog、Pricing、FAQ、Invite、Use Case 等页面样式。
- `src/app/(frontend)/styles.css`：旧版前台样式，当前未作为主样式入口使用，后续可确认后清理。
- `public/assets/style.css`：静态 HTML 迁移遗留样式，主要作为历史资产存在，后续可确认后清理。

新增样式建议：

- 小范围页面改动优先沿用当前页面已有 CSS Module 或共享 class 写法。
- 新页面或较大改动应优先建立页面级 CSS Module，避免继续扩大 `official-home.css`。
- 不要在没有验证影响范围时重命名全局 class。
- 不要为了统一风格把多个页面的 CSS 一次性合并。

## CMS 管理范围

Payload CMS 负责管理以下内容。

### Collections

- `users`：后台用户和角色权限。
- `media`：图片和上传文件，实际文件存储在 R2。
- `blog-posts`：Blog 文章。
- `use-case-pages`：Use Case 页面。
- `faq-items`：FAQ 条目。

### Globals

- `site-settings`：站点名称、站点 URL、默认 SEO 描述、导航、页脚、默认分享图等。
- `privacy-page`：隐私政策页内容。
- `terms-page`：服务条款页内容。

### Blog 和 Use Case 渲染模式

`blog-posts` 和 `use-case-pages` 支持两种渲染模式：

- `template`：默认模板模式，使用结构化字段渲染页面。
- `html`：HTML 模式，直接粘贴 HTML 内容，并由前台在统一 navbar 和 footer 之间渲染。

HTML 模式主要用于承接旧 HTML 页面或外部 HTML 内容。它是迁移效率优先的方案，不是长期最理想的内容结构。因为 HTML 模式会注入原始 HTML，并可能执行内联脚本，所以维护时要谨慎控制编辑权限和内容来源。

### CMS 读取与映射

前台读取 CMS 的主要入口在 `src/lib/site/official-cms.ts`。该文件负责：

- 获取 Payload client。
- 判断是否处于 draft preview。
- 查询 Blog、Use Case、FAQ、法律页面。
- 将 Payload 文档映射为前台使用的 view model。
- 过滤空字段，避免前台渲染无效内容。

站点设置和旧 SEO 工具链相关读取位于 `src/lib/site/cms.ts` 和 `src/lib/site/seo.ts`。

## 不在 CMS 中管理的内容

以下内容当前不通过 Payload CMS 管理。

### 静态营销页面文案

首页、About、Pricing、Contact、Invite 等页面的大部分文案仍直接写在对应页面组件中，例如：

```text
src/app/(frontend)/page.tsx
src/app/(frontend)/about/page.tsx
src/app/(frontend)/pricing/page.tsx
src/app/(frontend)/contact/page.tsx
src/app/(frontend)/invite/page.tsx
```

这些页面来自早期 HTML 迁移阶段。除非有明确 CMS 化需求，否则应按普通前端页面维护。

### 页面专属 CSS

多个页面的 CSS 已拆为路由目录下的专属 CSS Module，并配合少量前台全局样式使用；这些样式不通过 CMS 管理。

### 静态图片和设计素材

`public/assets` 下的 logo、首页展示图、品牌图、OG 图片等是静态资源，不通过 Payload `media` collection 管理。

### Invite 申请数据

invite 申请是正式功能，但当前实现仍沿用早期命名：D1 表名和部分文件名中保留了 `temporary`。这属于历史命名，不代表功能仍是临时方案。invite 数据直接写入 D1 表 `temporary_invite_requests`，不通过 Payload collection 管理。相关代码位于：

```text
src/app/api/temporary-ui/invite-request/route.ts
src/app/(payload)/admin/invite/page.tsx
src/lib/site/temporary-invite-requests.ts
src/components/admin/InviteAdminNavLink.tsx
src/components/site/official/OfficialInviteRequestForm.tsx
```

### Cloudflare 绑定和部署配置

D1、R2、Workers、OpenNext 配置不在 CMS 中管理，位于根目录配置文件。

## 权限模型

CMS 角色定义在 `src/access/cms.ts`。

当前角色包括：

- `admin`
- `content-editor`
- `legal-editor`
- `translator`
- `viewer`

核心规则：

- `admin` 拥有后台管理能力。
- `content-editor` 主要负责营销内容新增、更新和删除。
- `translator` 可更新营销和法律内容，但不负责新增/删除营销内容。
- `legal-editor` 负责法律内容更新。
- `viewer` 默认为只读或低权限角色。

Payload Local API 默认可能绕过 access control。当前项目中，面向前台公开读取的查询应显式使用 `overrideAccess: false`，除非是经过 preview secret 控制的草稿预览流程。

## 本地开发

### 环境变量

本地至少需要：

```bash
PAYLOAD_SECRET=your-local-secret
```

可选环境变量：

```bash
CLOUDFLARE_ENV=production
PAYLOAD_PREVIEW_SECRET=your-preview-secret
PAYLOAD_LOG_LEVEL=info
PAYLOAD_ENABLE_DEV_AUTOSAVE=true
PAYLOAD_ENABLE_DEV_LIVE_PREVIEW=true
TEMPORARY_UI_ENABLED=true
```

说明：

- `PAYLOAD_SECRET` 是 Payload 初始化必需密钥。
- `PAYLOAD_PREVIEW_SECRET` 用于 draft preview，未配置时会回退到 `PAYLOAD_SECRET`。
- 本地默认关闭高频 autosave 和 live preview，以减少 D1 / Miniflare 锁竞争。
- `TEMPORARY_UI_ENABLED` 是早期命名遗留的开关，用于控制 invite UI 相关能力，具体生效点以代码为准。

### 启动开发服务器

```bash
bun dev
```

如果 `.next` 或 `.open-next` 缓存导致异常，可使用：

```bash
bun devsafe
```

`devsafe` 会删除构建缓存后重新启动。该命令包含删除本地缓存目录的操作，使用前确认没有需要保留的本地构建产物。

## 常用脚本

```bash
bun dev                     # 启动 Next.js 开发服务器
bun build                   # 构建 Next.js 应用
bun start                   # 启动 Next.js production server
bun payload                 # 运行 Payload CLI
bun generate:types          # 生成 Cloudflare 类型和 Payload 类型
bun generate:importmap      # 生成 Payload admin import map
bun test:int                # 运行 Vitest 集成测试
bun test:e2e                # 运行 Playwright E2E 测试
bun test                    # 依次运行集成测试和 E2E 测试
bun deploy                  # 执行数据库部署和应用部署
```

## Schema 和类型生成

修改以下内容后通常需要生成类型：

- `src/collections/*`
- `src/globals/*`
- `src/fields/*`
- `src/payload.config.ts` 中影响 schema 的配置

生成类型：

```bash
bun generate:types
```

如果新增或修改 Payload admin 自定义组件，还需要生成 import map：

```bash
bun generate:importmap
```

## 数据库和 Migration

数据库使用 Cloudflare D1，通过 Payload D1 adapter 接入。Payload 配置中 `push: false`，表示项目以 migration 为准，避免开发环境自动 push schema 和正式 migration 冲突。

重要原则：

- 不要擅自执行生产 migration。
- 修改 Payload schema 后，应创建并检查 migration。
- 变更已有字段时，需要考虑历史数据兼容和回填策略。
- D1 字段名、枚举名和 block 表结构要注意长度与兼容性限制。

创建 migration：

```bash
bun payload migrate:create
```

部署时会先执行：

```bash
bun run deploy:database
```

然后执行应用构建与部署：

```bash
bun run deploy:app
```

完整部署：

```bash
bun deploy
```

## Cloudflare 运维指南

### 绑定资源

Cloudflare 绑定配置在 `wrangler.jsonc`。

当前关键绑定：

- `D1`：Payload 数据库和 invite 申请表。
- `R2`：Payload media 文件存储。
- `ASSETS`：OpenNext 静态资源。

部署前需要确认：

- Cloudflare 账号已登录。
- D1 database id 正确。
- R2 bucket 名称正确。
- Workers 环境变量中存在生产 `PAYLOAD_SECRET`。
- 如使用 preview，确认 `PAYLOAD_PREVIEW_SECRET` 策略。

### 日志

生产环境 Payload 使用 Cloudflare 兼容的 console logger。日志等级可通过：

```bash
PAYLOAD_LOG_LEVEL=info
```

Cloudflare Workers observability 当前在 `wrangler.jsonc` 中默认关闭。开启前需要评估费用和日志量。

### 媒体文件

媒体文件通过 Payload `media` collection 上传，实际存储在 R2。R2 bucket 配置在 `wrangler.jsonc`。

如果前台图片无法加载，优先检查：

- R2 binding 是否存在。
- Payload media 文档中的 `url` 是否正确。
- OpenNext / Workers 是否能访问对应资源。
- `next.config.ts` 中图片访问配置是否覆盖当前路径。

### Preview

预览入口位于：

```text
src/app/(frontend)/api/preview/route.ts
src/app/(frontend)/api/preview/exit/route.ts
src/lib/site/publishing.ts
```

Preview 流程：

1. Payload admin 生成 preview URL。
2. `/api/preview` 校验 secret。
3. 校验通过后启用 Next draft mode。
4. 前台读取 draft 内容并跳转到目标页面。

如果预览不可用，优先检查：

- `PAYLOAD_PREVIEW_SECRET` 或 `PAYLOAD_SECRET` 是否存在。
- 页面是否在 `LIVE_PREVIEW_COLLECTIONS` 或 `LIVE_PREVIEW_GLOBALS` 中。
- 当前本地环境是否关闭了 live preview。
- D1 本地锁竞争是否导致读取失败。

## 测试与验证

修改代码后建议按风险选择验证方式。

### 类型检查

项目规则建议修改 TypeScript 后运行：

```bash
tsc --noEmit
```

当前 package scripts 未单独提供 `typecheck`，可直接运行上述命令或后续补充脚本。

### 集成测试

```bash
bun test:int
```

### E2E 测试

```bash
bun test:e2e
```

### 全量测试

```bash
bun test
```

对于纯文案、纯 README、无运行时代码变更，可以不跑完整测试，但应人工确认文档中的脚本和路径仍与项目一致。

## 内容维护指南

### 新增 Blog

优先使用 `blog-posts` collection。

- 常规文章使用 `template` 模式。
- 迁移外部 HTML 时才使用 `html` 模式。
- 发布前检查 slug、SEO 标题、描述、封面图和 `_status`。
- 上线后谨慎修改 slug，避免影响 SEO 和外部链接。

### 新增 Use Case

优先使用 `use-case-pages` collection。

- 常规页面使用 `template` 模式。
- 从旧 HTML 派生页面时可使用 `html` 模式。
- slug 会影响 `/use-cases/[slug]/` 路由，应保持稳定。

### 修改 FAQ

FAQ 使用 `faq-items` collection。

- `category` 决定前台分组。
- `sortOrder` 决定排序。
- `isActive` 控制是否展示。

### 修改法律页面

隐私政策和服务条款通过 globals 管理：

- `privacy-page`
- `terms-page`

法律页面由 `legal-editor`、`translator` 或 `admin` 更新。发布前应确认草稿状态和前台渲染效果。

### 修改导航和页脚

站点导航和页脚在 `site-settings` global 中维护。

相关字段包括：

- `navLinks`
- `footerColumns`
- `navCtaText`
- `navCtaHref`
- `footerDescription`
- `footerCopyright`
