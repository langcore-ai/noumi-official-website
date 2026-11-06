# 官网点击统计与运营操作

## 入口与职责

- `/admin/analytics`：原生 GA4 数据看板。admin、content-editor、viewer 可查看；仅 admin 可以连接、重新连接或断开 Google。
- GTM：维护点击触发规则和 GA4 事件标签；GA4：接收和分析事件。后台通过 Google Analytics Data API 只读查询，不再依赖 Looker Studio。
- Google 授权账号须具备目标 GA4 媒体资源查看权限。一次授权供具备 CMS 查看权限的同事使用，不需要每个人登录 Google。
- 当前看板固定查询 `try_free_click`。新增 GTM 事件不会自动成为看板指标。

## 当前数据契约

免费试用点击统一为 `try_free_click`，一次点击一次事件；不是注册成功事件。

| 参数              | 含义                                               |
| ----------------- | -------------------------------------------------- |
| `page_location`   | 点击当下页面的 origin + path，去掉 query/hash      |
| `page_path`       | 点击当下页面路径                                   |
| `page_title`      | 页面标题                                           |
| `button_text`     | 按钮文字（最长 100 字符）                          |
| `button_location` | header / hero / footer / cta_band / content 等位置 |
| `cta_id`          | 已有按钮标识，没有时为空                           |

识别优先级：显式 `data-track-action="try_free"`；已有以 `try_free` 结尾的 `data-analytics-cta-id`；文字为 Try Noumi Free（忽略大小写并支持常见尾部箭头）的链接或按钮。显式其他 action 可排除文字兜底。位置优先读取 `data-track-location`、`data-analytics-placement`，然后按导航、页脚、CTA 区域识别。

同类按钮新增后复用规则；删除不再产生事件，历史数据保留。任意文案的自定义 HTML 按钮建议使用显式标记，不要依赖样式类或文字规则。跨域 iframe 内点击不在父页面的监听范围内，需展示站点另行配合。

仅在用户同意 analytics 后发送免费试用事件；撤回后停止，不补发同意之前的点击。现有 GA4 页面浏览 Consent Mode 行为保持不变。PostHog 继续保留原事件与归因，不影响 GA4 点击发送。

## 首次创建 GTM

1. 使用公司 Google 账号打开 <https://tagmanager.google.com/>，创建账户及 Web 容器，记录 `GTM-...` 编号。
2. 在容器中创建 Data Layer Variable（版本 2）：`page_location`、`page_path`、`page_title`、`button_text`、`button_location`、`cta_id`，数据层变量名与表格字段完全一致。
3. 创建「自定义事件」触发器，事件名称精确为 `try_free_click`。
4. 创建「Google Analytics: GA4 Event」标签，Measurement ID 使用官网现有 ID，事件名称 `try_free_click`；逐项映射上述事件参数为对应数据层变量。
5. 将标签绑定到该自定义事件触发器。开启 Consent Overview，检查授权设置；对运营新增的点击标签要求 `analytics_storage`，不得绕过 Cookie 授权。
6. Preview 验证后发布容器版本，再交给维护者配置网站容器 ID。若先配置 ID、后发布标签，点击只进入 dataLayer，GA4 会漏记。

**页面浏览由网站现有 Google tag 管理。不要再添加自动 page_view、All Pages Google tag 或第二条免费试用点击规则。** 本次只交由 GTM 发送点击；已有 gtag 初始化继续工作。若将来整体迁移 GA4 初始化，应作为单独变更处理。

## OAuth 配置（维护者）

Google Cloud 项目启用 Google Analytics Data API。Google Auth Platform 中配置公司内部应用（若组织支持），添加范围 `https://www.googleapis.com/auth/analytics.readonly`，创建 Web 应用 OAuth 客户端。外部测试应用的 Analytics 刷新令牌通常 7 天过期，不适合作为长期生产连接。

服务端变量（不使用 NEXT_PUBLIC 前缀）：

| 变量                       | 用途                                                    |
| -------------------------- | ------------------------------------------------------- |
| `GA4_PROPERTY_ID`          | 数字媒体资源 ID，当前为 `535315366`                     |
| `GA4_OAUTH_CLIENT_ID`      | OAuth Web 客户端 ID                                     |
| `GA4_OAUTH_CLIENT_SECRET`  | OAuth 客户端密钥，使用 Worker Secret                    |
| `GA4_OAUTH_REDIRECT_URI`   | 精确匹配 Google 客户端的重定向 URI                      |
| `GA4_TOKEN_ENCRYPTION_KEY` | 独立随机 32 字节密钥，64 位十六进制，使用 Worker Secret |

回调路径固定 `/api/site/ga4/callback`：

- 生产：`https://noumi.ai/api/site/ga4/callback`
- staging：`https://preview.staging.noumi.ai/api/site/ga4/callback`
- 本机默认：`http://localhost:3000/api/site/ga4/callback`（实际端口变化时两端同步更新）。必须用 localhost 登录，不能使用局域网 IP。
- 功能分支 Preview 必须配置自己的精确域名，并在 Google 客户端登记。不会从请求 Host 推导回调。

服务端授权流程无需填写 JavaScript 来源。以上 URI 必须在实际部署对应接口后才能成功完成授权；添加 URI 不表示已连接。

本地配置加入忽略提交的 `.local/infra/local.secrets.json`，mode 工具会写入 `.dev.vars.local` 并传入 Node。云端通过平台运行时变量和 Secret 配置；不要把生产授权复制到 Preview。无需修改 D1 schema。

管理员登录 `/admin/analytics`，点击「连接 Google Analytics」，由有 GA4 查看权限的公司账号完成只读授权。后端会校验媒体资源可读后再保存连接，不会以失败授权覆盖原连接。

## 安全与存储

OAuth 使用 10 分钟加密 HttpOnly/SameSite=Lax cookie、随机 state、PKCE S256，绑定发起授权的 CMS 管理员。生产 cookie 设置 Secure。连接和断开必须 POST 且 Origin 与配置地址相符。API 每次验证 CMS 角色。

刷新令牌和报表缓存使用 AES-256-GCM 加密后保存到现有 R2 的 `private/ga4/<namespace>/`。namespace 包含完整回调 URI、客户端 ID、媒体资源 ID 的 SHA-256，防止共用 Preview bucket 时串用连接。浏览器不接收客户端密钥或 Google token。加密密钥丢失、变更或客户端/回调变更需要重新连接。

报表缓存有效期 5 分钟，查询时仍先检查连接。每次重新授权生成新连接 ID，旧缓存不会复用。断开只删除本网站保存的连接，不撤销 Google 账号层面的应用授权；需要完全撤销时由账号持有人在 Google 第三方连接管理中操作。旧的加密缓存可由维护者按这个专用前缀定期清理，不要清理共享媒体或快照。

## 报表含义与验收

- 日期范围最多 366 天；统计按 GA4 媒体资源时区计算，页面显示该时区。
- 点击次数使用 eventCount，点击用户数使用 totalUsers。分组用户数不可相加作为总用户数。
- 来源页面使用原生 `pageLocation`，不是着陆页。按钮使用 `customEvent:button_location`、`customEvent:button_text`，需在 GA4 注册事件级自定义维度。
- 分组表最多展示前 100 项；总量独立查询，不由前 100 项加总。阈值、other 合并和截断会显示提示。
- 自定义维度未生效时保留总量、日期和页面报表；授权失效、权限不足或配额问题显示错误，不伪装成零数据。
- GA4 标准报表有处理延迟，无数据不能单独证明埋点失效。即时收数使用 DebugView / 实时报告。

验证未登录 401、无权限 403、viewer 无法修改连接、跨站 POST 被拒绝、state/PKCE 校验、凭据加密、Google 权限验证、缓存及缺少自定义维度场景。真实 Google 授权必须由账号持有人操作，模拟测试不能代替真实数据联调。

## 运营新增点击

运营在 GTM 使用稳定链接地址或元素属性配置触发器，创建新的 GA4 事件标签，Preview 验证 Cookie 同意/拒绝、桌面/移动端和页面参数后发布。不要为 try_free_click 添加重复规则。复杂业务成功事件、跨域 iframe 内事件仍需开发提供准确的事件信号。
