# Footer 配置发布说明

Footer 的栏目/链接/版权属于 Payload「网站管理 → 菜单配置」数据；样式、社交图标、语言菜单和复制邮箱行为属于代码。开发数据库与生产数据库独立，提交 PR 不会复制后台数据。

当前开发数据已按 `src/lib/site/footer-defaults.json` 配置。上线时：

1. 发布包含 footer 组件及样式的代码。
2. 在正式后台打开「网站管理 → 菜单配置」，先保留当前已发布版本作为回退依据。
3. 仅将 Footer 栏目及版权更新为 `src/lib/site/footer-defaults.json` 的内容；保留 Header、按钮、联系信息等其他设置。
4. 页脚说明填写 `The trustworthy AI teammate for presales & solution consultants.`。保持菜单配置启用并点击发布。
5. 检查正式站三列链接、Contact us 复制、社交链接、版权与语言菜单。若仍显示旧内容，确认发布状态及官网快照刷新情况。

Contact us 使用 `mailto:official@noumi.ai` 作为后台链接值；新组件会把 footer 中的 mailto 链接呈现为复制邮箱按钮。其余链接照常跳转。语言列表当前仅用于展示，English 始终选中，其他项不会切换语言。

本次没有修改正式数据库；不导入用户、权限、文章或其他业务数据。
