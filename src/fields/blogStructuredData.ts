import type { Field, JSONField, Plugin } from 'payload'

/** JSON-LD 独立于正文保存，禁止把 script 标签或 JSON 字符串当成数据提交。 */
export const blogStructuredDataField: JSONField = {
  name: 'structuredData',
  type: 'json',
  label: 'JSON-LD 结构化数据',
  localized: true,
  admin: {
    description:
      '填写 JSON 对象或对象数组（支持 @graph），不要包含 <script> 标签。发布后输出到文章页面；留空不输出自定义数据。',
  },
  validate: (value, { jsonError }) =>
    jsonError ? '请输入合法的 JSON。' : validateBlogStructuredData(value),
}

/** 在 SEO 插件生成字段后，仅扩展博客的 meta 分组，避免重复注册 SEO 端点。 */
export const addBlogStructuredData: Plugin = (config) => {
  const extendFields = (fields: Field[]): Field[] =>
    fields.map((field) => {
      if (field.type === 'group' && 'name' in field && field.name === 'meta') {
        return { ...field, fields: [...field.fields, blogStructuredDataField] }
      }
      if (field.type === 'tabs') {
        return {
          ...field,
          tabs: field.tabs.map((tab) => ({ ...tab, fields: extendFields(tab.fields) })),
        }
      }
      return field
    })

  return {
    ...config,
    collections: config.collections?.map((collection) =>
      collection.slug === 'blog-posts'
        ? { ...collection, fields: extendFields(collection.fields) }
        : collection,
    ),
  }
}

/** Payload 的 JSON 字段在运行时传入已解析的值。 */
export function validateBlogStructuredData(value: unknown): true | string {
  if (value == null) return true
  const isObject = (item: unknown) =>
    item !== null && typeof item === 'object' && !Array.isArray(item)
  return (
    (Array.isArray(value) ? value.length > 0 && value.every(isObject) : isObject(value)) ||
    '请输入 JSON-LD 对象或非空对象数组，不要填写字符串、数字或 script 标签。'
  )
}
