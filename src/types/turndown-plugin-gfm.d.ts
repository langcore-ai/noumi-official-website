/**
 * `turndown-plugin-gfm` 未提供类型声明（npm 上无 @types 包），这里按官方导出手工声明。
 */
declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown'

  /** 一次性启用表格、删除线与任务列表的 GFM 插件。 */
  export const gfm: TurndownService.Plugin
  /** 仅表格转换。 */
  export const tables: TurndownService.Plugin
  /** 仅删除线转换。 */
  export const strikethrough: TurndownService.Plugin
  /** 仅任务列表转换。 */
  export const taskListItems: TurndownService.Plugin
}
