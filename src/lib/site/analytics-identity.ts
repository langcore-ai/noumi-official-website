'use client'

import { readSharedVisitorId } from './shared-visitor'

/** 匿名观测 ID 的本地存储键；与 rrweb 回放身份完全独立。 */
const ANONYMOUS_ID_STORAGE_KEY = 'noumi:analytics:anonymous_id'

/** 浏览器浏览会话存储键。 */
const BROWSER_SESSION_STORAGE_KEY = 'noumi:analytics:browser-session'

/** 会话空闲与总时长上限，与 PostHog 默认浏览会话一致。 */
const SESSION_IDLE_MS = 30 * 60 * 1000
const SESSION_MAX_MS = 24 * 60 * 60 * 1000

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu

type BrowserSession = {
  id: string
  lastAt: number
  startedAt: number
}

let fallbackAnonymousId = ''
let currentSession: BrowserSession | undefined
let windowId = ''

/**
 * 判断文本是否为可接受的 UUID。
 * @param value 候选值
 * @returns 是否为合法 UUID
 */
export function isAnonymousId(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

/**
 * 读取匿名观测 ID。
 * 优先复用官网已有的 `noumi_visitor_id`，否则使用本地 UUID。
 *
 * @returns 匿名观测 ID
 */
export function readOfficialAnonymousId(): string {
  if (typeof window === 'undefined' || !window.location) {
    return ''
  }

  const visitorId = readSharedVisitorId()
  if (visitorId) {
    return visitorId
  }
  if (fallbackAnonymousId) {
    return fallbackAnonymousId
  }

  try {
    const stored = window.localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY)
    if (isAnonymousId(stored)) {
      return stored
    }
    const created = crypto.randomUUID()
    window.localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, created)
    return created
  } catch {
    return (fallbackAnonymousId ||= crypto.randomUUID())
  }
}

/**
 * 轮换匿名观测 ID 并清空浏览会话；撤回同意或切换身份时调用。
 */
export function rotateOfficialAnonymousId() {
  const created = crypto.randomUUID()
  fallbackAnonymousId = created
  currentSession = undefined
  windowId = ''
  try {
    window.localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, created)
    window.localStorage.removeItem(BROWSER_SESSION_STORAGE_KEY)
  } catch {
    // 存储受限时仅维持当前文档身份。
  }
}

/**
 * 读取或创建当前浏览会话；同一文档内 `$window_id` 保持不变。
 *
 * @param at 当前时间
 * @returns 浏览会话与窗口标识
 */
export function readOfficialBrowserSession(at = Date.now()) {
  windowId ||= crypto.randomUUID()
  const stored = readStoredSession()
  if (
    !stored ||
    at < stored.startedAt ||
    at - stored.lastAt >= SESSION_IDLE_MS ||
    at - stored.startedAt >= SESSION_MAX_MS
  ) {
    currentSession = { id: crypto.randomUUID(), lastAt: at, startedAt: at }
    persistSession(currentSession)
  } else {
    currentSession = stored
  }

  return { $session_id: currentSession.id, $window_id: windowId }
}

/**
 * 用真实事件延长当前会话活跃时间。
 *
 * @param at 事件时间
 * @returns 浏览会话与窗口标识
 */
export function touchOfficialBrowserSession(at: number) {
  const session = readOfficialBrowserSession(at)
  if (currentSession) {
    currentSession = { ...currentSession, lastAt: Math.max(currentSession.lastAt, at) }
    persistSession(currentSession)
  }
  return session
}

/**
 * 读取本地保存的浏览会话。
 * @returns 合法会话；缺失或损坏时返回 undefined
 */
function readStoredSession(): BrowserSession | undefined {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(BROWSER_SESSION_STORAGE_KEY) ?? 'null',
    ) as Partial<BrowserSession> | null
    if (
      !parsed ||
      !isAnonymousId(parsed.id) ||
      typeof parsed.startedAt !== 'number' ||
      typeof parsed.lastAt !== 'number' ||
      parsed.lastAt < parsed.startedAt
    ) {
      return undefined
    }
    return { id: parsed.id, lastAt: parsed.lastAt, startedAt: parsed.startedAt }
  } catch {
    return undefined
  }
}

/**
 * 持久化浏览会话。
 * @param session 当前会话
 */
function persistSession(session: BrowserSession) {
  try {
    window.localStorage.setItem(BROWSER_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // 存储受限时沿用内存会话。
  }
}
