'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { OfficialAboutFaqItem, OfficialAboutTeamMember } from '@/lib/site/official-cms'

import styles from './about.module.css'

/**
 * 计算循环轮播下标。
 * @param value 原始下标
 * @param total 总数
 * @returns 归一化后的下标
 */
function mod(value: number, total: number): number {
  return ((value % total) + total) % total
}

/**
 * 生成人物头像替代文本。
 * @param member 团队成员
 * @returns 头像替代文本
 */
function getAvatarAlt(member: OfficialAboutTeamMember): string {
  return member.name ? `${member.name} — Noumi team` : ''
}

/**
 * 根据名字生成头像占位字母。
 * @param name 成员名字
 * @returns 首字母；名字未填写时为空
 */
function getAvatarLetter(name?: string): string {
  return name?.trim().charAt(0).toUpperCase() ?? ''
}

/**
 * About 页面团队轮播。
 * @param props 团队成员列表
 * @returns 团队成员轮播
 */
export function AboutTeamCarousel(props: { members: OfficialAboutTeamMember[] }) {
  const { members } = props
  const total = members.length
  const [current, setCurrent] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartXRef = useRef(0)
  const dragStateRef = useRef({
    delta: 0,
    isDragging: false,
    startX: 0,
  })

  /**
   * 清理悬停切换计时器。
   */
  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  /**
   * 切到指定轮播项。
   * @param index 目标下标
   */
  const goTo = useCallback(
    (index: number) => {
      setCurrent(mod(index, total))
    },
    [total],
  )

  /**
   * 按偏移量移动轮播。
   * @param delta 移动步长
   */
  const shift = useCallback(
    (delta: number) => {
      setCurrent((value) => mod(value + delta, total))
    },
    [total],
  )

  useEffect(() => {
    if (total < 2) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        shift(-1)
      }

      if (event.key === 'ArrowRight') {
        shift(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shift, total])

  useEffect(() => {
    if (total < 2) {
      return undefined
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current.isDragging) {
        return
      }

      dragStateRef.current.delta = event.clientX - dragStateRef.current.startX
    }

    const handleMouseUp = () => {
      if (!dragStateRef.current.isDragging) {
        return
      }

      const delta = dragStateRef.current.delta

      dragStateRef.current.isDragging = false
      setIsDragging(false)

      if (Math.abs(delta) > 60) {
        shift(delta < 0 ? 1 : -1)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [shift, total])

  useEffect(() => clearHoverTimer, [clearHoverTimer])

  /**
   * 计算轮播项的相对位置，交给 CSS 控制 3D 排布。
   * @param index 轮播项下标
   * @returns 相对当前位置
   */
  const getRelativePosition = (index: number) => {
    const position = mod(index - current, total)
    const half = Math.floor(total / 2)

    return position > half ? position - total : position
  }

  return (
    <>
      <div className={styles.carouselStage}>
        {total > 1 ? (
          <button
            aria-label="Previous"
            className={`${styles.arrowBtn} ${styles.arrowPrev}`}
            onClick={() => shift(-1)}
            type="button"
          >
            ←
          </button>
        ) : null}

        <div
          className={`${styles.carouselTrack} ${isDragging ? styles.carouselTrackDragging : ''}`}
          onMouseDown={(event) => {
            if (total < 2) {
              return
            }

            dragStateRef.current = {
              delta: 0,
              isDragging: true,
              startX: event.clientX,
            }
            setIsDragging(true)
            event.preventDefault()
          }}
          onTouchEnd={(event) => {
            if (total < 2) {
              return
            }

            const delta = event.changedTouches[0].clientX - touchStartXRef.current

            if (Math.abs(delta) > 40) {
              shift(delta < 0 ? 1 : -1)
            }
          }}
          onTouchStart={(event) => {
            touchStartXRef.current = event.touches[0].clientX
          }}
        >
          {members.map((member, index) => (
            <article
              className={styles.slide}
              data-pos={getRelativePosition(index)}
              key={member.id}
              onMouseEnter={() => {
                if (total < 2 || index === current) {
                  return
                }

                clearHoverTimer()
                hoverTimerRef.current = setTimeout(() => goTo(index), 300)
              }}
              onMouseLeave={clearHoverTimer}
            >
              <div className={styles.card}>
                <div className={styles.avatarRing}>
                  {member.avatar?.url ? (
                    <img alt={getAvatarAlt(member)} src={member.avatar.url} />
                  ) : (
                    <span aria-hidden="true" className={styles.avatarFallback}>
                      {getAvatarLetter(member.name)}
                    </span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  {member.name ? <h3 className={styles.cardName}>{member.name}</h3> : null}
                  {member.role ? <span className={styles.cardRole}>{member.role}</span> : null}
                  {member.description ? (
                    <p className={styles.cardBio}>{member.description}</p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        {total > 1 ? (
          <button
            aria-label="Next"
            className={`${styles.arrowBtn} ${styles.arrowNext}`}
            onClick={() => shift(1)}
            type="button"
          >
            →
          </button>
        ) : null}
      </div>

      {total > 1 ? (
        <div className={styles.carouselDots}>
          {members.map((member, index) => (
            <button
              aria-label={`Go to slide ${index + 1}`}
              className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
              key={member.id}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

/**
 * About 页面 FAQ 手风琴。
 * @param props FAQ 条目
 * @returns FAQ 列表
 */
export function AboutFaq(props: { items: OfficialAboutFaqItem[] }) {
  const { items } = props
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={`${styles.faqList} reveal d3`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const answerId = `about-faq-answer-${index}`

        return (
          <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`} key={item.id}>
            <button
              aria-controls={answerId}
              aria-expanded={isOpen}
              className={styles.faqQuestion}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              {item.question ?? ''}
              <span aria-hidden="true" className={styles.faqIcon}>
                +
              </span>
            </button>
            <div className={styles.faqAnswer} id={answerId} role="region">
              <div
                className={styles.faqAnswerInner}
                dangerouslySetInnerHTML={{ __html: item.answer ?? '' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
