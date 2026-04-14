'use client'

import { useEffect, useState } from 'react'

/** 打字机默认速度，单位毫秒 */
const DEFAULT_SPEED = 52
/** 打字完成后的光标保留时间，单位毫秒 */
const CURSOR_LINGER_DURATION = 1400
/** 初始延迟，避免首屏出现过于突兀 */
const START_DELAY = 320

/**
 * 打字机标题组件
 * @param props 文案与样式配置
 * @returns 带光标动画的标题
 */
export function TypewriterText(props: {
  className?: string
  text: string
}) {
  const { className, text } = props
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // 文案变化时重置动画状态，确保 CMS 更新后仍能正确重播
    setTypedText('')
    setShowCursor(true)

    let cursorTimeout: number | undefined
    let interval: number | undefined
    const startTimeout = window.setTimeout(() => {
      let index = 0
      interval = window.setInterval(() => {
        index += 1
        setTypedText(text.slice(0, index))

        if (index >= text.length) {
          if (interval) {
            window.clearInterval(interval)
          }
          cursorTimeout = window.setTimeout(() => {
            setShowCursor(false)
          }, CURSOR_LINGER_DURATION)
        }
      }, DEFAULT_SPEED)
    }, START_DELAY)

    return () => {
      window.clearTimeout(startTimeout)
      if (interval) {
        window.clearInterval(interval)
      }
      if (cursorTimeout) {
        window.clearTimeout(cursorTimeout)
      }
    }
  }, [text])

  return (
    <h1 className={className}>
      {typedText}
      {showCursor ? <span aria-hidden="true" className="typewriter-cursor" /> : null}
    </h1>
  )
}
