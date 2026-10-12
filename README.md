# Noumi 官网设计稿

非研发同学在这里做 `noumi.ai` 的前端设计稿。

- **本地环境与提交（先看这个）**：[`SETUP.md`](SETUP.md)
- 提交流程与交付格式：[`design/AGENTS.md`](design/AGENTS.md)
- 写稿规范（设计 token / 字体 / 宽度 / 断点 / 禁止项）：[`.agents/skills/noumi-design/SKILL.md`](.agents/skills/noumi-design/SKILL.md)
- 示例：`design/pages/_example.html`

这个分支不含产品代码。设计稿合进来后，由我们编译成产物并通过 PR 合入产品分支，线上只读编译后的产物。

```
design/
├── pages/       整页      design/pages/pricing.html
├── sections/    页面里一段 design/sections/home-showcase.html
├── fragments/   页面里一小块 design/fragments/cta-banner.html (+ .css)
└── assets/      图片/字体  design/assets/hero.png
```
