/** Shared by Payload validation, Next middleware and the Cloudflare entrypoint. */
export function publicPath(value: string): string {
  const input = decodeURIComponent(value.trim())
  if (
    !input ||
    /[\\\s?#]/.test(input) ||
    input.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(input)
  )
    throw new Error('请填写站内路径，例如 /about')
  const url = new URL(input.startsWith('/') ? input : `/${input}`, 'https://noumi.invalid')
  const path = url.pathname.replace(/\/+$/, '') || '/'
  if (/^\/(api|admin|_next|assets|cdn-cgi)(\/|$)/.test(path))
    throw new Error('不能配置系统或资源路径')
  return path
}

export function safeHref(value: string): boolean {
  return /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(value) && !/[\\\u0000-\u0020]/.test(value)
}

export type ManagedRedirect = { target: string; type: string }
export async function resolveManagedRedirect(
  path: string,
  lookup: (path: string) => Promise<ManagedRedirect | null>,
): Promise<ManagedRedirect | null> {
  let current: string
  try {
    current = publicPath(path)
  } catch {
    return null
  }
  const visited = new Set<string>()
  let first: ManagedRedirect | null = null
  for (let hop = 0; hop < 16; hop++) {
    if (visited.has(current)) return null
    visited.add(current)
    const rule = await lookup(current)
    if (!rule) return first
    let target: string
    try {
      target = publicPath(rule.target)
    } catch {
      return null
    }
    if (!['301', '302'].includes(rule.type)) return null
    // Preserve the first rule's status; collapse the chain to avoid multiple HTTP hops.
    first = { target, type: first?.type ?? rule.type }
    current = target
  }
  return null
}
