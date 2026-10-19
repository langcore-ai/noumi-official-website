/** 只在管理员页面按需读取，不将 DOM 或临时签名地址写入持久缓存。 */
export async function readReplay<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/site/replay/${path}`, {
    signal,
    cache: 'no-store',
    credentials: 'same-origin',
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403)
      throw new Error('Administrator access is required. Sign in again to continue.')
    if (response.status === 404) throw new Error('This recording is unavailable or has expired.')
    throw new Error('Unable to load replay data. Please retry.')
  }
  return response.json() as Promise<T>
}
