import { MarkdownContent } from '@/components/site/MarkdownContent'
import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialFaqCategories, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

import styles from './faqs.module.css'

/**
 * FAQ 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Noumi FAQ — Common Questions About Your AI Digital Twin',
    description:
      'Frequently asked questions about Noumi — the AI Digital Twin that remembers your context, learns your working style, and gets work done autonomously.',
    pathname: '/faqs',
  })
}

/**
 * FAQ 页面
 * @returns FAQ 页面内容
 */
export default async function FaqPage() {
  const [categories, useCases] = await Promise.all([
    getOfficialFaqCategories(),
    getOfficialUseCaseNavItems(),
  ])

  return (
    <div className="page-body">
      <OfficialHomeHeader useCases={useCases} />

      <header className="page-hero">
        <span className="sec-label reveal">Questions, answered</span>
        <h1 className="reveal d1">FAQ</h1>
      </header>

      <main className={styles.faqWrap}>
        {categories.map((category) => (
          <div className={`${styles.faqCategory} reveal`} key={category.title}>
            <h2 className={styles.categoryLabel}>{category.title}</h2>
            {category.items.map((item, index) => (
              <details className={styles.faqItem} key={item.id} open={index === category.items.length - 1}>
                <summary className={styles.faqQuestion}>{item.question}</summary>
                <div className={styles.faqAnswer}>
                  <MarkdownContent markdown={item.answer} />
                </div>
              </details>
            ))}
          </div>
        ))}

        <div className={`${styles.faqFooter} reveal`}>
          <p>Still have questions?</p>
          <a href="mailto:official@noumi.ai">official@noumi.ai</a>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
