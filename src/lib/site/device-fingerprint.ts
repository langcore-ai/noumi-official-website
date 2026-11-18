'use client'

import { getThumbmark } from '@thumbmarkjs/thumbmarkjs'

/**
 * 官网浏览器设备指纹。
 * 纯客户端 ThumbmarkJS OSS 模式:不设置 api_key,不调用外部 API,
 * 只在本地读取公开渲染信号并哈希成 32 位标识。
 * 仅在 analytics consent 后由调用方触发采集;指纹不参与鉴权或幂等。
 */

const FINGERPRINT_MAX_LENGTH = 64

let cachedFingerprint = ''
let pendingFingerprint: Promise<string> | null = null

/**
 * 读取设备指纹,采集失败或超时返回空串(事件照常上报,只是没有指纹)。
 * 结果按文档生命周期缓存,同一页面只计算一次。
 *
 * @returns 十六进制指纹哈希;不可用时为空串
 */
export function readDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return Promise.resolve(cachedFingerprint)
  pendingFingerprint ??= (async () => {
    try {
      const result = await getThumbmark()
      const fingerprint = typeof result?.thumbmark === 'string' ? result.thumbmark : ''
      cachedFingerprint = fingerprint.slice(0, FINGERPRINT_MAX_LENGTH)
      return cachedFingerprint
    } catch {
      return ''
    } finally {
      pendingFingerprint = null
    }
  })()
  return pendingFingerprint
}
