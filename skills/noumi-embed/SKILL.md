---
name: noumi-embed
description: 维护 Noumi 官网 Use Cases 跨域 iframe、自动高度和滚动行为；涉及嵌入协议或双方联调时使用。
---

先阅读仓库根目录的 `docs/USE-CASES-EMBED.md`，其中包含双方职责、消息协议及验收方法。

- 官网实现位于 `src/components/site/official/OfficialUseCasesEmbed.tsx`。此仓库只负责父页面，不默认修改或发布外部展示站点。
- 保持 origin 和 source 双重校验。未收到有效高度时保留滚动兜底，不用强制隐藏滚动条冒充自动高度。
- 不能读取跨域 DOM；父侧只因宽度变化请求测量，避免因设置高度产生反馈循环。
- 协议改动同步更新文档，并说明对子站点的兼容性影响。外站尚未适配时，模拟消息测试不能替代真实联调。
- 本地预览使用 `bun run mode:status`，已有模式用 `bun run mode:reload`，无模式用 `bun run mode:local up`。不要另启 `next dev`。
- 修改组件后执行 `bunx tsc --noEmit`、`bun run generate:importmap` 和针对性的协议测试。
