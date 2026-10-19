import { replayRoute as productAnalyticsRoute } from './shared'

/** 凭据输入和显式私有区域始终遮罩，包括切换为明文显示的密码框。 */
export const PRODUCT_REPLAY_PRIVATE_SELECTOR =
  '[data-private],.rr-mask,[data-slot="input-otp-group"],[data-slot="input-otp-slot"],input[type="password"],input[autocomplete="one-time-code"],input[autocomplete="current-password"],input[autocomplete="new-password"],input[name*="password" i],input[id*="password" i],input[name*="secret" i],input[id*="secret" i],input[name*="token" i],input[id*="token" i],input[name*="api-key" i],input[id*="api-key" i]'

/** 普通正文保留；额外清除正文中可识别的密钥和 Bearer/JWT 凭据。 */
export function redactReplayCredentials(text: string): string {
  return text
    .replace(/\b(?:secret_key_rr_|sk-(?:proj-)?)[a-zA-Z0-9_-]{12,}/gu, '[redacted]')
    .replace(/\bBearer\s+[a-zA-Z0-9._~+/-]+=*/giu, 'Bearer [redacted]')
    .replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/gu, '[redacted]')
}

/** 由 recorder 在快照及增量阶段统一调用，不依赖事后清洗才能保护密码。 */
export function maskProductReplayText(text: string, element?: HTMLElement | null): string {
  return element?.closest(PRODUCT_REPLAY_PRIVATE_SELECTOR)
    ? text.replace(/\S/gu, '*')
    : redactReplayCredentials(text)
}

const SAFE_ATTRIBUTES = new Set([
  'class',
  'id',
  'type',
  'role',
  'width',
  'height',
  'disabled',
  'checked',
  'xmlns',
  'viewBox',
  'd',
  'fill',
  'stroke',
  'lang',
  'dir',
  'hidden',
  'open',
  'rel',
  'data-state',
  'data-side',
  'data-orientation',
  'data-accent-theme',
  'data-slot',
  'data-size',
  'data-disabled',
  'data-checked',
  'data-selected',
  'data-align',
  'data-variant',
  'data-pending-scroll',
  'data-autoscrolling',
  'inert',
  'aria-expanded',
  'aria-hidden',
])

/** 去除内联 CSS 中的外部资源，避免背景图包含签名 URL 或用户文件地址。 */
function sanitizeCss(css: string): string {
  return css
    .replace(/url\([^)]*\)/giu, 'url()')
    .replace(/@import[^;]*;/giu, '')
    .replace(/(^\s*|[;{]\s*)content\s*:[^;}]+/giu, '$1content:""')
}

/**
 * 固定版本 SDK 在 emit 返回后才序列化；原地清理 DOM 属性和 Meta URL。
 * DOM 文本/输入由 recorder 遮罩；这里额外覆盖属性、CSS 及资源地址。
 */
export function sanitizeProductReplay(value: unknown, origin: string, pathname: string): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item) => sanitizeProductReplay(item, origin, pathname))
    return
  }
  const object = value as Record<string, unknown>
  if (typeof object.href === 'string')
    object.href = `${origin}/${productAnalyticsRoute(pathname) ?? 'excluded'}`
  if (object.isStyle && typeof object.textContent === 'string')
    object.textContent = sanitizeCss(object.textContent)
  if (Array.isArray(object.attributes)) {
    // 增量事件是 { id, attributes } 列表，必须保留节点标识和属性删除语义。
    object.attributes.forEach((mutation) => sanitizeProductReplay(mutation, origin, pathname))
  } else if (object.attributes && typeof object.attributes === 'object') {
    const attributes = object.attributes as Record<string, unknown>
    for (const key of Object.keys(attributes)) {
      if (attributes[key] === null) continue
      if (SAFE_ATTRIBUTES.has(key)) {
        if ((key === 'fill' || key === 'stroke') && typeof attributes[key] === 'string')
          attributes[key] = sanitizeCss(attributes[key])
        continue
      }
      if (['value', 'title', 'alt', 'placeholder', 'aria-label'].includes(key)) {
        if (typeof attributes[key] === 'string')
          attributes[key] = redactReplayCredentials(attributes[key])
        continue
      }
      if (key === 'style' || key === '_cssText') {
        if (typeof attributes[key] === 'string') attributes[key] = sanitizeCss(attributes[key])
        else if (attributes[key] && typeof attributes[key] === 'object') {
          const styles = attributes[key] as Record<string, unknown>
          for (const property of Object.keys(styles)) {
            const entry = styles[property]
            if (property === 'content') styles[property] = '""'
            else if (typeof entry === 'string') styles[property] = sanitizeCss(entry)
            else if (Array.isArray(entry))
              styles[property] = entry.map((part) =>
                typeof part === 'string' ? sanitizeCss(part) : part,
              )
          }
        }
      } else if (key === 'href' || key === 'src') {
        try {
          const url = new URL(String(attributes[key]), origin)
          attributes[key] =
            url.origin === origin && url.pathname.startsWith('/assets/')
              ? `${origin}${url.pathname}`
              : ''
        } catch {
          attributes[key] = ''
        }
      } else {
        // Mutation 中仍发送空值以覆盖旧属性，不能只删 key 留下旧快照内容。
        attributes[key] = ''
      }
    }
  }
  // CSSOM 增量也可能包含动态资源 URL。
  if (typeof object.rule === 'string') object.rule = sanitizeCss(object.rule)
  for (const [key, nested] of Object.entries(object)) {
    if (key !== 'attributes') sanitizeProductReplay(nested, origin, pathname)
  }
}
