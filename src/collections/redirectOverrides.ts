import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { publicPath, resolveManagedRedirect } from '@/lib/site/managed-routing'

export const validateRedirect: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const merged = { ...originalDoc, ...data }
  if (!merged.from) return data
  try {
    data.from = publicPath(merged.from)
  } catch (error) {
    throw new APIError(error instanceof Error ? error.message : '无效来源路径', 400)
  }
  let target = merged.to?.url
  if (merged.to?.type === 'reference' && merged.to?.reference) {
    const ref = merged.to.reference
    const id = typeof ref.value === 'object' ? ref.value.id : ref.value
    const doc = await req.payload.findByID({
      collection: ref.relationTo,
      id,
      req,
      overrideAccess: false,
      depth: 0,
    })
    const prefix =
      ref.relationTo === 'blog-posts'
        ? '/blog'
        : ref.relationTo === 'feature-pages'
          ? '/features'
          : '/use-cases'
    target = `${prefix}/${'slug' in doc ? doc.slug : ''}`
  }
  if (!target) return data
  try {
    data.resolvedTarget = publicPath(target)
  } catch (error) {
    throw new APIError(error instanceof Error ? error.message : '无效目标路径', 400)
  }
  if (data.from === data.resolvedTarget) throw new APIError('来源和目标不能相同', 400)
  // Read-only validation within the same transaction. Inspect published rules only.
  const resolved = await resolveManagedRedirect(data.from, async (path) => {
    if (path === data.from) return { target: data.resolvedTarget, type: merged.type || '301' }
    const found = await req.payload.find({
      collection: 'redirects',
      req,
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: { and: [{ from: { equals: path } }, { _status: { equals: 'published' } }] },
    })
    const rule = found.docs[0]
    return rule?.resolvedTarget ? { target: rule.resolvedTarget, type: rule.type } : null
  })
  if (!resolved) throw new APIError('重定向存在循环或链路过长', 400)
  return data
}
