# Use Cases 跨域嵌入协议

## 范围与当前状态

官网 `/use-cases` 的顶部介绍和角色网格被 iframe 替换，导航、FAQ 和其后内容保留。外站地址为 `https://noumi-twelve-use-cases.himihiroti.chatgpt.site/?embed=1`。

`/use-cases/solutions-engineer` 展示原先不含 iframe 的完整汇总页（标题、大图、角色卡片、FAQ 和 CTA），不是重定向，也不再展示原 Solutions Engineer 详情页。路由映射在 `src/lib/site/prototype/pages.ts`，保留原汇总页样式和动效。为避免自链接，其中 Solutions Engineer 卡片指向 `/use-cases` 新版展示页；其他卡片链接保持原样。该页面 metadata 使用汇总页标题和自身 URL。

官网代码：`src/components/site/official/OfficialUseCasesEmbed.tsx`；接入位置：`src/components/site/prototype/PrototypePage.tsx`。首页本地 gallery 的同域实现 `OfficialUseCasesShowcase.tsx` 与此协议不同，不要混用读取 DOM 的方式。

2026-10-14 已确认外站发布 embed=1 布局与高度协议。外站目前仅允许 https://noumi.ai 和 https://www.noumi.ai，localhost 联调会停留 waiting；生产桌面和手机的 12 个案例已通过自动高度与单层滚动验证。官网无需为正常内容更新重新部署。

## 双方职责

| 父网页：本仓库官网                       | 子网页：外部展示站点                                 |
| ---------------------------------------- | ---------------------------------------------------- |
| 加载 embed=1 地址，提供宽度              | 保留嵌入模式，内容自然撑开                           |
| 请求测量、校验高度消息、设置 iframe 高度 | 测量完整内容高度并发送消息                           |
| 负责外层页面滚动                         | 取消主体固定高度、最大高度及内部纵向滚动，不截断内容 |
| 未收到有效高度时保留滚动兜底             | 监听案例、展开、图片、字体及响应式变化，支持高度增减 |

子站点不能让测量容器依赖 iframe 视口高度（如 min-height:100vh），否则可能无法缩短或持续增长。弹窗、固定定位和浮层需由子站点检查可见性，不拦截应交给官网的纵向滚轮。独立访问不带 embed=1 时保留原体验。

## 消息协议

使用普通对象通过 `window.postMessage` 传递，不使用 JSON 字符串。

父 → 子：`{ type: 'noumi:embed-measure' }`

子 → 父：`{ type: 'noumi:embed-height', height: 1234 }`

height 为包含所需间距的实际内容高度，单位 CSS px。父侧接受有限 number，范围 1–100000，向上取整；拒绝字符串、NaN、Infinity、负数及异常大值。支持高度缩短。

父侧 targetOrigin 固定为外站准确 origin，同时校验 `event.origin` 与 `event.source === iframe.contentWindow`。子侧校验父窗口和父来源白名单，并向已校验来源回复，不使用任意来源。生产及预览 origin 应由双方确认；本地常见 `http://localhost:3000`、应用转发地址 `http://localhost:14471`，端口不同即不同 origin，应以实际父页 `location.origin` 为准，不无条件接受查询参数提供的来源。

父侧在监听注册后及每次 iframe load 后请求高度，最多每秒重试一次，共五次；收到有效消息即停止重试。即使重试结束，消息监听仍有效，子站点稍后主动上报仍会生效。iframe 重载会清空上次高度，恢复等待状态。父侧观察宽度变化并请求重测，不因高度变化请求，避免循环。

子侧须持续用 ResizeObserver 等观察内容变化，主动报告；不能只在收到请求时报告。先注册请求监听，再执行初次测量；可用 requestAnimationFrame 合并变化，仅高度改变时上报。

## 兜底与限制

等待高度时 `data-embed-status="waiting"`，使用 `max(900px, 100svh)` 预览高度及 `scrolling="auto"`，优先保证内容能访问。收到有效高度后为 `ready`，应用像素高度及 `scrolling="no"`。该状态只代表已接受消息，不证明子页面内部所有滚动容器已被适配。

隐藏滚动条不能自动撑高；父站 CSS 不能跨域修改子站。外站必须允许 iframe 嵌入。不要为绕过此限制临时代理外站或关闭浏览器安全机制。

## 验证和本地预览

- 协议测试：`bunx vitest run tests/int/use-cases-embed.int.spec.tsx`。
- 组件检查：`bunx tsc --noEmit` 和 `bun run generate:importmap`。
- 预览只使用 `bun run mode:` 系列；查看状态后，运行 `bun run mode:reload` 或 `bun run mode:local up`，使用命令实际输出的端口。
- 联调覆盖桌面和手机，最长/最短案例切换、展开/收起、图片及字体延迟加载、iframe 重载。
- 验证无裁切、无多余底部留白、无高度反馈循环，鼠标位于展示区时能滚动官网。
- 外站未支持协议时应保持 waiting 和可滚动；错误 origin、source 或数据不得改变高度。

本地模拟消息测试仅验证父侧协议行为，不能代替外站发布后的浏览器视觉验收。

## 2026-10-14 生产验证记录

- Cloudflare Worker：`noumi-official-website`；版本：`a4ce4b25-f9fb-4212-8fb7-0c0f11166bf6`；应用提交：`0905799`。
- `https://noumi.ai/use-cases`：1440px 和 390px 宽度各遍历 12 个案例，24 次测量的 iframe 高度均等于子页内容高度向上取整，未发现可滚动的内部纵向容器。案例切换保留 embed=1，支持高度增减。
- 两种宽度下，鼠标在 iframe 区域滚轮操作均使父网页滚动 400px。
- 首页、博客、后台、Use Cases HTTP 检查均为 200。51 个集成测试、4 个 E2E、类型检查和 Cloudflare 构建通过。
- 此轮未穷举所有弹窗、折叠内容及所有浏览器；这不属于全交互验收。
