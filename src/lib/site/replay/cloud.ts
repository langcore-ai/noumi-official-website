import 'server-only'
import { REPLAY_APP } from './shared'
import { z } from 'zod'
import { productEventNameSchema, productEventPropertiesSchema, productRouteSchema } from './shared'
import type { ProductTimelineEvent, ProductVisitDetail, ProductVisitList } from './types'

const CLOUD_ORIGIN = 'https://api.rrweb.com'
const PAGE_SIZE = 20
// 只在访问详情加载原始录制，限制单段体积和单次录制数，避免长录制拖垮后台。
const MAX_RECORDING_BYTES = 16 * 1024 * 1024
const MAX_VISIT_RECORDINGS = 20
const MAX_TIMELINE_EVENTS = 2000
const metadataSchema = z.record(z.string(), z.string())
export const recordingSchema = z.object({
  recordingId: z.uuid(),
  timestamp: z.number().finite(),
  metadata: metadataSchema,
})
const payloadSchema = z
  .object({
    version: z.literal(1),
    eventId: z.uuid(),
    occurredAt: z.iso.datetime(),
    visitId: z.uuid(),
    recordingId: z.uuid(),
    // 匿名事件经采集清理后会省略 userId，读取时统一还原为 null。
    userId: z
      .string()
      .max(128)
      .nullish()
      .transform((value) => value ?? null),
    route: productRouteSchema,
  })
  .passthrough()

/** 错误只保留机器码，不把 Cloud 响应正文或鉴权头回传给用户。 */
export class ProductAnalyticsCloudError extends Error {
  constructor(
    public readonly code:
      | 'analytics_cloud_unavailable'
      | 'analytics_recording_too_large'
      | 'analytics_recording_not_found',
  ) {
    super(code)
  }
}

/** 固定域名、禁止重定向；大小限制基于解压后的流，而不是可伪造的 Content-Length。 */
async function readCloudJson(
  key: string,
  path: string,
  signal?: AbortSignal,
  maxBytes = 1024 * 1024,
): Promise<unknown> {
  try {
    const response = await fetch(`${CLOUD_ORIGIN}${path}`, {
      headers: { authorization: `Bearer ${key}` },
      redirect: 'error',
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(20_000)])
        : AbortSignal.timeout(20_000),
    })
    if (!response.ok || !response.body) {
      await response.body?.cancel()
      throw new ProductAnalyticsCloudError(
        response.status === 404 ? 'analytics_recording_not_found' : 'analytics_cloud_unavailable',
      )
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let bytes = 0
    let text = ''
    try {
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        bytes += chunk.value.byteLength
        if (bytes > maxBytes) {
          await reader.cancel()
          throw new ProductAnalyticsCloudError('analytics_recording_too_large')
        }
        text += decoder.decode(chunk.value, { stream: true })
      }
      return JSON.parse(text + decoder.decode())
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    if (error instanceof ProductAnalyticsCloudError) throw error
    throw new ProductAnalyticsCloudError('analytics_cloud_unavailable')
  }
}

/** 元数据属于不可信采集内容，只截取后台显示需要的字段。 */
function field(metadata: Record<string, string>, key: string) {
  return metadata[key]?.slice(0, 253) || null
}

/** 通过 Cloud 元数据分页，不扫描或下载全站 DOM。 */
export async function listProductVisits(
  key: string,
  scope: string,
  offset: number,
  anonymousId: string,
  signal?: AbortSignal,
): Promise<ProductVisitList> {
  const query = new URLSearchParams({
    'metadata[app]': REPLAY_APP,
    'metadata[scope]': scope,
    limit: String(PAGE_SIZE + 1),
    offset: String(offset),
  })
  if (anonymousId) query.set('metadata[anonymous_id]', anonymousId)
  const data = z
    .object({ recordings: z.array(recordingSchema) })
    .parse(await readCloudJson(key, `/recordings?${query}`, signal))
  const items = new Map<string, ProductVisitList['items'][number]>()
  for (const recording of data.recordings.slice(0, PAGE_SIZE)) {
    if (
      !belongs(recording.metadata, scope) ||
      (anonymousId && recording.metadata.anonymous_id !== anonymousId)
    )
      continue
    const visit = z.uuid().safeParse(recording.metadata.visit_id)
    if (!visit.success) continue
    const previous = items.get(visit.data)
    if (previous && previous.latestTimestamp >= recording.timestamp) continue
    const lastPage = productRouteSchema.safeParse(recording.metadata.last_page)
    items.set(visit.data, {
      visitId: visit.data,
      recordingCount: null,
      latestTimestamp: recording.timestamp,
      userId: null,
      anonymousId: field(recording.metadata, 'anonymous_id'),
      domain: field(recording.metadata, 'domain'),
      metadataUnavailable: false,
      lastPage: lastPage.success ? lastPage.data : null,
    })
  }
  return {
    configured: true,
    items: [...items.values()].sort((a, b) => b.latestTimestamp - a.latestTimestamp),
    nextOffset: data.recordings.length > PAGE_SIZE ? offset + PAGE_SIZE : null,
  }
}

function belongs(metadata: Record<string, string>, scope: string) {
  return metadata.app === REPLAY_APP && metadata.scope === scope
}

/** ID 不能跨官网环境读取；每个录制接口都重新核对 Cloud 元数据。 */
export async function assertRecordingScope(
  key: string,
  scope: string,
  recordingId: string,
  signal?: AbortSignal,
) {
  const data = z
    .object({ metadata: metadataSchema })
    .parse(await readCloudJson(key, `/recordings/${recordingId}`, signal))
  if (!belongs(data.metadata, scope))
    throw new ProductAnalyticsCloudError('analytics_recording_not_found')
}

/** 只解析本应用版本化事件；按发生时间排序、去重，不传播任意 payload 或 DOM。 */
export function extractProductTimeline(
  raw: unknown,
  visitId: string,
  recordingId: string,
): ProductTimelineEvent[] {
  if (!Array.isArray(raw)) throw new ProductAnalyticsCloudError('analytics_cloud_unavailable')
  const events: ProductTimelineEvent[] = []
  for (const event of raw) {
    if (event?.type !== 5) continue
    const name = productEventNameSchema.safeParse(event.data?.tag)
    const payload = payloadSchema.safeParse(event.data?.payload)
    if (
      !name.success ||
      !payload.success ||
      payload.data.visitId !== visitId ||
      payload.data.recordingId !== recordingId
    )
      continue
    const properties = productEventPropertiesSchema.safeParse(
      Object.fromEntries(
        Object.keys(productEventPropertiesSchema.shape)
          .filter((key) => key in payload.data)
          .map((key) => [key, payload.data[key]]),
      ),
    )
    if (!properties.success) continue
    events.push({
      eventId: payload.data.eventId,
      name: name.data,
      timestamp: Date.parse(payload.data.occurredAt),
      recordingId,
      userId: payload.data.userId,
      route: payload.data.route,
      properties: properties.data,
    })
  }
  return events
}

/** 按访问查询录制，再提取轻量时间线；部分失败显式返回，禁止伪装成完整访问。 */
export async function readProductVisit(
  key: string,
  visitId: string,
  scope: string,
  signal?: AbortSignal,
  includeEvents = true,
): Promise<ProductVisitDetail> {
  const query = new URLSearchParams({
    'metadata[app]': REPLAY_APP,
    'metadata[scope]': scope,
    'metadata[visit_id]': visitId,
    limit: String(MAX_VISIT_RECORDINGS + 1),
  })
  const data = z
    .object({ recordings: z.array(recordingSchema) })
    .parse(await readCloudJson(key, `/recordings?${query}`, signal))
  const selected = data.recordings
    .slice(0, MAX_VISIT_RECORDINGS)
    .filter(
      (recording) => belongs(recording.metadata, scope) && recording.metadata.visit_id === visitId,
    )
  const recordings: ProductVisitDetail['recordings'] = []
  const allEvents: ProductTimelineEvent[] = []
  for (let index = 0; index < selected.length; index += 3) {
    const batch = await Promise.all(
      selected.slice(index, index + 3).map(async (recording) => {
        const base = {
          recordingId: recording.recordingId,
          latestTimestamp: recording.timestamp,
          userId: field(recording.metadata, 'user_id'),
        }
        if (!includeEvents)
          return {
            recording: { ...base, status: 'not_loaded' as const, eventCount: 0 },
            events: [] as ProductTimelineEvent[],
          }
        try {
          const raw = await readCloudJson(
            key,
            `/recordings/${recording.recordingId}/events`,
            signal,
            MAX_RECORDING_BYTES,
          )
          const events = extractProductTimeline(raw, visitId, recording.recordingId)
          return {
            recording: { ...base, status: 'loaded' as const, eventCount: events.length },
            events,
          }
        } catch (error) {
          return {
            recording: {
              ...base,
              status:
                error instanceof ProductAnalyticsCloudError &&
                error.code === 'analytics_recording_too_large'
                  ? ('too_large' as const)
                  : ('unavailable' as const),
              eventCount: 0,
            },
            events: [] as ProductTimelineEvent[],
          }
        }
      }),
    )
    for (const item of batch) {
      recordings.push(item.recording)
      allEvents.push(...item.events)
    }
  }
  const unique = [...new Map(allEvents.map((event) => [event.eventId, event])).values()].sort(
    (a, b) => a.timestamp - b.timestamp || a.eventId.localeCompare(b.eventId),
  )
  return {
    visitId,
    recordings: recordings.sort((a, b) => a.latestTimestamp - b.latestTimestamp),
    events: unique.slice(-MAX_TIMELINE_EVENTS),
    incomplete:
      data.recordings.length > MAX_VISIT_RECORDINGS ||
      unique.length > MAX_TIMELINE_EVENTS ||
      recordings.some(
        (recording) => recording.status === 'unavailable' || recording.status === 'too_large',
      ),
  }
}

/** 仅由管理员按需读取单段录制；保留解压大小、超时与取消边界，不持久缓存 DOM。 */
export async function readProductRecordingEvents(
  key: string,
  recordingId: string,
  signal?: AbortSignal,
) {
  const raw = await readCloudJson(
    key,
    `/recordings/${recordingId}/events`,
    signal,
    MAX_RECORDING_BYTES,
  )
  if (
    !Array.isArray(raw) ||
    raw.length < 2 ||
    !raw.some((event) => event?.type === 2) ||
    raw.some(
      (event) =>
        !Number.isInteger(event?.type) ||
        event.type < 0 ||
        event.type > 6 ||
        !Number.isFinite(event.timestamp) ||
        !event.data ||
        typeof event.data !== 'object',
    )
  ) {
    throw new ProductAnalyticsCloudError('analytics_cloud_unavailable')
  }
  return raw.sort((a, b) => a.timestamp - b.timestamp)
}

/** 每次打开时获取短期签名地址；拒绝 Cloud 返回的外部域名或非播放器路径。 */
export async function readProductPlayerUrl(
  key: string,
  recordingId: string,
  signal?: AbortSignal,
): Promise<string> {
  const data = z
    .object({ links: z.object({ playerSigned: z.string() }) })
    .parse(await readCloudJson(key, `/recordings/${recordingId}?includeSignedUrls=true`, signal))
  const url = new URL(data.links.playerSigned, CLOUD_ORIGIN)
  if (
    url.origin !== CLOUD_ORIGIN ||
    url.pathname !== `/recordings/${recordingId}/player.html` ||
    url.username ||
    url.password ||
    !url.searchParams.has('signature')
  )
    throw new ProductAnalyticsCloudError('analytics_cloud_unavailable')
  return url.href
}
