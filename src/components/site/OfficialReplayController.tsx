'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { COOKIE_CONSENT_CHANGE_EVENT, readStoredConsent } from '@/lib/site/consent'
import { OfficialRecorder } from '@/lib/site/replay/recorder'
import { replayConfigSchema } from '@/lib/site/replay/shared'

/** 公开布局中单独控制录制，配置或 SDK 未完成时撤回同意也不会启动采集。 */
export function OfficialReplayController(): null {
  const pathname = usePathname()
  const recorder = useRef<OfficialRecorder | null>(null)
  useEffect(() => {
    let disposed = false
    let starting = false
    const abort = new AbortController()
    const sync = async () => {
      if (recorder.current) {
        recorder.current.sync()
        return
      }
      if (starting || readStoredConsent()?.analytics !== true) return
      starting = true
      try {
        const response = await fetch('/api/site/replay/config', {
          cache: 'no-store',
          signal: abort.signal,
        })
        if (!response.ok) return
        const config = replayConfigSchema.parse(await response.json())
        if (
          !config.enabled ||
          !config.publicKey ||
          disposed ||
          readStoredConsent()?.analytics !== true
        )
          return
        const client = await import('@rrweb/browser-client')
        if (disposed || readStoredConsent()?.analytics !== true) return
        recorder.current = new OfficialRecorder(client, config)
        recorder.current.sync()
      } catch {
        /* 采集不可用不影响页面。 */
      } finally {
        starting = false
      }
    }
    const activity = () => recorder.current?.observePage()
    void sync()
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    document.addEventListener('pointerdown', activity, { passive: true })
    document.addEventListener('keydown', activity, { passive: true })
    document.addEventListener('visibilitychange', activity)
    return () => {
      disposed = true
      abort.abort()
      recorder.current?.dispose()
      recorder.current = null
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
      document.removeEventListener('pointerdown', activity)
      document.removeEventListener('keydown', activity)
      document.removeEventListener('visibilitychange', activity)
    }
  }, [])
  useLayoutEffect(() => {
    recorder.current?.observePage()
  }, [pathname])
  // 在 DOM commit 后、MutationObserver 交付前停录，避免把排除页面的首帧带入录制。
  useLayoutEffect(() => () => recorder.current?.dispose(), [])
  return null
}
