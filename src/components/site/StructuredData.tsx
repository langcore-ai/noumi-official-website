/**
 * 输出页面结构化数据脚本
 * @param props 结构化数据对象
 * @returns JSON-LD script 标签
 */
export function StructuredData<T extends object>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      // 这里直接输出 JSON-LD，避免前端再拼装字符串导致字段遗漏
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
