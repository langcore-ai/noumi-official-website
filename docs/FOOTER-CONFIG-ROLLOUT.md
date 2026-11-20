# Footer 配置发布说明

Footer 的栏目/链接/版权属于 Payload「网站管理 → 菜单配置」数据；样式、社交图标、语言菜单和复制邮箱行为属于代码。开发数据库与生产数据库独立，提交 PR 不会复制后台数据。

## 从测试环境同步（推荐）

`bun tooling/infra/footer-sync.ts`（别名 `bun run footer:sync`）只同步页脚三元组：栏目（标题、顺序、隐藏）、每个栏目的链接（文案、href、隐藏）、版权与页脚说明。Header、按钮文案、联系方式等字段保持生产现值。

```bash
bun run footer:sync diff container     # 容器（测试环境）→ 生产的差异，不写入
bun run footer:sync apply container    # 同上，打印差异后要求 --yes
bun run footer:sync apply container --yes   # 备份 → 写入生产 → 回读校验
bun run footer:sync refresh            # 触发生产页面快照刷新
```

来源可为 `container`、`staging`（云端 Preview 草稿，需 `.local/infra/staging.admin.json`）、`production`（生产当前值，用于回退对比），或任意快照文件路径。写入前会把生产现值备份到 `.local/infra/footer-sync/production-before-<时间>.json`；写入后回读已发布内容并再次比较，不一致则以非零码退出。

容器来源通过 SSH 在容器内请求 `127.0.0.1:3000`，不打开额外端口。需要 `NOUMI_DEV_SSH`（形如 `用户名#用户#资产@跳板机`），可选 `NOUMI_DEV_PORT`、`NOUMI_DEV_PSK`、`NOUMI_DEV_CONTAINER`、`NOUMI_DEV_APP_PORT`。生产与 staging 凭据从 `.local/infra/*.admin.json` 或 `.local/*-test-admin.json` 读取，也可用 `PRODUCTION_ADMIN` / `STAGING_ADMIN` 指向其他文件；凭据不写入仓库。

`export <来源>` 会把页脚写回 `src/lib/site/footer-defaults.json`，供新环境初始化使用；改动后需按常规流程提交。

## 手工发布步骤

当前开发数据已按 `src/lib/site/footer-defaults.json` 配置。不使用脚本时：

1. 发布包含 footer 组件及样式的代码。
2. 在正式后台打开「网站管理 → 菜单配置」，先保留当前已发布版本作为回退依据。
3. 仅将 Footer 栏目及版权更新为 `src/lib/site/footer-defaults.json` 的内容；保留 Header、按钮、联系信息等其他设置。
4. 页脚说明填写 `The trustworthy AI teammate for presales & solution consultants.`。保持菜单配置启用并点击发布。
5. 检查正式站三列链接、Contact us 复制、社交链接、版权与语言菜单。若仍显示旧内容，确认发布状态及官网快照刷新情况。

Contact us 使用 `mailto:official@noumi.ai` 作为后台链接值；新组件会把 footer 中的 mailto 链接呈现为复制邮箱按钮。其余链接照常跳转。语言列表当前仅用于展示，English 始终选中，其他项不会切换语言。

本次没有修改正式数据库；不导入用户、权限、文章或其他业务数据。
