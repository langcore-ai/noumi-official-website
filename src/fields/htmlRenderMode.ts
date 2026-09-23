import type { Condition, Field, TextareaFieldValidation } from 'payload'

import { htmlModeFieldAccess } from '@/access/cms'

/**
 * 页面渲染模式字段数据
 */
export type HtmlRenderModeSiblingData = {
  /** 前台渲染模式 */
  renderMode?: 'html' | 'markdown' | 'template' | null
}

/**
 * 判断字段是否应在默认模板模式下显示
 */
export const isTemplateRenderMode: Condition<any, HtmlRenderModeSiblingData> = (_, siblingData) =>
  siblingData.renderMode !== 'html' && siblingData.renderMode !== 'markdown'

/**
 * 判断字段是否应在 HTML 模式下显示
 */
export const isHtmlRenderMode: Condition<any, HtmlRenderModeSiblingData> = (_, siblingData) =>
  siblingData.renderMode === 'html'

/**
 * 判断字段是否应在 Markdown 模式下显示
 */
export const isMarkdownRenderMode: Condition<any, HtmlRenderModeSiblingData> = (_, siblingData) =>
  siblingData.renderMode === 'markdown'

/**
 * 判断字段是否应在卡片类模式（HTML/Markdown）下显示
 * 卡片字段（htmlCard*）同时服务于 HTML 与 Markdown 两种模式的列表展示。
 */
export const isCardRenderMode: Condition<any, HtmlRenderModeSiblingData> = (_, siblingData) =>
  siblingData.renderMode === 'html' || siblingData.renderMode === 'markdown'

/** HTML 模式字段仅允许管理员与内容编辑写入 */
export const htmlModeWriteAccess = {
  create: htmlModeFieldAccess,
  update: htmlModeFieldAccess,
}

/**
 * 给默认模板字段追加后台显示条件
 * @param field Payload 字段配置
 * @returns 仅默认模板模式显示的字段配置
 */
export function withTemplateCondition(field: Field): Field {
  return {
    ...field,
    admin: {
      ...('admin' in field ? field.admin : undefined),
      condition: isTemplateRenderMode,
    },
  } as Field
}

/**
 * 校验 HTML 模式必填源码
 */
export const validateHtmlContent: TextareaFieldValidation = (value, { siblingData }) => {
  const renderMode = (siblingData as HtmlRenderModeSiblingData | undefined)?.renderMode

  if (renderMode !== 'html' || value?.trim()) {
    return true
  }

  return 'HTML 模式必须粘贴 HTML 内容。'
}

/**
 * 创建通用页面渲染模式字段
 * @param description 后台说明文案
 * @returns Payload 选择字段
 */
export function createRenderModeField(description: string): Field {
  return {
    name: 'renderMode',
    type: 'select',
    defaultValue: 'template',
    label: '渲染模式',
    options: [
      {
        label: '默认模板模式',
        value: 'template',
      },
      {
        label: 'Markdown 模式',
        value: 'markdown',
      },
      {
        label: 'HTML 模式',
        value: 'html',
      },
    ],
    required: true,
    access: htmlModeWriteAccess,
    admin: {
      description,
    },
  }
}

/**
 * 创建通用 HTML 内容字段
 * @returns Payload 文本域字段
 */
export function createHtmlContentField(): Field {
  return {
    name: 'htmlContent',
    type: 'textarea',
    localized: true,
    label: 'HTML 内容',
    validate: validateHtmlContent,
    access: htmlModeWriteAccess,
    admin: {
      condition: isHtmlRenderMode,
      description: '仅 HTML 模式使用；前台会在 navbar 与 footer 之间直接渲染这段 HTML。',
    },
  }
}

/**
 * 校验 Markdown 模式必填原稿
 */
export const validateMarkdownContent: TextareaFieldValidation = (value, { siblingData }) => {
  const renderMode = (siblingData as HtmlRenderModeSiblingData | undefined)?.renderMode

  if (renderMode !== 'markdown' || value?.trim()) {
    return true
  }

  return 'Markdown 模式必须填写 Markdown 内容。'
}

/**
 * 创建通用 Markdown 内容字段
 * @returns Payload 文本域字段
 */
export function createMarkdownContentField(): Field {
  return {
    name: 'markdownContent',
    type: 'textarea',
    localized: true,
    label: 'Markdown 内容',
    validate: validateMarkdownContent,
    admin: {
      condition: isMarkdownRenderMode,
      description:
        '仅 Markdown 模式使用；支持 GFM 语法（标题/列表/表格/代码块/引用/图片）。渲染时白名单净化，内联脚本与危险属性会被剥离。',
      components: {
        Field: '/components/admin/MarkdownEditor#MarkdownEditor',
      },
    },
  }
}
