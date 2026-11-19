'use client'

import { OFFICIAL_UTM_KEYS, type OfficialFirstTouch } from './analytics'

/** 首触归因的本地存储键。 */
const FIRST_TOUCH_STORAGE_KEY = 'noumi:analytics:first_touch'

/** 归因窗口；超过后视为新的访问，避免历史渠道无限期覆盖新来源。 */
const FIRST_TOUCH_TTL_MS = 90 * 24 * 60 * 60 * 1000

const TEXT_VALUE_MAX_LENGTH = 96
const PATH_VALUE_MAX_LENGTH = 160

/**
 * 归因快照内存副本。
 * 未获得 analytics 同意时不写本地存储，只在当前文档内保留。
 */
let memoryFirstTouch: OfficialFirstTouch | null = null

/**
 * 判断快照是否仍在归因窗口内。
 * 读取存储、读取内存、写入前各校验一次，避免把损坏值当来源上报。
 *
 * @param snapshot 待判断快照
 * @param now 当前时间
 * @returns 是否有效
 */
function isFreshFirstTouch(
  snapshot: OfficialFirstTouch | null,
  now: number,
): snapshot is OfficialFirstTouch {
  if (!snapshot?.captured_at) {
    return false
  }
  const capturedAt = Date.parse(snapshot.captured_at)
  return Number.isFinite(capturedAt) && now - capturedAt <= FIRST_TOUCH_TTL_MS
}

/**
 * 从当前页面构造候选首触快照。
 *
 * @param input 当前地址、referrer 与时间
 * @returns 候选快照；没有任何渠道信号时返回 null
 */
function buildFirstTouchCandidate(input: {
  baseUrl: string
  now: number
  pathname: string
  referrer?: string | null
  search: string
}): OfficialFirstTouch | null {
  const searchParams = new URLSearchParams(
    input.search.startsWith('?') ? input.search.slice(1) : input.search,
  )
  const rawPath = input.pathname.split(/[?#]/, 1)[0]?.trim() || ''
  const candidate: OfficialFirstTouch = {
    captured_at: new Date(input.now).toISOString(),
    landing_page:
      rawPath.startsWith('/') && !rawPath.includes('..')
        ? (rawPath.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/').slice(
            0,
            PATH_VALUE_MAX_LENGTH,
          )
        : '/',
  }

  let hasChannelSignal = false
  for (const key of OFFICIAL_UTM_KEYS) {
    const value = (searchParams.get(key) || '').trim().slice(0, TEXT_VALUE_MAX_LENGTH)
    if (value) {
      candidate[key] = value
      hasChannelSignal = true
    }
  }

  // 站内跳转不是渠道来源；只记录外部 referrer 的 origin。
  const trimmedReferrer = input.referrer?.trim()
  if (trimmedReferrer) {
    try {
      const parsedReferrer = new URL(trimmedReferrer)
      if (
        (parsedReferrer.protocol === 'http:' || parsedReferrer.protocol === 'https:') &&
        parsedReferrer.origin !== new URL(input.baseUrl).origin
      ) {
        candidate.referrer_origin = parsedReferrer.origin
        hasChannelSignal = true
      }
    } catch {
      // 非法 referrer 不构成渠道信号。
    }
  }

  return hasChannelSignal ? candidate : null
}

/**
 * 持久化首触快照。
 * @param snapshot 快照
 */
function persistFirstTouch(snapshot: OfficialFirstTouch) {
  try {
    window.localStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // 存储受限时仅维持当前文档归因。
  }
}

/**
 * 记录并返回首触归因。
 * 已有有效快照时保持不变：首个带渠道信号的访问决定来源。
 *
 * @param input 当前地址、referrer、是否已获同意
 * @returns 当前生效的首触快照；无渠道信号且无历史时返回 null
 */
export function resolveOfficialFirstTouch(input: {
  baseUrl: string
  consent: boolean
  now?: number
  pathname: string
  referrer?: string | null
  search: string
}): OfficialFirstTouch | null {
  const now = input.now ?? Date.now()
  if (memoryFirstTouch && !isFreshFirstTouch(memoryFirstTouch, now)) {
    memoryFirstTouch = null
  }

  let stored: OfficialFirstTouch | null = null
  if (input.consent) {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY) ?? 'null',
      ) as OfficialFirstTouch | null
      stored =
        parsed && typeof parsed === 'object' && isFreshFirstTouch(parsed, now) ? parsed : null
    } catch {
      stored = null
    }
  }

  const existing = stored ?? memoryFirstTouch
  if (existing) {
    if (input.consent && !stored) {
      persistFirstTouch(existing)
    }
    return existing
  }

  const candidate = buildFirstTouchCandidate({
    baseUrl: input.baseUrl,
    now,
    pathname: input.pathname,
    referrer: input.referrer,
    search: input.search,
  })
  if (!candidate) {
    return null
  }

  memoryFirstTouch = candidate
  if (input.consent) {
    persistFirstTouch(candidate)
  }
  return candidate
}

/**
 * 清除首触归因；撤回 analytics 同意时调用。
 */
export function clearOfficialFirstTouch() {
  memoryFirstTouch = null
  try {
    window.localStorage.removeItem(FIRST_TOUCH_STORAGE_KEY)
  } catch {
    // 存储受限时只需清掉内存副本。
  }
}
