import type { ReactNode } from 'react'

import Link from 'next/link'

import { MarkdownContent } from '@/components/site/MarkdownContent'
import type {
  CmsButtonView,
  CmsCardGridSectionView,
  CmsCardView,
  CmsPageSectionView,
} from '@/lib/site/cms'

/**
 * 渲染 section 公共头部
 * @param label 角标
 * @param title 标题
 * @param description 描述
 * @returns 头部节点
 */
function renderSectionHeader(
  label?: string,
  title?: string,
  description?: string,
): ReactNode {
  if (!label && !title && !description) {
    return null
  }

  return (
    <div className="section__header">
      {label ? <span className="page__eyebrow">{label}</span> : null}
      {title ? <h2>{title}</h2> : null}
      {description ? <p>{description}</p> : null}
    </div>
  )
}

/**
 * 渲染按钮
 * @param button 按钮配置
 * @param variant 按钮样式
 * @returns 按钮节点
 */
function renderButton(
  button: CmsButtonView,
  variant: 'button--ghost' | 'button--solid',
): ReactNode {
  const className = `button ${variant}`
  const isExternal = button.href.startsWith('http') || button.href.startsWith('mailto:')

  if (isExternal) {
    return (
      <a className={className} href={button.href}>
        {button.label}
      </a>
    )
  }

  return (
    <Link className={className} href={button.href}>
      {button.label}
    </Link>
  )
}

/**
 * 渲染卡片内正文
 * @param card 卡片视图
 * @returns 卡片正文节点
 */
function renderCardBody(card: CmsCardView): ReactNode {
  return (
    <>
      {card.body ? <p>{card.body}</p> : null}
      {card.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {card.bullets.length > 0 ? (
        <ul>
          {card.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

/**
 * 渲染统计卡片
 * @param card 卡片视图
 * @returns 统计卡片节点
 */
function renderStatCard(card: CmsCardView): ReactNode {
  return (
    <article key={card.title} className="stat">
      <div className="stat__value">{card.title}</div>
      <div className="stat__label">{card.body || card.paragraphs[0] || card.bullets[0] || ''}</div>
    </article>
  )
}

/**
 * 渲染普通卡片网格
 * @param section 卡片分节
 * @returns 卡片区节点
 */
function renderCardGrid(section: CmsCardGridSectionView): ReactNode {
  if (section.style === 'stats') {
    return <div className="stats">{section.cards.map((card) => renderStatCard(card))}</div>
  }

  const cardsClassName = ['cards', `cards--${section.columns}`]

  if (section.style === 'steps') {
    cardsClassName.push('steps')
  }

  return (
    <div className={cardsClassName.join(' ')}>
      {section.cards.map((card) => (
        <article key={card.title} className="card">
          {card.eyebrow ? <span className="page__eyebrow">{card.eyebrow}</span> : null}
          <h3>{card.title}</h3>
          {renderCardBody(card)}
        </article>
      ))}
    </div>
  )
}

/**
 * 统一渲染营销页 section
 * @param props section 列表
 * @returns 页面分节节点
 */
export function PageSections(props: { sections: CmsPageSectionView[] }) {
  const { sections } = props

  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'richText':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={section.style === 'article' ? 'site-shell section article' : 'site-shell section'}
              >
                {renderSectionHeader(section.label, section.title, section.description)}
                {section.paragraphs.length > 0 || section.bullets.length > 0 ? (
                  <div className={section.style === 'plain' ? undefined : 'panel'}>
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
                ) : null}
              </section>
            )
          case 'cardGrid':
            return (
              <section key={`${section.type}-${section.slotKey ?? index}`} className="site-shell section">
                {renderSectionHeader(section.label, section.title, section.description)}
                {section.cards.length > 0 && (section.paragraphs.length > 0 || section.bullets.length > 0) ? (
                  <div className="feature-detail__layout">
                    <div className="panel">
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
                    <div className="panel-grid">
                      {section.cards.map((card) => (
                        <article key={card.title} className="panel">
                          {card.eyebrow ? <span className="page__eyebrow">{card.eyebrow}</span> : null}
                          <h3>{card.title}</h3>
                          {renderCardBody(card)}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderCardGrid(section)
                )}
              </section>
            )
          case 'bulletList':
            return (
              <section key={`${section.type}-${section.slotKey ?? index}`} className="site-shell section">
                {section.style === 'plain' ? renderSectionHeader(section.label, section.title, section.description) : null}
                <div className={section.style === 'plain' ? 'panel' : 'feature-detail__summary'}>
                  {section.style !== 'plain' && section.label ? (
                    <span className="page__eyebrow">{section.label}</span>
                  ) : null}
                  {section.title ? <h2>{section.title}</h2> : null}
                  {section.description ? <p>{section.description}</p> : null}
                  {section.items.length > 0 ? (
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            )
          case 'cta':
            return (
              <section key={`${section.type}-${section.slotKey ?? index}`} className="site-shell section">
                <div className="feature-detail__summary">
                  {section.label ? <span className="page__eyebrow">{section.label}</span> : null}
                  {section.title ? <h2>{section.title}</h2> : null}
                  {section.description ? <p>{section.description}</p> : null}
                  {section.primaryCta || section.secondaryCta ? (
                    <div className="page__hero-actions">
                      {section.primaryCta ? renderButton(section.primaryCta, 'button--solid') : null}
                      {section.secondaryCta ? renderButton(section.secondaryCta, 'button--ghost') : null}
                    </div>
                  ) : null}
                </div>
              </section>
            )
          case 'markdownDocument':
            return (
              <section key={`${section.type}-${section.slotKey ?? index}`} className="site-shell section article">
                {renderSectionHeader(section.label, section.title, undefined)}
                <div className="panel">
                  <MarkdownContent markdown={section.markdown} />
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </>
  )
}
