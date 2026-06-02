import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

/** 进程内复用 Payload 初始化结果，降低 Cloudflare Worker 单次请求的冷启动读库成本。 */
let payloadClientPromise: Promise<Payload> | null = null

/**
 * 读取官网共用 Payload 实例。
 * @returns Payload Local API 实例
 */
export function getSitePayloadClient(): Promise<Payload> {
  payloadClientPromise ??= configPromise.then((config) => getPayload({ config }))

  return payloadClientPromise
}
