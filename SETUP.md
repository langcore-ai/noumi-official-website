# 本地环境与提交（给做设计稿的同学）

目标：**5 分钟内把环境跑起来，能边看效果边改，做完能提交上来。** 你不需要懂前端工程，也不需要装一堆东西。

---

## 0. 你需要什么 / 不需要什么

| 需要 | 说明 |
| --- | --- |
| 一个浏览器 | Chrome / Edge / Safari 都行，用来随时看你的稿子 |
| Git 客户端（可选） | 命令行 git、GitHub Desktop 都行。**不想装也能交**，见第 4 节的方式 A |
| 你习惯的 AI 工具 | Cursor / Claude Code / Codex / VS Code + Copilot / 网页版 v0、Figma Make……都行，见第 3 节 |

| 不需要 | 说明 |
| --- | --- |
| Node / Bun / pnpm / npm | 这个分支里没有任何需要编译的东西，**不要跑 `npm install`** |
| `.env` 或任何密钥 | 我们不会给你密钥，你也不要向我们索要 |
| 数据库 / Docker / 云平台账号 | 完全用不到 |

> 这个分支（`design/workbench`）里**只有设计稿和文档，没有产品代码**。这是故意的：让 AI 打开时看到的是纯设计上下文，不会被工程代码带偏。

---

## 1. 把设计分支拿到本地

⚠️ **最容易踩的坑**：直接 `git clone <仓库地址>` 拿到的是产品分支 `main`，里面有 735 个文件、一堆你不需要的代码。**必须指定分支**：

```bash
git clone --single-branch --branch design/workbench https://github.com/langcore-ai/noumi-official-website.git noumi-design
cd noumi-design
```

（写成一行是故意的：Windows 的 PowerShell 不认 `\` 换行，复制粘贴会失败。）

- 用 **GitHub Desktop**：`File → Clone repository → URL` 填上面地址，克隆后切到 `design/workbench` 分支。
- 只想看看不动手：直接在浏览器打开 <https://github.com/langcore-ai/noumi-official-website/tree/design/workbench>。
- 克隆下来应该**只有十几个文件**（`design/`、`.agents/`、`tools/`、几个 md）。如果你看到 `src/`、`package.json`，说明分支选错了。

目录长这样：

```
design/pages/       你放"一个完整页面"的地方
design/sections/    你放"页面里一段"的地方
design/fragments/   你放"页面里一小块"的地方
design/assets/      图片、图标、字体
tools/              只读工具（拉参考样式用）
```

---

## 2. 拉一份"现有样式"参考（推荐，可选）

想让新稿子看起来和线上是一套东西，读现有样式是最快的。本分支没有代码，用这个脚本按白名单从 `main` 取一份**只读快照**：

```bash
bash tools/fetch-main-styles.sh
```

- 输出到 `.main-reference/`，**已在 `.gitignore` 里，不会被提交**。
- Windows 用户用 **Git Bash** 跑；没有 bash 也没关系，第 2 节的内容都可以在 GitHub 上点开看。
- 拉下来的是 27 个文件：站点全部前端 CSS、导航/页脚组件、24 个既有页面的真实 HTML、字体表。

**允许看的**就是上面这些（视觉、DOM、字体）；**不用看** CMS、数据库、部署配置那些，和视觉无关。

---

## 3. 在什么环境里 vibecoding

**推荐：本地编辑器 + AI 助手。**

1. 用 Cursor / VS Code 打开 `noumi-design` 目录（就是第 1 步克隆下来的文件夹）。
2. 仓库里带了给 AI 看的说明，它会自动读到：
   - 根目录 `AGENTS.md` → 指路
   - `design/AGENTS.md` → 流程与交付格式
   - **`.agents/skills/noumi-design/SKILL.md` → 写稿规范**（设计 token、字体、容器宽度、断点、禁止项、自查清单）
3. 如果 AI 没有主动读 skill，直接对它说：

   > 先读 `.agents/skills/noumi-design/SKILL.md`，然后按里面的规范帮我做 `design/sections/xxx.html`

**也可以：网页版 AI（v0 / Figma Make / ChatGPT / Claude 网页版等）。** 做法是先在网页里把设计做出来，导出 HTML + CSS + 图片，再按第 1 节的目录结构存到本地。注意：**最终交上来的必须是渲染后的 HTML/CSS/图片**，不要交 `.vue` / `.jsx` / `.tsx` 源文件——我们不会引入第二个前端框架，框架逻辑到我们这边就丢了。

**不管用哪种工具，让 AI 记住这几条**（skill 里都写了）：

- 只改 `design/` 目录；
- 只写导航栏和页脚之间的内容，不要自己写导航栏、页脚、Cookie 弹窗；
- 只用 HTML + CSS，不要写 `<script>`；
- 颜色、字体用站点已有的变量，不要自创一套。

---

## 4. 本地看效果

**最简单的**：直接双击你写的 HTML，用浏览器打开。

**想带上站点真实样式**（变量、字体、间距都会生效）：把第 2 节拉下来的快照样式表临时挂到 `<head>` 里（路径是相对的，写在 `design/pages/` 或 `design/fragments/` 下都一样）：

```html
<link rel="stylesheet" href="../../.main-reference/src/app/(frontend)/styles.css" />
<link rel="stylesheet" href="../../.main-reference/src/app/(frontend)/official-base.css" />
<link rel="stylesheet" href="../../.main-reference/src/app/(frontend)/official-home.css" />
<link rel="stylesheet" href="../../.main-reference/src/app/(frontend)/prototype-parity.css" />
<link rel="stylesheet" href="../../.main-reference/src/app/(frontend)/prototype-pages.css" />
```

- 这**只是给你本地预览用的**，提交前请把这几个 `<link>` 删掉（稿子里不要带）。
- 字体在本地可能回退成 Times New Roman 之类的系统字体，**属正常**，不代表你写错了。
- 建议至少看 **1440 / 960 / 760 / 390** 四个宽度，别出现横向滚动条。

---

## 5. 提交上去

### 方式 A：网页上传（不用装任何东西，推荐给不熟 Git 的同学）

1. 打开 <https://github.com/langcore-ai/noumi-official-website>，把分支切到 **`design/workbench`**。
2. 进到要放稿子的目录（比如 `design/sections/`），点 **`Add file → Upload files`**，把你的 HTML/CSS/图片拖进去。
3. 页面下方填一句说明，选择 **`Create a new branch for this commit`**，分支名写 `design/你的页面名`，提交。
4. 点 **`Compare & pull request`**，**确认 base 分支是 `design/workbench`**（不要选 `main`），然后创建 PR。

### 方式 B：命令行

```bash
git switch -c design/你的页面名          # 从 design/workbench 拉一个新分支
# 把稿子放进 design/pages|sections|fragments，素材放进 design/assets
git add design/
git commit -m "design: 定价页 hero 改版"
git push -u origin design/你的页面名
```

推送后按终端提示打开链接创建 PR，**base 选 `design/workbench`**。

### ⚠️ PR 目标分支必须是 `design/workbench`

选 `main` 会走错流程，我们会把它关掉让你重开。你不需要碰 `main`，也不需要合并任何东西。

### PR 描述里请写清楚

- **改的是哪个页面**（线上 URL，例如 `https://noumi.ai/pricing`）或"新增页面"；
- **交付单位**：整页 / 区块 / 一小块；
- **需要动效的地方**：哪个元素、什么时机、动什么（我们来实现，你不用写 JS）。

---

## 6. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 克隆下来有一大堆代码 | 克隆的是 `main`。用第 1 节的命令，指定 `--branch design/workbench` |
| `bash: command not found` / 脚本跑不了 | Windows 用 Git Bash；或跳过第 2 节，直接看 GitHub 上的链接 |
| 颜色/字体变量不生效，样式很丑 | 没挂站点样式表。按第 4 节把 5 个 `<link>` 加上 |
| 字体变成 Times New Roman | 本地没有站点字体资源，正常现象，提交后线上是正常的 |
| 找不到 `.agents` 目录 | 名字以点开头。macOS 的 Finder 默认隐藏，按 `Cmd+Shift+.` 显示；Windows 资源管理器默认就显示 |
| 想拿到我们后来更新的说明 | 在克隆目录里执行 `git pull`（分支就是 `design/workbench`） |
| `git switch` 报错不认识 | 你的 git 太老，把 `git switch -c xxx` 换成 `git checkout -b xxx` |
| 提交时被要求填密钥 | 不需要任何密钥。请勿粘贴 `.env`、token 或内部数据 |
| 图片太大推不上去 | 单次提交图片总量控制在 8MB 内，更大的先找我们 |
| 不确定能不能这么做 | 直接开 PR 问，或在 PR 里 @ 我们 |

---

## 7. 提交之后

我们合入 `design/workbench` 后，会把它编译成站点产物、开 PR 合进产品分支，**你不需要再做任何事**。设计稿永远以数据形态上线，不会把你的工具链带进生产。出问题回滚一次提交即可。

完整规范（设计 token、字体、容器宽度、断点、禁止项、自查清单）在 `.agents/skills/noumi-design/SKILL.md`；交付格式的细节在 `design/AGENTS.md`。
