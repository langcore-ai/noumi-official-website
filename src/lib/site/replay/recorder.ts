import { readStoredConsent } from '../consent'
import { readSharedVisitorId } from '../shared-visitor'
import {
  maskProductReplayText,
  PRODUCT_REPLAY_PRIVATE_SELECTOR,
  sanitizeProductReplay,
} from './privacy'
import {
  REPLAY_APP,
  REPLAY_IDENTITY_KEY,
  REPLAY_IDLE_MS,
  REPLAY_VISIT_KEY,
  productEventNameSchema,
  replayProperties,
  replayRoute,
  type ReplayConfig,
} from './shared'

type Client = typeof import('@rrweb/browser-client')
let active: ((name: string, properties: Record<string, unknown>) => void) | null = null

/** 现有业务埋点的唯一回放出口；页面浏览由录制控制器负责，避免重复。 */
export function trackOfficialReplay(name: string, properties: Record<string, unknown>) {
  if (name !== 'official_page_viewed') active?.(name, properties)
}

function read(storage: Storage, key: string): unknown {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}
function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    /* 受限存储仅使用内存标识。 */
  }
}

/** 一个挂载周期只有一个 recorder owner；没有后台队列或业务重试。 */
export class OfficialRecorder {
  private anonymousId = crypto.randomUUID()
  private visitId = ''
  private lastActivity = 0
  private recording = false
  private page = ''
  private consent = false
  private disposed = false
  private readonly track = (name: string, properties: Record<string, unknown>) =>
    this.event(name, properties)

  constructor(
    private client: Client,
    private config: ReplayConfig,
  ) {
    // 每个页面加载建立独立片段，防止 opener 复制 SDK 的 sessionStorage 后交错写入。
    client.stop(true)
    active = this.track
  }

  private allowed() {
    return (
      !this.disposed &&
      this.config.enabled &&
      readStoredConsent()?.analytics === true &&
      Boolean(replayRoute(location.pathname))
    )
  }

  /** 同意撤回同步停止；重新同意不接续撤回前的访问。 */
  sync() {
    const allowed = this.allowed()
    if (!allowed) {
      this.stop()
      this.page = ''
      this.visitId = ''
      this.consent = false
      try {
        sessionStorage.removeItem(REPLAY_VISIT_KEY)
      } catch {
        /* 存储受限。 */
      }
      return
    }
    if (!this.consent) {
      this.consent = true
      try {
        const identity = read(localStorage, REPLAY_IDENTITY_KEY)
        if (typeof identity === 'string' && /^[0-9a-f-]{36}$/i.test(identity))
          this.anonymousId = identity as ReturnType<typeof crypto.randomUUID>
        const visit = read(sessionStorage, REPLAY_VISIT_KEY) as {
          id?: string
          activity?: number
          scope?: string
        } | null
        if (
          visit?.scope === this.config.scope &&
          typeof visit.id === 'string' &&
          /^[0-9a-f-]{36}$/i.test(visit.id) &&
          typeof visit.activity === 'number'
        ) {
          this.visitId = visit.id
          this.lastActivity = visit.activity
        }
        write(localStorage, REPLAY_IDENTITY_KEY, this.anonymousId)
      } catch {
        /* 禁止访问 storage 时仍可录制当前页。 */
      }
    }
    // 同意后才读取或创建共享访客 Cookie，接续当前站点已有身份。
    const previousAnonymousId = this.anonymousId
    this.anonymousId = readSharedVisitorId(this.anonymousId) as ReturnType<typeof crypto.randomUUID>
    if (previousAnonymousId !== this.anonymousId) this.visitId = ''
    try {
      write(localStorage, REPLAY_IDENTITY_KEY, this.anonymousId)
    } catch {
      /* 存储受限。 */
    }
    this.observePage()
  }

  private ensureRecording() {
    if (!this.allowed() || document.hidden) return false
    const sharedVisitor = readSharedVisitorId(this.anonymousId)
    if (sharedVisitor !== this.anonymousId) {
      this.stop()
      this.anonymousId = sharedVisitor as ReturnType<typeof crypto.randomUUID>
      this.visitId = ''
      this.page = ''
    }
    const now = Date.now()
    if (!this.visitId || now - this.lastActivity > REPLAY_IDLE_MS) {
      this.client.stop(true)
      this.recording = false
      this.visitId = crypto.randomUUID()
      this.page = ''
    }
    this.lastActivity = now
    try {
      write(sessionStorage, REPLAY_VISIT_KEY, {
        id: this.visitId,
        activity: now,
        scope: this.config.scope,
      })
    } catch {
      /* 存储受限。 */
    }
    if (!this.recording) {
      this.client.start({
        publicApiKey: this.config.publicKey!,
        includePii: false,
        meta: {
          app: REPLAY_APP,
          scope: this.config.scope,
          anonymous_id: this.anonymousId,
          visitor_id: this.anonymousId,
          visit_id: this.visitId,
          last_page: location.pathname,
        },
        maskAllInputs: true,
        maskTextSelector: '*',
        maskTextFn: maskProductReplayText,
        maskInputFn: maskProductReplayText,
        blockSelector: `iframe,canvas,video,audio,img,${PRODUCT_REPLAY_PRIVATE_SELECTOR}`,
        recordCanvas: false,
        inlineImages: false,
        recordCrossOriginIframes: false,
        emit: (event) => sanitizeProductReplay(event, location.origin, location.pathname),
      })
      this.recording = this.client.getRecordingId() !== null
    }
    return this.recording
  }

  observePage = () => {
    try {
      if (!this.allowed()) {
        this.sync()
        return
      }
      if (!this.ensureRecording()) return
      const path = replayRoute(location.pathname)!
      if (path === this.page) return
      this.page = path
      this.client.addMeta({ last_page: path })
      const source: Record<string, unknown> = { page_path: path }
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign'])
        source[key] = new URLSearchParams(location.search).get(key) ?? undefined
      if (document.referrer) {
        try {
          source.referrerHost = new URL(document.referrer).hostname
        } catch {
          /* 无效来源忽略。 */
        }
      }
      this.event('official_page_viewed', source)
    } catch {
      this.stop()
    }
  }

  event(name: string, properties: Record<string, unknown>) {
    try {
      const parsed = productEventNameSchema.safeParse(name)
      if (!parsed.success || !this.ensureRecording()) return
      const recordingId = this.client.getRecordingId()
      if (!recordingId) return
      const timestamp = Date.now()
      void fetch(`https://api.rrweb.com/recordings/${recordingId}/events`, {
        method: 'POST',
        credentials: 'omit',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${this.config.publicKey}`,
        },
        body: JSON.stringify([
          {
            type: 5,
            timestamp,
            data: {
              tag: name,
              payload: {
                version: 1,
                app: REPLAY_APP,
                scope: this.config.scope,
                eventId: crypto.randomUUID(),
                occurredAt: new Date(timestamp).toISOString(),
                anonymousId: this.anonymousId,
                visitId: this.visitId,
                recordingId,
                userId: null,
                route: replayRoute(location.pathname),
                ...replayProperties({
                  ...properties,
                  page_path: location.pathname,
                  language: document.documentElement.lang,
                  device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                }),
              },
            },
          },
        ]),
      }).catch((): void => {})
    } catch {
      this.stop()
    }
  }

  private stop() {
    try {
      this.client.stop(true)
    } catch {
      /* 可选录制不能阻断官网。 */
    }
    this.recording = false
  }
  dispose() {
    this.disposed = true
    this.stop()
    if (active === this.track) active = null
  }
}
