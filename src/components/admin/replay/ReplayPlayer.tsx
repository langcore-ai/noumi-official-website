import { useEffect, useRef, useState } from 'react'
import Player from 'rrweb-player'
import 'rrweb-player/dist/style.css'

export type ReplayEvents = ConstructorParameters<typeof Player>[0]['props']['events']
const PLAYBACK_SPEEDS = [1, 2, 4, 8, 16]

/** 事件发生前两秒开始，限定在该片段内，不能跳进另一段录制的时间范围。 */
export function replayEventOffset(timestamp: number, startTime: number, endTime: number) {
  return Math.max(0, Math.min(timestamp - startTime - 2000, endTime - startTime))
}

/** 沿用 rrweb 原生 UI；React 只拥有片段生命周期和外部事件定位命令。 */
export default function ReplayPlayer({
  events,
  seek,
  onPosition,
}: {
  events: ReplayEvents
  seek: { timestamp: number } | null
  onPosition: (timestamp: number) => void
}) {
  const target = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const element = target.current
    if (!element) return
    let instance: Player | undefined
    let observer: ResizeObserver | undefined
    // 按实际可见空间缩放画面，为原生控制条和底部间距留出位置。
    const dimensions = () => {
      const bounds = element.getBoundingClientRect()
      const width = Math.max(1, Math.floor(bounds.width))
      return {
        width,
        height: Math.min(
          Math.round((width * 9) / 16),
          Math.max(160, window.innerHeight - bounds.top - 112),
        ),
      }
    }
    const resize = () => {
      if (!instance || document.fullscreenElement) return
      instance.$set(dimensions())
      instance.triggerResize()
    }
    try {
      instance = new Player({
        target: element,
        props: {
          events,
          ...dimensions(),
          autoPlay: false,
          speed: 1,
          speedOption: PLAYBACK_SPEEDS,
          showController: true,
          skipInactive: true,
          tags: Object.fromEntries(
            events
              .filter((event) => event.type === 5)
              .map((event) => [event.data.tag, 'var(--theme-elevation-800)']),
          ),
        },
      })
      const start = instance.getMetaData().startTime
      instance.addEventListener('ui-update-current-time', (value) => {
        if (
          value &&
          typeof value === 'object' &&
          'payload' in value &&
          typeof value.payload === 'number'
        ) {
          onPosition(start + value.payload)
        }
      })
      observer = new ResizeObserver(resize)
      observer.observe(element)
      window.addEventListener('resize', resize)
      setPlayer(instance)
    } catch {
      setFailed(true)
    }
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      instance?.$destroy()
      element.replaceChildren()
    }
  }, [events, onPosition])
  useEffect(() => {
    if (!player || !seek) return
    try {
      const { startTime, endTime } = player.getMetaData()
      player.goto(replayEventOffset(seek.timestamp, startTime, endTime), false)
    } catch {
      setFailed(true)
    }
  }, [player, seek])
  return (
    <div>
      {failed ? <p role="alert">Unable to load replay. Please reload this recording.</p> : null}
      <div ref={target} className="official-replay__player" aria-label="Visit replay" />
    </div>
  )
}
