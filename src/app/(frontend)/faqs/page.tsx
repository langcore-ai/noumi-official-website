import { MarkdownContent } from '@/components/site/MarkdownContent'
import { OfficialHomeFooter, OfficialHomeHeader } from '@/components/site/official/OfficialHomeChrome'
import { getOfficialFaqCategories, getOfficialUseCaseNavItems } from '@/lib/site/official-cms'
import { createOfficialMetadata } from '@/lib/site/official-site'

/**
 * FAQ 页面 metadata
 */
export async function generateMetadata() {
  return createOfficialMetadata({
    title: 'Noumi FAQ — Common Questions About Your AI Digital Twin',
    description:
      'Frequently asked questions about Noumi — the AI Digital Twin that remembers your context, learns your working style, and gets work done autonomously.',
    pathname: '/faqs/',
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

      <style>{`
        .faq-wrap { max-width: 760px; margin: 0 auto; padding: 0 48px 96px; }
        .faq-category { margin-bottom: 64px; }
        .faq-category-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-muted); margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        details.faq-item { border-bottom: 1px solid var(--border); }
        details.faq-item:last-child { border-bottom: none; }
        summary.faq-q { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 22px 0; font-size: 16px; font-weight: 500; color: var(--ink); cursor: pointer; transition: color 0.2s; user-select: none; }
        summary.faq-q::-webkit-details-marker { display: none; }
        summary.faq-q:hover { color: var(--accent); }
        summary.faq-q::after { content: '+'; font-size: 20px; font-weight: 300; color: var(--ink-muted); flex-shrink: 0; transition: transform 0.25s; }
        details[open] summary.faq-q::after { transform: rotate(45deg); color: var(--accent); }
        .faq-a { padding: 0 0 24px; font-size: 15.5px; font-weight: 300; color: var(--ink-soft); line-height: 1.8; }
        .faq-a .markdown-content p { font-size: 15.5px; font-weight: 300; color: var(--ink-soft); line-height: 1.8; margin: 0; }
        .faq-footer { text-align: center; padding: 64px 0 0; border-top: 1px solid var(--border); margin-top: 48px; }
        .faq-footer p { font-size: 16px; font-weight: 300; color: var(--ink-soft); margin-bottom: 20px; }
        .faq-footer a { font-size: 15px; font-weight: 500; color: var(--accent); }
      `}</style>

      <header className="page-hero">
        <span className="sec-label reveal">Questions, answered</span>
        <h1 className="reveal d1">FAQ</h1>
      </header>

      <main className="faq-wrap">
        {categories.map((category) => (
          <div className="faq-category reveal" key={category.title}>
            <h2 className="faq-category-label">{category.title}</h2>
            {category.items.map((item, index) => (
              <details className="faq-item" key={item.id} open={index === category.items.length - 1}>
                <summary className="faq-q">{item.question}</summary>
                <div className="faq-a">
                  <MarkdownContent markdown={item.answer} />
                </div>
              </details>
            ))}
          </div>
        ))}

        <div className="faq-footer reveal">
          <p>Still have questions?</p>
          <a href="mailto:official@noumi.ai">official@noumi.ai</a>
        </div>
      </main>

      <OfficialHomeFooter useCases={useCases} />
    </div>
  )
}
