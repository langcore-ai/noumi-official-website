# 官网 PostHog SDK 与同域 ingest 代理

## 1. 背景

第一代官网使用浏览器端 `posthog-js`，事件由 SDK 自动补全设备、来源、搜索引擎、点击 ID 与滚动深度。后来 `e.noumi.ai` 自定义反代形成 Cloudflare → Cloudflare 回环（522），官网改为自建事件接口；手工拼装属性导致 `$browser`、`$os`、`$device_type`、`$referring_domain`、`$search_engine`、`$prev_pageview_*` 等字段丢失。

本方案恢复 `posthog-js`，但不再使用自定义子域名：

```text
浏览器 posthog-js
  └─ POST /ingest/e/、/ingest/static/*、/ingest/array/*
       └─ worker.ts（先于 canonical redirect、快照与 OpenNext）
            ├─ /static/*、/array/* → https://us-assets.i.posthog.com
            └─ 其余               → https://us.i.posthog.com
```

代理只处理传输层，**不解析事件体、不改属性、不重算 URL**。旧的自建链路是应用层中继：浏览器按自定义 schema 打包，服务端逐项校验并重建字段，这正是设备、来源、点击 ID 丢失的原因。

## 2. 配置接口

`GET /api/site/analytics/config`（`cache-control: no-store`）返回：

```json
{
  "enabled": true,
  "projectKey": "phc_...",
  "apiHost": "/ingest",
  "uiHost": "https://us.posthog.com"
}
```

- `projectKey` 是公开写 token，不是 secret；关闭时返回 `null`，不下发 key。
- `apiHost` 固定为同域 `/ingest`，浏览器不直连 PostHog。
- `uiHost` 只用于 SDK 的工具栏链接。

## 3. `/ingest` 代理契约

| 浏览器路径         | 上游                                       |
| ------------------ | ------------------------------------------ |
| `/ingest/static/*` | `https://us-assets.i.posthog.com/static/*` |
| `/ingest/array/*`  | `https://us-assets.i.posthog.com/array/*`  |
| 其余 `/ingest/*`   | `https://us.i.posthog.com/*`               |

请求头处理：

- 删除 `cookie`，避免把官网登录态带给 PostHog；
- 删除 `host`，由上游 URL 决定；
- 删除 `referer`，来源已由 SDK 的 `$referrer` 属性携带，避免把地址栏里的非渠道参数带给第三方；
- 仅保留 `Authorization: Bearer phc_…` / `phs_…` / `phx_…`，其余 Authorization 删除；
- `CF-Connecting-IP` 写入 `X-Forwarded-For`，让 PostHog 按访客真实 IP 解析国家/城市；
- 其余请求头（含浏览器 `User-Agent`、`Accept-Encoding`）原样转发；
- GET `/static/*`、`/array/*` 用 `caches.default` 写入 Cloudflare 边缘缓存。

必须在 `worker.ts` 的 canonical redirect 之前处理：PostHog 的 capture 路径以 `/` 结尾，先归一化尾斜杠会把 `/ingest/e/` 变成 `/ingest/e` 并导致 404。

`wrangler.jsonc` 的 `assets.run_worker_first` 包含 `/ingest/*`，确保请求优先进入 Worker。

## 4. SDK 配置

```ts
posthog.init(projectKey, {
  api_host: apiHost,              // '/ingest'
  ui_host: uiHost,
  advanced_disable_decide: true,  // 无 feature flags / 远程配置
  autocapture: false,             // 不采集页面文字和普通点击
  bootstrap: { distinctID: visitorId, isIdentifiedID: false },
  capture_pageleave: true,
  capture_pageview: 'history_change',
  capture_performance: false,
  cross_subdomain_cookie: false,
  disable_session_recording: true, // 回放由 rrweb Cloud 独占
  disable_surveys: true,
  persistence: 'localStorage',     // 不新增 cookie
  persistence_name: 'noumi_website',
  person_profiles: 'always',
  sanitize_properties: (properties) => { ... },
})
```

`posthog-js` 通过动态 `import('posthog-js')` 加载，不进首屏关键路径。必须使用完整包而不是 `dist/module.slim`：slim 包不包含 history autocapture，Next.js 站内路由切换不会产生 `$pageview`。

## 5. 字段归属

| 字段                                                                                                                                   | 归属                                         |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `$pageview`、`$pageleave`                                                                                                              | SDK                                          |
| `$browser`、`$browser_version`、`$os`、`$device_type`、`$browser_language`、`$screen_*`、`$viewport_*`、`$timezone`、`$raw_user_agent` | SDK                                          |
| `$referrer`、`$referring_domain`、`$search_engine`、`$session_entry_*`                                                                 | SDK                                          |
| 点击 ID（`gclid`、`fbclid`、`li_fat_id`、`msclkid`、…）                                                                                | SDK；`sanitize_properties` 不得删除非 `$` 键 |
| `$prev_pageview_*`（停留、滚动、内容比例）                                                                                             | SDK                                          |
| `$process_person_profile`、`$is_identified`、`$device_id`、`$session_id`、`$window_id`                                                 | SDK                                          |
| `first_touch_*`、当前 `utm_*`、`page_path`、`page_group`、`visitor_id`、`device_fp`、`app_source`                                      | Provider 的 `sanitize_properties` 注入       |
| `landing_page_viewed`、`official_cta_clicked`、`official_page_engagement`                                                              | Provider 自定义事件                          |
| `official_invite_request_submitted`                                                                                                    | 服务端 `captureOfficialServerEvent`          |

`$referrer` / `$initial_referrer` / `$session_entry_referrer` 在 `sanitize_properties` 中收窄到 origin；`$referring_domain` 与 `$search_engine` 已由 SDK 在此之前计算，不会丢失。

## 6. 身份与口径

- `bootstrap.distinctID` 使用现有 `noumi_visitor_id`，SDK 的 `distinct_id` 与官网访客编号一致；`persistence_name: 'noumi_website'` 隔离第一代 SDK 的本地状态。
- `person_profiles: 'always'` 让每条事件都写 `$process_person_profile: true`，恢复稳定的 person 口径。
- 切换前的自建链路与 SDK 链路在 PostHog 中按 `$lib` 区分：SDK 事件有 `$lib = "web"` 和 `$lib_version`，自建事件没有。趋势图不要跨切换点直接连线。
- `$prev_pageview_*` 的位置随版本变化：整页跳转时在 `$pageleave`，站内路由切换时在下一条 `$pageview`。报表查询需要合并两者。
- 点击 ID 只在落地 URL 带有对应参数时非空；验收使用 `?gclid=test123` 之类的测试链接。

## 7. 运维

启用：

```text
POSTHOG_ENABLED=true
POSTHOG_PROJECT_KEY=phc_...
POSTHOG_API_HOST=https://us.i.posthog.com
```

验证：

1. `GET /api/site/analytics/config` 返回 `enabled: true`、`apiHost: "/ingest"`、非空 key。
2. 浏览器 Network 只有同域 `/ingest/*`，不出现 `us.i.posthog.com`；`/ingest/e/` 返回 200。
3. PostHog Live events 中 `$host` 为当前站点，`$lib = "web"`，`$browser`、`$os`、`$device_type`、`$browser_language`、`$referring_domain` 非空。
4. `?gclid=test123` 访问后，事件属性包含 `gclid: "test123"`。
5. 首页 → `/pricing` → 站内 `pushState` 产生 3 条 `$pageview`，没有重复采集。

回滚：

- 关闭 `POSTHOG_ENABLED` 即停止 SDK 初始化，页面与业务不受影响。
- 不要恢复 `e.noumi.ai`；它的失败是 `*.noumi.ai` 通配与缺失 CNAME 形成的回环，和本次同域路径代理无关。
- 不要重新引入属性白名单式 `before_send`；它会丢弃点击 ID 等非 `$` 键。

## 8. 代码位置

| 路径                                                | 作用                                          |
| --------------------------------------------------- | --------------------------------------------- |
| `src/lib/site/posthog-ingest-proxy.ts`              | 路径映射、请求头清洗、缓存与转发              |
| `worker.ts`                                         | `/ingest/*` 早返回，先于重定向与快照          |
| `src/app/api/site/analytics/config/route.ts`        | 下发开关、公开 key、同域 host                 |
| `src/components/site/OfficialAnalyticsProvider.tsx` | SDK 初始化、页面/离开事件、业务事件、外跳归因 |
| `src/lib/site/analytics-events.server.ts`           | 服务端事实事件投递                            |
| `src/lib/site/attribution.ts`                       | 90 天首触快照                                 |
