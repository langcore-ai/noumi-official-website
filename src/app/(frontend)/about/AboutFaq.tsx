'use client'

import { useEffect, useRef } from 'react'
import content from './prototype-content.json'
import styles from './about.module.css'

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const animation = useRef<Animation | null>(null)
  const expanded = useRef(false)
  useEffect(() => () => animation.current?.cancel(), [])
  return (
    <details ref={ref} className={styles.faqItem} data-about-faq={index}>
      <summary
        onClick={(event) => {
          event.preventDefault()
          const details = ref.current!
          const panel = details.querySelector<HTMLElement>('[data-answer]')!
          const from = details.open ? panel.getBoundingClientRect().height : 0
          animation.current?.cancel()
          expanded.current = !expanded.current
          details.open = true
          if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            details.open = expanded.current
            return
          }
          animation.current = panel.animate(
            [
              { height: from + 'px', opacity: expanded.current ? 0 : 1 },
              {
                height: (expanded.current ? panel.scrollHeight : 0) + 'px',
                opacity: expanded.current ? 1 : 0,
              },
            ],
            { duration: 300, easing: 'linear' },
          )
          animation.current.onfinish = () => {
            details.open = expanded.current
          }
        }}
      >
        {question}
        <span aria-hidden="true" className={styles.faqIcon} />
      </summary>
      <div data-answer className={styles.answer}>
        <p dangerouslySetInnerHTML={{ __html: answer }} />
      </div>
    </details>
  )
}

export function AboutFaq() {
  return (
    <div className={styles.faqList}>
      {content.faq.map((item, index) => (
        <FaqItem {...item} index={index} key={item.question} />
      ))}
    </div>
  )
}
