'use client'

import { useState } from 'react'

import type { OfficialFeaturesFaqItem } from '@/lib/site/official-cms'

import styles from './features.module.css'

/**
 * Features 页面 FAQ 手风琴
 * @param props FAQ 条目
 * @returns 可展开的 FAQ 列表
 */
export function FeaturesFaq(props: { items: OfficialFeaturesFaqItem[] }) {
  const { items } = props
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={`${styles.faqList} reveal`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`} key={item.id}>
            <button
              aria-expanded={isOpen}
              className={styles.faqQuestion}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              {item.question}
              <span aria-hidden="true" className={styles.faqIcon}>
                +
              </span>
            </button>
            <div className={styles.faqAnswer} role="region">
              <div
                className={styles.faqAnswerInner}
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
