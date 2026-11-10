# 官网 PostHog 同源中继设计

## 1. 背景

当前官网（`noumi-official-website`）使用浏览器端 `posthog-js`：

```text
浏览器 → posthog-js → https://e.noumi.ai (自定义反代)
                    → PostHog US Cloud
```

`e.noumi.ai` 没有独立 DNS 记录，命中 `*.noumi.ai A 34.20.139.222`，该 IP 本身是 Cloudflare 边缘地址，形成 Cloudflare → Cloudflare 回环，导致 522。官网 PostHog 目前收不到事件。

`neo-noumi` 的做法不同：

```text
浏览器 → 同源 /_api/posthog/events
      → 后端校验、补齐可信 URL、批量投递
      → https://us.i.posthog.com/batch/
```

本设计把官网迁移到同一模式：**浏览器不持有 PostHog token/host，不依赖自定义反代，所有事件经官网同源接口中继**。

## 2. 目标与非目标

### 目标

- 移除浏览器端 `posthog-js`、`e.noumi.ai`、`POSTHOG_BROWSER_API_HOST`、`POSTHOG_UI_HOST` 依赖。
- project key 与 ingest host 只保留在服务端。
- 保留现有 consent 门控、GA4/GTM、CTA 归因和 invite 事件语义。
- 事件名、属性、页面路径均有严格 allowlist；服务端构造可信 URL。
- 失败不影响页面业务；可观测、可限流、可回滚。
- 官网事件进入现有 PostHog US 项目，不需要 CNAME/Worker 反代。

### 非目标

- 不引入 `posthog-node`；官网是 Cloudflare Worker/Next.js runtime，直接用 `fetch` 投递 `/batch/`。
- 不恢复 PostHog autocapture、session replay、feature flags、surveys。
- 不把 GA4/GTM 迁移到服务端；GA4 行为保持不变。
- 不处理产品站（`www.noumi.ai`）的登录用户身份；官网仍以匿名 ID 为主。

## 3. 目标架构

```text
Browser
  ├─ GET  /api/site/analytics/config        → { enabled: boolean }
  └─ POST /api/site/analytics/events        → 同源事件 batch
                                              │
                                              ▼
Next.js Route (Cloudflare Worker)
  ├─ Origin / 自定义头 / consent cookie 校验
  ├─ body 16KB、batch ≤ 20、事件 schema 校验
  ├─ 页面路径规范化、服务端构造 $current_url/$pathname/$host
  ├─ 匿名/浏览会话 ID 校验
  └─ POST ${POSTHOG_API_HOST}/batch/
       { api_key, batch: [{ event, distinct_id, uuid, timestamp, properties }] }
                                              │
                                              ▼
                                   PostHog US Cloud
```

### 为什么不在服务端做常驻队列

官网流量低，Route 运行时（Cloudflare Worker）没有可靠的跨请求内存队列。采用：

- 客户端 50ms 小批量合并；
- 服务端每个请求同步投递一批；
- 429/5xx 在请求内最多重试 2 次；
- 失败只记录 warn，返回 204，不影响页面。

这与 `neo-noumi` 的“统计失败不改变业务”一致，但不承诺持久化交付。

## 4. 接口契约

### 4.1 `GET /api/site/analytics/config`

响应：

```json
{ "enabled": true }
```

- 不再返回 `projectKey`、`apiHost`、`uiHost`。
- `enabled = POSTHOG_ENABLED === 'true' && POSTHOG_PROJECT_KEY` 非空。
- `cache-control: no-store`。
- 运行时读取 `process.env` 与 Cloudflare context（沿用现有 route 逻辑）。

### 4.2 `POST /api/site/analytics/events`

请求头：

```text
Content-Type: application/json
x-noumi-analytics: 1
Origin: https://noumi.ai
Cookie: noumi_analytics_consent=1
```

请求体：

```json
{
  "events": [
    {
      "event": "$pageview",
      "eventId": "018f...uuid",
      "occurredAt": "2026-11-10T12:00:00.000Z",
      "anonymousId": "018f...uuid",
      "properties": {
        "page_path": "/pricing",
        "page_group": "pricing",
        "$session_id": "018f...uuid",
        "$window_id": "018f...uuid"
      }
    }
  ]
}
```

约束：

- body ≤ 16 KB，`events.length` 1–20。
- 仅接受 `application/json`。
- `Origin` 必须是同源（`request.url` origin、`OFFICIAL_SITE_URL` 或 `NEXT_PUBLIC_SITE_URL`）；缺失时要求 `sec-fetch-site: same-origin`。
- 必须带 `x-noumi-analytics: 1`；跨站简单请求无法伪造该头而不触发 CORS preflight。
- 必须带 `noumi_analytics_consent=1`；服务端不信任请求体里的 consent 字段。
- IP 限流：模块内 best-effort 60 请求/分钟/IP；生产再叠加 Cloudflare WAF 速率规则。
- `occurredAt` 必须在当前时间 ±30 分钟内。
- 未启用或 key 为空：返回 204，不读数据库、不发请求。
- 投递失败：记录结构化 warn，返回 204。

响应：

```text
204 No Content
```

## 5. 事件与属性 schema

### 5.1 客户端事件白名单

```ts
const OFFICIAL_CLIENT_EVENT_NAMES = [
  '$pageview',
  'landing_page_viewed',
  'official_cta_clicked',
  'official_invite_lookup_completed',
  'official_product_auth_redirected',
] as const
```

说明：

- `$pageview` 作为标准页面事件，替代重复的 `official_page_viewed`。
- `app_active` 心跳不进入 v1；它会产生大量噪声，且 neo-noumi 明确不使用心跳。若后续分析需要停留时长，单独设计低频 `page_engagement` 事件。
- `landing_page_viewed` 每会话一次，带首触归因。
- `official_cta_clicked` 由 `data-analytics-*` 点击触发。
- invite lookup / product auth 属于客户端意图，保留。
- `official_invite_request_submitted` 改为服务端事件，见 5.3。

### 5.2 属性 schema

使用 `zod`（项目已依赖 `zod ^4.5.4`）：

```ts
const pagePath = z
  .string()
  .max(160)
  .regex(/^\/(?:[a-z0-9][a-z0-9/_-]*)?$/, 'invalid page path')

const label = z.string().min(1).max(96)
const id = z.string().min(1).max(200)

const officialClientEventSchema = z
  .object({
    event: z.enum(OFFICIAL_CLIENT_EVENT_NAMES),
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    anonymousId: z.uuid(),
    properties: z
      .object({
        page_path: pagePath,
        page_group: label.optional(),
        cta_id: label.optional(),
        placement: label.optional(),
        action: label.optional(),
        outcome: label.optional(),
        status: label.optional(),
        source_path: pagePath.optional(),
        target_path: pagePath.optional(),
        utm_source: label.optional(),
        utm_medium: label.optional(),
        utm_campaign: label.optional(),
        utm_term: label.optional(),
        utm_content: label.optional(),
        referrer_origin: z.url().max(200).optional(),
        $session_id: z.uuid().optional(),
        $window_id: z.uuid().optional(),
      })
      .strict(),
  })
  .strict()
```

服务端额外做：

- `page_path` 规范化：去掉 query/hash、压缩重复 `/`、去尾 `/`、拒绝 `..`。
- 只允许官网公开路径：静态页面、`/blog/<slug>`、`/features/<slug>`、`/use-cases/<slug>`；`/[...prototype]` 和其他未知路径归 `/other` 或拒绝。
- 服务端构造：

```ts
const url = new URL(pagePath, officialOrigin)
const posthogProperties = {
  ...properties,
  $current_url: url.href,
  $pathname: url.pathname,
  $host: url.host,
  $process_person_profile: false,
  $geoip_disable: true,
  app_source: 'noumi-official',
  schema_version: 1,
}
```

浏览器不能提交 `$current_url`、`$pathname`、`$host`、`token`、`api_key`。

### 5.3 服务端事件

服务端事件使用同一套 event name/属性 schema，由业务代码在成功提交后调用：

```ts
captureOfficialServerEvent({
  event: 'official_invite_request_submitted',
  distinctId: anonymousId,
  eventId: `invite-submitted:${requestId}`,
  occurredAt: new Date(),
  properties: { outcome: 'created', source_path: '/invite' },
})
```

首期只有：

- `official_invite_request_submitted`：`/api/site/invite-requests` 在 `recordInviteRequest` 成功后发送；当前 waitlist 关闭（`isOfficialWaitlistEnabled()` 返回 false），代码路径保留，恢复 waitlist 时启用。
- 匿名 ID 由客户端提交的 `analyticsAnonymousId` 或请求头 `x-noumi-analytics-anonymous-id` 提供；服务端校验 UUID，缺失则跳过，不影响业务。

## 6. 身份、会话与同意

### 6.1 匿名 ID

- 优先读取生产已有的 `noumi_visitor_id` cookie（父域共享访客 ID），校验 UUID。
- 否则读取 `localStorage` key `noumi:analytics:anonymous_id`；没有则 `crypto.randomUUID()` 并写入。
- 撤回同意时轮换/清除匿名 ID 与浏览会话。
- 不创建新的跨子域 cookie；仅在已有 `noumi_visitor_id` 时复用它。

### 6.2 浏览会话

- `localStorage` key `noumi:analytics:browser-session`，记录 `{ id, startedAt, lastAt }`。
- 30 分钟无事件或 24 小时上限换新；`$window_id` 每次文档加载生成。
- 只由真实事件延长，不加心跳。

### 6.3 同意

当前 consent 存在 `localStorage`，服务端读不到。增加一个非 HttpOnly 偏好 cookie：

```text
noumi_analytics_consent=1; Path=/; SameSite=Lax; Max-Age=31536000
```

- `writeStoredConsent(locale, productLogin, analytics)`：
  - `analytics === true` → 写入 `noumi_analytics_consent=1`；
  - `analytics === false` → 删除该 cookie。
- 服务端 `POST /api/site/analytics/events` 要求该 cookie 为 `1`。
- 客户端仍需在 consent 为 false 时不发事件；cookie 是第二道门。
- 撤回同意时清空客户端队列、轮换匿名 ID；服务端看到 cookie 清除后不再接受。

## 7. 客户端改造

文件：`src/components/site/OfficialAnalyticsProvider.tsx`

### 移除

- `import posthog from 'posthog-js'`
- `posthog.init` / `opt_in_capturing` / `opt_out_capturing`
- `before_send` / `sanitizeBrowserEvent`
- `$pageleave` / `capture_pageview: 'history_change'`
- `posthog.get_distinct_id()`（外跳归因改用 `readOfficialAnonymousId()`）

### 新增

- `loadOfficialAnalyticsConfig()` 返回 `{ enabled }`。
- 模块内队列：
  - `capture(event, properties)`：consent 且 enabled 时入队；
  - 50ms 后 flush，最多 20 条；
  - `fetch('/api/site/analytics/events', { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json', 'x-noumi-analytics': '1' }, body: JSON.stringify({ events }) })`；
  - 非 2xx 丢弃并记录一次 console warn（不重试，避免影响页面）。
- `$pageview`：pathname 变化时发送一次；同 path + session 去重。
- `landing_page_viewed`：每会话一次，带 `buildOfficialLandingSourceProperties` 的 utm/referrer（已去 query/hash）。
- `official_cta_clicked`：沿用现有 capture 阶段点击监听和 `data-analytics-*` 属性。
- 外跳归因：继续使用 `buildOfficialOutboundAttributionParams`，`anonymousDistinctId` 改为 `readOfficialAnonymousId()`。
- 撤回同意：清空队列、停止发送、轮换匿名 ID。

### 保留

- GA4/GTM 初始化、Consent Mode、`try_free_click` dataLayer 逻辑。
- Cookie banner 的 UI 和 `readStoredConsent` 流程。
- 现有 `data-analytics-*` 标记和事件属性。

## 8. 服务端实现

### 8.1 文件

- `src/lib/site/posthog-server.ts`（新增）
  - `readPostHogServerConfig()`
  - `captureOfficialServerEvent()`
  - `sendPostHogBatch()`
- `src/lib/site/analytics.ts`（改造）
  - 客户端/服务端事件名、page path 规范化、zod schema。
- `src/app/api/site/analytics/config/route.ts`（改造）
  - 只返回 `{ enabled }`。
- `src/app/api/site/analytics/events/route.ts`（新增）
  - 校验、限流、投递。
- `src/lib/site/consent.ts`（改造）
  - consent cookie 写入/清除。
- `src/lib/site/official-analytics-identity.ts`（新增）
  - 匿名 ID、浏览会话、UUID 校验。

### 8.2 投递器

```ts
type PostHogServerConfig = {
  enabled: boolean
  projectKey: string | null
  apiHost: string
}

async function sendPostHogBatch(
  config: PostHogServerConfig,
  events: PostHogEvent[],
): Promise<void> {
  const response = await fetch(`${config.apiHost}/batch/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ api_key: config.projectKey, batch: events }),
    signal: AbortSignal.timeout(5_000),
  })
  // 429/5xx 在调用方重试；其余丢弃并 warn
}
```

- `POSTHOG_API_HOST` 默认 `https://us.i.posthog.com`；只允许 HTTP(S) origin，拒绝 credentials/query/hash。
- 不把 key 写入日志。
- 每个 event 带稳定 `uuid`（客户端 `eventId` 或 `sha256(event + distinctId + eventId)`），重试去重。
- `$process_person_profile: false`，不创建 person profile。
- `$geoip_disable: true`（如后续需要国家维度，再单独评估）。

### 8.3 环境变量

```dotenv
POSTHOG_ENABLED=false
POSTHOG_PROJECT_KEY=
POSTHOG_API_HOST=https://us.i.posthog.com
```

删除：

```dotenv
POSTHOG_BROWSER_API_HOST
POSTHOG_UI_HOST
```

`wrangler.jsonc` 同步修改；运行 `bun run generate:types` 更新 `cloudflare-env.d.ts`。

### 8.4 依赖

- 移除 `posthog-js`（`package.json` / `bun.lock`）。
- 保留 `zod`。
- 删除测试里的 `vi.mock('posthog-js')`。

## 9. 安全与滥用

- 公开事件接口，必须假设会被刷：
  - 16 KB body、batch ≤ 20、字段长度上限；
  - `Origin` + `x-noumi-analytics: 1` + consent cookie；
  - 60 请求/分钟/IP 的 best-effort 限流；
  - 生产 Cloudflare WAF 速率规则作为真正的边界。
- 不接收原始 URL、query、hash、邮箱、prompt、文件名或自由文本。
- 不接收 `token`、`api_key`、`$current_url`、`$pathname`、`$host`。
- 事件名/属性 schema 严格 `.strict()`；未知字段直接 400。
- 错误响应不包含内部配置；日志不打印 key/cookie。

## 10. 测试计划

### 单元

- `normalizeOfficialPagePath`：query/hash、尾斜杠、动态 slug、未知路径、超长。
- `officialClientEventSchema`：合法事件、未知事件、未知属性、非法 UUID、超长 label、非法 path。
- `buildPostHogBatch`：服务端构造 URL/host/path；`$process_person_profile`/`$geoip_disable`；`api_key`。
- consent cookie 写入/清除。

### 路由

- `GET /api/site/analytics/config` 只返回 `{ enabled }`；不泄漏 key/host。
- `POST /api/site/analytics/events`：
  - 无 consent cookie → 403/204；
  - 无 `x-noumi-analytics` → 400/403；
  - 跨 Origin → 403；
  - body 超限 → 413；
  - 未知事件/属性 → 400；
  - 合法 batch → 调用 mock `fetch`，body 含 `api_key` 与 batch；
  - PostHog 500 → 重试后 204，日志 warn；
  - 未启用/key 空 → 204，不调用 fetch。

### 浏览器

- 未同意：0 个 `/api/site/analytics/events` 请求。
- Agree：`$pageview`、`landing_page_viewed`、`official_cta_clicked` 到达；无 `posthog-js` 网络请求、无 `e.noumi.ai`。
- 切换路径：`$pageview` 一次；无 `app_active` 心跳。
- 撤回：后续 0 请求；匿名 ID 轮换。
- CTA 外跳：归因参数仍带 `first_touch_*`、`official_cta_id`、`anonymous_id`、`source_surface=official`。

### 集成

- 本地 PostHog mock（`/tmp/posthog-mock.ts`）验证 payload。
- 测试 project key（`phc_t5...`）验证真实 PostHog Live Events。
- 生产 project key 只在生产环境验证。

## 11. 迁移步骤

1. **设计确认**：本文档。
2. **代码 PR**：
   - 新增 schema、identity、server transport、events route；
   - 改造 config route、consent、Provider；
   - 删除 posthog-js；
   - 更新 env/wrangler/types/tests。
3. **预览验证**：
   - 用测试 project key 在 Preview/本地运行；
   - 检查 Live Events、无 `e.noumi.ai` 请求、无 posthog-js。
4. **生产切换**：
   - Worker secret 写入生产 project key；
   - `POSTHOG_API_HOST=https://us.i.posthog.com`；
   - 部署；
   - 验证 `noumi.ai` 事件进入现有生产项目；
   - 确认 `e.noumi.ai` 不再被引用。
5. **清理**：
   - 删除 `POSTHOG_BROWSER_API_HOST`/`POSTHOG_UI_HOST`；
   - 删除 posthog-js 依赖；
   - 视情况清理 `e.noumi.ai` DNS（先确认没有其他引用）。

### 回滚

- 代码回滚到上一个 deployment；`POSTHOG_ENABLED=false` 可立即停止新链路。
- `e.noumi.ai` 旧配置不再使用；回滚不需要恢复 DNS。
- 若需要临时直连，可保留一个未使用的 `POSTHOG_BROWSER_API_HOST` 环境变量，但不建议重新引入 posthog-js。

## 12. 待确认决策

1. `official_page_viewed` 是否保留为 `$pageview` 的别名？默认 v1 只发 `$pageview`。
2. `app_active` 心跳是否彻底移除？默认移除。
3. 动态内容页 `/blog/<slug>`、`/features/<slug>`、`/use-cases/<slug>` 是否保留 slug（推荐保留，公开内容），还是模板化为 `:slug`。
4. 生产 PostHog 项目 key 与 dashboard 权限由谁提供。
5. 生产限流是否使用 Cloudflare WAF 规则，还是先依赖 best-effort 内存限流。

## 13. 实现状态

| 项               | 文件                                                      | 状态                                                              |
| ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------- |
| 浏览器可见开关   | `src/app/api/site/analytics/config/route.ts`              | 完成，仅返回 `{ enabled }`                                        |
| 事件接口         | `src/app/api/site/analytics/events/route.ts`              | 完成，Origin/header/consent/schema/时间窗口/限流                  |
| schema 与投递    | `src/lib/site/analytics-events.server.ts`                 | 完成，`/batch/` + 429/5xx 一次重试                                |
| 浏览器身份与会话 | `src/lib/site/analytics-identity.ts`                      | 完成，复用 `noumi_visitor_id`，30 分钟/24 小时会话                |
| Provider         | `src/components/site/OfficialAnalyticsProvider.tsx`       | 完成，50ms 批量、`keepalive`、撤回即停                            |
| consent cookie   | `src/lib/site/consent.ts`                                 | 完成，同意写 `noumi_analytics_consent=1`，撤回删除                |
| 服务端事件       | `src/app/api/site/invite-requests/route.ts`               | 完成，写入成功后发送                                              |
| 依赖             | `package.json` / `bun.lock`                               | 已移除 `posthog-js`                                               |
| 环境变量         | `wrangler.jsonc` / `.env.example` / `cloudflare-env.d.ts` | `POSTHOG_BROWSER_API_HOST`/`POSTHOG_UI_HOST` → `POSTHOG_API_HOST` |
| 测试             | `tests/int/analytics*.spec.ts*`                           | 34 项通过；全量 int 套件 177 项通过                               |

### 已知取舍

- 投递不是持久队列：Worker 没有跨请求队列，进程退出或连续失败会丢事件。
- 限流是进程内 best-effort；生产边界应在 Cloudflare WAF 配置速率规则。
- `official_page_viewed` 已由 `$pageview` 代替；`app_active` 心跳已移除。
- `official_invite_request_submitted` 在 waitlist 关闭期间不会产生，恢复 waitlist 后自动启用。

### 验证记录（2026-11-10）

| 验证                                                             | 结果                                                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `GET /api/site/analytics/config`（本地，`POSTHOG_ENABLED=true`） | `{"enabled":true}`，无 key/host                                                         |
| 路由集成测试（无 consent cookie）                                | `403 missing_analytics_consent`，未调用 PostHog                                         |
| 路由集成测试（跨 Origin / 缺请求头）                             | `403`，未调用 PostHog                                                                   |
| 路由集成测试（未知事件 / 伪造 `$current_url`）                   | `400`，未调用 PostHog                                                                   |
| 路由集成测试（超窗时间 / 21 条 / `text/plain`）                  | `400` / `400` / `415`                                                                   |
| 路由集成测试（合法 batch，mock `/batch/`）                       | `204`；`api_key` 正确；`$current_url` 为 `https://noumi.ai/pricing`；无 `email=`/`#top` |
| 真实 PostHog（测试项目 `phc_t5...`）                             | `POST https://us.i.posthog.com/batch/` → `200 {"status":"Ok"}`                          |
| 全量 int 测试                                                    | 40 文件 / 184 项通过                                                                    |
| `tsc --noEmit`                                                   | 通过                                                                                    |
| `eslint .`                                                       | 0 error（既有 warning 未新增）                                                          |

本地 `next dev` 曾因既有问题（Turbopack 无法解析 `public/assets/fonts/fonts.css`）整站 500，与本次改动无关；因此用路由级集成测试驱动同一 `POST` 处理器完成端到端验证。

### 上线前仍需人工完成

1. 生产 Worker 写入 `POSTHOG_PROJECT_KEY` secret（`wrangler secret put POSTHOG_PROJECT_KEY`）。
2. 确认生产 `POSTHOG_API_HOST=https://us.i.posthog.com`、`POSTHOG_ENABLED=true`。
3. 部署后验证 `noumi.ai` 的 `$pageview` 进入生产项目，且 Network 中不再出现 `e.noumi.ai`。
4. 视需要为 `/api/site/analytics/events` 配置 Cloudflare WAF 速率规则。
