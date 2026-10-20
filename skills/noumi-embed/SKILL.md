---
name: noumi-embed
description: 维护 Noumi 官网原生 Use Cases 展示；名称保留作旧 iframe 工作流的入口。
---

先阅读 `docs/USE-CASES-EMBED.md`。该页面已按用户要求移除 iframe，原协议已退役。

- 实现为 `src/components/site/official/OfficialUseCasesGallery.tsx` 和同级 `use-cases/`。
- 保留已认可的 440px 文件区、自适应回复区、原位偏好卡片和真正的大图 modal。
- 样式及 DOM 查询限定在 gallery，不污染官网导航、FAQ 和其他页面。
- 本地预览用 `bun run mode:status`、`mode:reload` 或 `mode:start`，不要另启 next dev。
- 修改后运行类型检查、importmap、相关测试及实际浏览器复测。
- 提交/发布依用户当次授权；不要恢复外部站点依赖或 iframe 高度协议。
