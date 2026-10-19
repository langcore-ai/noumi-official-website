import type { ProductEventName, ProductEventProperties } from './shared'

/** 列表只接收摘要；DOM 录制由独立的管理员接口按需读取。 */
export type ProductVisitSummary = {
  visitId: string
  recordingCount: number | null
  latestTimestamp: number
  userId: string | null
  userName?: string | null
  anonymousId: string | null
  domain: string | null
  metadataUnavailable: boolean
  lastPage?: string | null
  lastContext?: {
    projectId: string
    projectName: string
    topicId: string
    topicName: string
    timestamp: number
  } | null
}

export type ProductVisitList = {
  configured: boolean
  items: ProductVisitSummary[]
  nextOffset: number | null
}

export type ProductTimelineEvent = {
  eventId: string
  name: ProductEventName
  timestamp: number
  recordingId: string
  userId: string | null
  route: string
  properties: ProductEventProperties
}

export type ProductVisitDetail = {
  visitId: string
  lastContext?: ProductVisitSummary['lastContext']
  recordings: Array<{
    recordingId: string
    latestTimestamp: number
    userId: string | null
    eventCount: number
    status: 'not_loaded' | 'loaded' | 'unavailable' | 'too_large'
  }>
  events: ProductTimelineEvent[]
  incomplete: boolean
}
