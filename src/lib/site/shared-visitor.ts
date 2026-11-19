import { createBrowserUuid } from './browser-uuid'
import { REPLAY_IDENTITY_KEY } from './replay/shared'

/** 官网与产品仅共享观测 ID；它不授予账号或回放读取权限。 */
const VISITOR_COOKIE = 'noumi_visitor_id'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
let fallbackId = ''

/**
 * 计算访客 Cookie 的写入门面。
 *
 * `noumi.ai` 与 `www.noumi.ai` 必须落到同一条 Cookie，否则同一访客会被算成
 * 两个人、官网与产品也无法缝合（断点清单 B1）。因此生产域名统一写
 * `Domain=noumi.ai`；预览域名各存一份，避免污染生产访客。
 *
 * @param location 当前地址
 * @returns Cookie 名称与属性后缀
 */
export function resolveVisitorCookieSettings(location: {
  hostname: string
  protocol: string
}) {
  const production =
    location.hostname === 'noumi.ai' || location.hostname === 'www.noumi.ai'

  return {
    name: production ? VISITOR_COOKIE : `${VISITOR_COOKIE}_preview`,
    attributes: `; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}${
      production ? '; Domain=noumi.ai' : ''
    }`,
  }
}

const cookieSettings = () => resolveVisitorCookieSettings(location)

function saveVisitorId(id: string) {
  fallbackId = id
  try {
    const { name, attributes } = cookieSettings()
    document.cookie = `${name}=${id}; Max-Age=31536000${attributes}`
  } catch {
    /* Cookie 受限时只维持当前文档的观测。 */
  }
  return id
}

/** 优先读取父域 Cookie；仅首次升级时接续当前站点已有的匿名 ID。 */
export function readSharedVisitorId(): string {
  if (typeof window === 'undefined' || !window.location) return ''
  try {
    const { name } = cookieSettings()
    const cookie = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
    const saved = cookie?.slice(name.length + 1)
    if (saved && UUID.test(saved)) return (fallbackId = saved)
  } catch {
    /* 存储受限不影响业务。 */
  }
  // 所有采集入口都先接续旧回放身份，避免初始化顺序决定访客 ID。
  let legacyId: unknown
  try {
    legacyId = JSON.parse(localStorage.getItem(REPLAY_IDENTITY_KEY) ?? 'null')
  } catch {
    /* 旧值损坏或存储受限时生成新身份，不影响页面。 */
  }
  const query = new URLSearchParams(location.search)
  const linked = query.get('source_surface') === 'official' ? query.get('visitor_id') : null
  return saveVisitorId(
    fallbackId ||
      (linked && UUID.test(linked) ? linked : undefined) ||
      (typeof legacyId === 'string' && UUID.test(legacyId) ? legacyId : createBrowserUuid()),
  )
}

/** 官网撤回同意时清除观测 Cookie，不操作登录 Cookie。 */
export function clearSharedVisitorId() {
  fallbackId = ''
  try {
    const { name, attributes } = cookieSettings()
    document.cookie = `${name}=; Max-Age=0${attributes}`
  } catch {
    /* 不阻塞撤回同意。 */
  }
}
