import Link from 'next/link'

import { MarkdownContent } from '@/components/site/MarkdownContent'
import type { OfficialContentSection } from '@/lib/site/official-cms'

/**
 * 正式站点通用正文分节
 * @param props 组件参数
 * @returns 正文节点
 */
export function OfficialContentSections(props: {
  article?: boolean
  sections: OfficialContentSection[]
}) {
  const { article = false, sections } = props

  return (
    <>
      {sections.map((section, index) => {
        if (section.type === 'image') {
          return (
            <section
              key={`image-${index}`}
              className={article ? 'post-wrap post-wrap--section' : 'legal-body'}
            >
              {section.label ? <span className="sec-label">{section.label}</span> : null}
              {section.title ? <h2 className="official-section-title">{section.title}</h2> : null}
              <figure className="official-image-block">
                {section.image?.url ? (
                  <img alt={section.alt || section.title || ''} src={section.image.url} />
                ) : null}
                {section.caption ? <figcaption>{section.caption}</figcaption> : null}
              </figure>
            </section>
          )
        }

        if (section.type === 'markdown') {
          return (
            <section
              key={`markdown-${index}`}
              className={article ? 'post-wrap post-wrap--section' : 'legal-body'}
            >
              {section.label ? <span className="sec-label">{section.label}</span> : null}
              {section.title ? <h2 className="official-section-title">{section.title}</h2> : null}
              <MarkdownContent markdown={section.markdown} />
            </section>
          )
        }

        if (section.type === 'cta') {
          return (
            <section key={`cta-${index}`} aria-labelledby={`cta-${index}`} className="cta-band">
              {section.label ? <span className="sec-label reveal">{section.label}</span> : null}
              {section.title ? (
                <h2 className="reveal" id={`cta-${index}`}>
                  {section.title}
                </h2>
              ) : null}
              {section.description ? <p className="reveal d1">{section.description}</p> : null}
              {section.primaryCta ? (
                <Link className="btn-cream reveal d2" href={section.primaryCta.href}>
                  {section.primaryCta.label}
                </Link>
              ) : null}
            </section>
          )
        }

        return (
          <section
            key={`rich-${index}`}
            className={article ? 'post-wrap post-wrap--section' : 'legal-body'}
          >
            {section.label ? <span className="sec-label">{section.label}</span> : null}
            {section.title ? <h2 className="official-section-title">{section.title}</h2> : null}
            {section.description ? <p className="official-section-description">{section.description}</p> : null}
            <div className={section.style === 'panel' ? 'official-richtext-panel' : undefined}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets.length > 0 ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        )
      })}
    </>
  )
}
