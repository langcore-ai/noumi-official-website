---
name: noumi-design
description: Author frontend design drafts for the Noumi official website (noumi.ai) on the design/workbench branch — page, section or fragment HTML/CSS that gets compiled into the live site. Use when asked to design, restyle or build a Noumi website page, hero, card, CTA or any UI block.
---

# Noumi 官网设计稿开发

你在 `design/workbench` 分支上做 Noumi 官网（<https://noumi.ai>）的设计稿。站点是 Next.js + Payload CMS 跑在 Cloudflare 上的动态站，**你只写 HTML/CSS**；导航栏、页脚、Cookie 弹窗、分析脚本、CMS 数据都由站点提供。

提交流程见仓库里的 `design/AGENTS.md`；本文件讲**怎么写才能落地**。文中数值都是实测计算值，可直接照着写。

## 1. 产出放在哪

| 完成度 | 路径 | 说明 |
| --- | --- | --- |
| 一个完整页面 | `design/pages/<name>.html` | 会套上站点的导航和页脚 |
| 页面里的一段 | `design/sections/<name>.html` | 由研发插到目标页面 |
| 页面里的一小块 | `design/fragments/<name>.html` + `<name>.css` | 编译成小组件，插一行即可用 |

- 素材放 `design/assets/`，用相对路径引用：`../assets/hero.svg`。
- 文件名以 `_` 开头会被跳过，可以留练习稿。
- **只做一张卡片、一个按钮也算合格交付**，不必为了"完整"补全整页。
- 只改 `design/` 目录。本分支上只有设计稿和文档，不要新建工程脚手架、`package.json`、`src/` 或 CI 配置。

## 2. 你的稿子会被插进哪里

站点结构：`导航栏（sticky）→ page-body（你的内容）→ 页脚（深色）`。

- **不要自己写导航栏和页脚**，也不要写页面最外层容器。
- **不要自己补 `padding-top`**：导航是 sticky 且在文档流里占位。实测 `.page-body` 的 `padding-top` 在 1440 / 900 / 700 / 590 四个宽度下计算值都是 `0px`；自己加只会出现双倍留白。
- 容器宽度（实测）：

| 现有类名 | 大屏 | 小屏 | 用途 |
| --- | --- | --- | --- |
| `.page-hero` | 1140px，内边距 48px | ≤960px 贴满，内边距 24px→20px | 内页 hero |
| `.redesign-shell` | 1200px，无内边距 | `100% - 32px` | 首页/宽区块 |

  自己写就照同样的写法：

```css
.my-block {
  width: min(100% - 64px, 1140px);
  margin-inline: auto;
}
@media (max-width: 760px) {
  .my-block {
    width: calc(100% - 40px);
  }
}
```

- 可以借用 `.page-hero`、`.redesign-shell`、`.sec-label` 的类名，但**不要改它们的全局定义**。

## 3. 设计 token（用这些，别另立一套）

在浏览器里取到的实际生效值（`official-home.css` 定义，`prototype-parity.css` 覆盖）：

```css
--noumi-paper: #f5f3ee;  /* 页面底色，实测 body 背景就是它 */
--noumi-lite:  #fcfaf3;  /* 浅背景块 */
--noumi-dark:  #3b3f43;  /* 正文 / 深色页脚底色 */
--noumi-blue:  #4d72c2;  /* 强调色、链接、主按钮 */
--noumi-muted: #6e86a4;  /* 次要文字 */
--noumi-line:  rgba(59, 63, 67, 0.16);
--max-w:       1140px;
/* 别名（值与上面完全相同，别当成两套色）：
   --cream=--noumi-paper, --accent=--noumi-blue, --ink/--ink-soft=--noumi-dark, --ink-muted=--noumi-muted */
```

写成 `var(--noumi-blue, #4d72c2)` 这种带兜底的形式，单独打开稿子也不会失色。

字体：站点已内置，**不要引入外部字体**。

- 当前生效：`--ff-display` = `'Noto Serif SC'`，`--ff-body` = `'Noto Sans SC'`（`prototype-parity.css` 覆盖了 `official-base.css` 的 `'Funnel Display'` / `'Inter'`）。
- **首选 `var(--ff-display)` / `var(--ff-body)`**；硬写 `'Funnel Display'` 不会生效，因为 body 实际是 `'Noto Sans SC'`。
- 确实需要英文无衬线时 `'Inter'`、`'Funnel Display'` 也可用，但要显式写在具体元素上。

字号（实测）：

| 元素 | 1440 | 760 | 390 |
| --- | --- | --- | --- |
| `.page-hero h1` | 48px / 500 | 32px / 500 | 32px / 500 |
| 首页主标题 `.redesign-hero__title-main` | 48px | 48px | 35.1px |
| 区块标题 `.redesign-section-heading h2` | 30px / 600 | 26px / 600 | 26px / 600 |
| 小标题 `.sec-label` | 14px / 700 | 14px | 14px |
| 正文 | 16–18px，行高 1.4–1.7 | | |

## 4. 断点

用这几档，别加新的：**960 / 760 / 600**（900、767 是现有代码里的历史档位，可以沿用但不要引入更多）。

- 从 1440px 桌面宽度开始设计，再收 960 / 760 / 600 三档。
- ≤600px 时导航是 fixed，你不用管它，只要保证内容不横向溢出。

## 5. 交互

**不要写 `<script>`**，也不要引入任何 JS 库。稿子里只写**纯 CSS 的** `:hover` / `:focus-visible` / `transition` / `@keyframes`，并且**必须**配降级：

```css
@media (prefers-reduced-motion: reduce) {
  .my-card {
    transition: none;
  }
}
```

需要 JS 才能做的效果（滚动入场、指针跟随、自动播放轮播、点击后加载视频等），**不要自己实现**，在 PR 描述里写清"哪个元素、在什么时机、动什么"，由我们在产品仓库里实现——站点已经有现成的实现可复用，不需要新依赖。

参考：现有原型页的滚动入场、`<details>` 展开折叠、标签切换（`role="tab"`）、轮播、图片跟随指针、视频点击后加载 YouTube iframe，都是这么做的。

## 6. 硬性禁止

- `<script>`、内联事件属性（`onclick`）、任何框架源文件（`.vue` / `.jsx` / `.tsx` / `.svelte`）
- 外链资源：其他站点的图片、CDN、Google Fonts、外站视频
- `position: fixed` 的全屏覆盖层；自己实现的导航栏 / 页脚 / Cookie 弹窗
- 真实表单提交（`<form action=...>`）、真实登录框
- 真实密钥、内部数据、未公开用户信息

## 7. 自查清单

- [ ] 1440 / 960 / 760 / 390 四个宽度都不出现横向滚动条
- [ ] 图片有 `alt`，装饰图用 `alt=""`
- [ ] 标题从 `<h2>` 起（页面 `<h1>` 由站点提供），不跳级
- [ ] 正文对比度 ≥ 4.5:1（`--noumi-muted` 只用于次要文字，别拿它当正文）
- [ ] 链接和按钮有可见的 `:focus-visible` 样式
- [ ] 颜色、字体全部来自第 3 节，没有新造色值
- [ ] 动效有 `prefers-reduced-motion` 降级
- [ ] 没有 `<script>`、外链资源、`position: fixed` 全屏层
- [ ] 只改了 `design/` 目录

## 8. 参考素材

- 线上效果：<https://noumi.ai>（`/features`、`/pricing`、`/faqs`、`/use-cases` 是设计稿编译产物，可直接对版）
- **现成页面的真实 HTML**：<https://github.com/langcore-ai/noumi-official-website/blob/main/src/lib/site/prototype/pages.json>（24 个页面的标记与标题），要抄结构就抄这里
- 样式来源（都在产品仓库的 `main` 分支上，本分支里没有这些文件）：
  - <https://github.com/langcore-ai/noumi-official-website/blob/main/src/app/(frontend)/official-base.css>（基础排版）
  - <https://github.com/langcore-ai/noumi-official-website/blob/main/src/app/(frontend)/official-home.css>（主题变量）
  - <https://github.com/langcore-ai/noumi-official-website/blob/main/src/app/(frontend)/prototype-parity.css>（最终覆盖值，**配色以此为准**）
  - <https://github.com/langcore-ai/noumi-official-website/blob/main/src/app/(frontend)/prototype-pages.css>（原型页适配）
- 区块写法：<https://github.com/langcore-ai/noumi-official-website/blob/main/src/components/site/official/OfficialContentSections.tsx>
- 导航与页脚（不用你写，知道长什么样即可）：<https://github.com/langcore-ai/noumi-official-website/blob/main/src/components/site/SiteHeader.tsx>、<https://github.com/langcore-ai/noumi-official-website/blob/main/src/components/site/SiteFooter.tsx>

**本分支不含产品代码**：上面这些链接指向产品仓库的 `main` 分支，只读参考，不要试图在本分支里找到它们。

用浏览器打开你写的 HTML 就能看效果；想看套上真实导航/页脚的样子，发 PR 后预览链接会贴在 PR 评论里。
