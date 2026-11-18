# 用户观测总表埋点方案(全量 74 列映射)

来源:《NOUMI 用户观测总表》(2026-11)。每个验证周期 10 名用户,按 `visitor_id` 归因。
事件分三个出口:

- **官网 PostHog**(`noumi-official-website`,同源中继 `/api/site/analytics/events`) — 已实现
- **产品 PostHog**(产品仓库实施,事件名/属性按下表)
- **会话回放(rrweb)** — 主观列的证据来源,运营看回放填写,不设事件

所有产品事件统一携带:`visitor_id`、`device`、`session_id`(沿用官网 `first_touch_*` 归因参数透传)。

## 〇 用户画像(列 1–5)

| 列 | 归属 | 说明 |
|---|---|---|
| 1 用户来源/渠道 | 官网 `landing_page_viewed` 的 `utm_source` + 运营台账 | 广告/社媒走 utm;BD 邀约、转介绍由运营在台账标注 |
| 2 所属验证周期 | 运营台账 | 人工分组,无事件 |
| 3 用户画像等级 | 运营台账 | 主观分级 |
| 4 初次消息建联日期 | 运营台账 | IM 系统数据 |
| 5 注册日期(Dx) | 产品事件 `account_registered`(timestamp 即注册时间) | |

## 一 第一阶段:Onboarding

### 1.1 官网→产品路径(列 6–11)

| 列 | 事件 | 属性 | 状态 |
|---|---|---|---|
| 6 从官网进入产品 | 官网 `official_cta_clicked` / `official_product_auth_redirected`;产品侧 `first_touch_landing_page` 参数非空即为官网来源 | `cta_id`,`target_path` | ✅ 官网已埋 |
| 7 官网停留时长 | 官网 `official_page_engagement` 求和 | `duration_ms`,`status` | ✅ 已埋 |
| 8 官网浏览路径/停留页面 | 官网 `$pageview` + `page_path` | `page_group` | ✅ 已埋 |
| 9 使用设备 | 所有事件带 `device` | `mobile/tablet/desktop` | ✅ 已埋 |
| 10 注册/登录中的卡点 | 产品 `auth_flow_blocked` | `step`(email_code/password/invite_check…),`error_kind` | ⬜ 产品仓库 |
| 11 选择的职业 | 产品 `onboarding_profile_submitted` | `profession`(选项/自填文本,≤96 字) | ⬜ 产品仓库 |

### 1.3 示例项目(列 12–17)

| 列 | 事件 | 属性 | 状态 |
|---|---|---|---|
| 12 选择的感兴趣任务 | 产品 `onboarding_task_selected` | `task_key`(A–F) | ⬜ 产品仓库 |
| 13 注册完成到示例项目展示成果的时间 | 产品 `sample_project_result_ready` | `elapsed_ms`(自注册 timestamp 差值,客户端算不出时由服务端算) | ⬜ 产品仓库 |
| 14 是否翻看成果文件 | 产品 `sample_result_opened` | `file_type` | ⬜ 产品仓库 |
| 15 成果文件惊艳程度 | 会话回放 | 主观 | 回放 |
| 16 点赞/点踩(示例) | 产品 `sample_result_rated` | `rating`(up/down),`surface`(sample) | ⬜ 产品仓库 |
| 17 看完后的下一步 | 产品 `sample_result_next_action` | `action`(edit_result/start_task/view_other_sample/leave) | ⬜ 产品仓库 |

### 1.4 开始正式任务(列 18–22)

| 列 | 事件 | 属性 | 状态 |
|---|---|---|---|
| 18 是否开始正式任务 | 产品 `real_task_started`(与 `task_created` 区分:示例任务不发此事件) | `task_type` | ⬜ 产品仓库 |
| 19 未开始的原因/停留位置 | 产品 `funnel_stalled` | `step`,`idle_ms` | ⬜ 产品仓库 |
| 20 Bridge 是否点击气泡引导 | 产品 `bridge_bubble_clicked` | `bubble_id` | ⬜ 产品仓库 |
| 21 Bridge 点击后是否发送气泡 prompt | 产品 `bridge_prompt_sent` | `from_bubble`(true) | ⬜ 产品仓库 |
| 22 气泡 prompt 是否被修改后再发送 | 产品 `bridge_prompt_sent` 加属性 | `edited_before_send`(对比气泡原文 diff) | ⬜ 产品仓库 |

## 二 第二阶段:首个真实任务

| 列 | 事件 | 属性 | 状态 |
|---|---|---|---|
| 23 首个真实任务的小时数 | `real_task_started` 与 `task_succeeded` 时间差 | 服务端计算 | ⬜ 产品仓库 |
| 24 任务类型 | `real_task_started.task_type` | rfp/bid/quotation/proposal/ppt/architecture/flowchart/other | ⬜ 产品仓库 |
| 25 上传资料(数量/类型) | 产品 `files_uploaded` | `count`,`extensions`(≤96 字符枚举串) | ⬜ 产品仓库 |
| 26 任务成功完成 | 产品 `task_succeeded` / `task_failed` | `error_kind` | ⬜ 产品仓库 |
| 27 断点 | `task_failed.step` 或 `task_stalled.step` | upload/wait/error/none | ⬜ 产品仓库 |
| 28 任务完成质量(1–5) | 会话回放 + 成果抽样 | 主观 | 回放 |
| 29 任务完成所需时间(分钟) | 服务端由任务起止时间算 | — | ⬜ 派生 |
| 30 交互轮次 | `task_completed` 加属性 | `turn_count`(服务端计) | ⬜ 产品仓库 |
| 31 对话反馈摘录 | 会话回放 | 主观 | 回放 |
| 32 有审查/编辑行为 | 产品 `artifact_edited` | `artifact_id`,`surface` | ⬜ 产品仓库 |
| 33 下载 | 产品 `artifact_downloaded` | `file_type` | ⬜ 产品仓库 |
| 34 分享/转发 | 产品 `artifact_shared` | `channel` | ⬜ 产品仓库 |
| 35 点赞/点踩 | 产品 `artifact_rated` | `rating`(up/down) | ⬜ 产品仓库 |
| 36 满意度综合评级 | 会话回放 | 主观 | 回放 |
| 37 不满意原因/bad case | 会话回放 + `task_failed` | 主观 | 回放 |
| 38 要求"不要瞎编"/纠正事实 | 会话回放(对话内容检索) | 主观 | 回放 |

## 三 探索性验证(列 39–45)

| 列 | 事件 | 属性 | 状态 |
|---|---|---|---|
| 39 等待中首先去的区域 | 产品 `idle_area_visited`(任务运行期间首次切换区域时发一次) | `area`(settings/artifact/files/preview/sample_results/switch_topic/home/none) | ⬜ 产品仓库 |
| 40 完整探索路径 | `idle_area_visited` 序列 + `area_switched` | `area` | ⬜ 产品仓库 |
| 41 返回情况 | `session_returned`(从探索区域返回原会话) | `mode`(smooth/explore_return/lost) | ⬜ 产品仓库 |
| 42 探索路径(返回) | `area_switched` 序列 | 同上 | ⬜ 产品仓库 |
| 43 迷失路径与堵塞点 | 会话回放 + `funnel_stalled` | 主观 | 回放 |
| 44 成功新建第一个 project 的日期 | 产品 `project_created`(首次) | `elapsed_since_register_ms` | ⬜ 产品仓库 |
| 45 第一个 project 的名字 | `project_created` | `project_name`(≤96 字符;名字不敏感但需截断) | ⬜ 产品仓库 |

## 四 持续运营(列 46–73,均为派生指标)

不逐日埋事件;由产品 PostHog 现有事件(`real_task_started`、prompt 发送、任务运行时长事件)按 `visitor_id` 聚合:

- **活跃天数**(46/62/66/70):按天去重的事件日期计数,D1–D7 逐日、D8–28 按周;
- **Task 数**(48–54):`task_created` 按天计数;
- **任务运行总时长**(55–61):任务运行时长事件按天求和;
- **Prompt 数**(63/67/71/68/72):prompt 发送事件计数;
- **典型任务描述**(47/65/69/73):会话回放抽样,人工补注。

派生查询建议放产品侧 PostHog Insights/SQL,或用现有 `conversion-admin-api` 模式做一张运营看板。

## 实施顺序建议

1. 官网侧 5 个事件 — ✅ 已完成(本次提交)
2. 产品侧事件 schema 先定(P0:11/12/16/18/20–22/33/34/35/39/44;P1:其余)
3. 留存派生指标看板
4. 运营台账(渠道/周期/画像等级)与回放证据链接接通
