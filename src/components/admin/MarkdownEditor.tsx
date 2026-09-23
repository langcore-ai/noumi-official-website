'use client'

import { useField } from '@payloadcms/ui'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { TextareaFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

import './MarkdownEditor.css'

/**
 * 读取字段标签文案（兼容静态字符串与多语言对象）。
 * @param label 字段 label 配置
 * @returns 展示文案
 */
function readLabelText(label: unknown): string {
  if (typeof label === 'string' && label.trim()) {
    return label
  }

  if (label && typeof label === 'object') {
    const localized = label as Record<string, unknown>
    for (const key of ['zh', 'en']) {
      const value = localized[key]
      if (typeof value === 'string' && value.trim()) {
        return value
      }
    }
  }

  return 'Markdown 内容'
}

/**
 * 后台 Markdown 分栏编辑器：左侧原稿、右侧实时预览。
 * 预览走 marked + DOMPurify，与服务端 rehype-sanitize 白名单保持同等安全边界。
 */
export const MarkdownEditor: TextareaFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const [previewHtml, setPreviewHtml] = useState('')

  const markdown = value ?? ''

  useEffect(() => {
    setPreviewHtml(DOMPurify.sanitize(marked.parse(markdown, { async: false })))
  }, [markdown])

  const description =
    typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="markdown-editor">
      <div className="markdown-editor__label">{readLabelText(field.label)}</div>
      {description ? <p className="markdown-editor__description">{description}</p> : null}

      <div className="markdown-editor__panes">
        <section className="markdown-editor__pane">
          <header className="markdown-editor__pane-title">Markdown 原稿</header>
          <textarea
            className="markdown-editor__input"
            onChange={(event) => setValue(event.target.value)}
            rows={26}
            spellCheck={false}
            value={markdown}
          />
          <footer className="markdown-editor__counter">{markdown.length} 字符</footer>
        </section>

        <section className="markdown-editor__pane">
          <header className="markdown-editor__pane-title">实时预览</header>
          <div
            className="markdown-editor__preview"
            // 已过 DOMPurify 白名单，可安全注入。
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </section>
      </div>

      {showError && errorMessage ? (
        <div className="markdown-editor__error">{errorMessage}</div>
      ) : null}
    </div>
  )
}
