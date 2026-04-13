import type { ReactNode } from 'react'

import Link from 'next/link'

import { MarkdownContent } from '@/components/site/MarkdownContent'
import { TypesetText } from '@/components/site/TypesetText'
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
  locale?: string,
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
      {title ? (
        <TypesetText as="h2" locale={locale} text={title} variant="sectionTitle">
          {title}
        </TypesetText>
      ) : null}
      {description ? (
        <TypesetText as="p" locale={locale} text={description} variant="sectionBody">
          {description}
        </TypesetText>
      ) : null}
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
function renderCardBody(card: CmsCardView, locale?: string): ReactNode {
  return (
    <>
      {card.body ? (
        <TypesetText as="p" locale={locale} text={card.body} variant="body">
          {card.body}
        </TypesetText>
      ) : null}
      {card.paragraphs.map((paragraph) => (
        <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
          {paragraph}
        </TypesetText>
      ))}
      {card.bullets.length > 0 ? (
        <ul>
          {card.bullets.map((bullet) => (
            <TypesetText key={bullet} as="li" locale={locale} text={bullet} variant="listItem">
              {bullet}
            </TypesetText>
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
function renderStatCard(card: CmsCardView, locale?: string): ReactNode {
  return (
    <article key={card.title} className="stat">
      <TypesetText as="p" className="stat__value" locale={locale} text={card.title} variant="statValue">
        {card.title}
      </TypesetText>
      <TypesetText
        as="p"
        className="stat__label"
        locale={locale}
        text={card.body || card.paragraphs[0] || card.bullets[0] || ''}
        variant="statLabel"
      >
        {card.body || card.paragraphs[0] || card.bullets[0] || ''}
      </TypesetText>
    </article>
  )
}

/**
 * 渲染普通卡片网格
 * @param section 卡片分节
 * @returns 卡片区节点
 */
function renderCardGrid(section: CmsCardGridSectionView, locale?: string): ReactNode {
  if (section.style === 'stats') {
    return <div className="stats">{section.cards.map((card) => renderStatCard(card, locale))}</div>
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
          <TypesetText as="h3" locale={locale} text={card.title} variant="cardTitle">
            {card.title}
          </TypesetText>
          {renderCardBody(card, locale)}
        </article>
      ))}
    </div>
  )
}

/**
 * 生成 section 容器类名
 * @param options 分节布局选项
 * @returns className
 */
function getSectionClassName(options: { article?: boolean; fullScreen?: boolean }): string {
  const classNames = ['site-shell', 'section']

  if (options.article) {
    classNames.push('article')
  }

  if (options.fullScreen && !options.article) {
    classNames.push('section--screen')
  }

  return classNames.join(' ')
}

/**
 * 统一渲染营销页 section
 * @param props section 列表
 * @returns 页面分节节点
 */
export function PageSections(props: { fullScreen?: boolean; locale?: string; sections: CmsPageSectionView[] }) {
  const { fullScreen = false, locale, sections } = props

  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'richText':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={getSectionClassName({
                  article: section.style === 'article',
                  fullScreen,
                })}
              >
                {renderSectionHeader(locale, section.label, section.title, section.description)}
                {section.paragraphs.length > 0 || section.bullets.length > 0 ? (
                  <div className={section.style === 'plain' ? undefined : 'panel'}>
                    {section.paragraphs.map((paragraph) => (
                      <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="articleBody">
                        {paragraph}
                      </TypesetText>
                    ))}
                    {section.bullets.length > 0 ? (
                      <ul>
                        {section.bullets.map((bullet) => (
                          <TypesetText key={bullet} as="li" locale={locale} text={bullet} variant="listItem">
                            {bullet}
                          </TypesetText>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </section>
            )
          case 'cardGrid':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={getSectionClassName({ fullScreen })}
              >
                {renderSectionHeader(locale, section.label, section.title, section.description)}
                {section.cards.length > 0 && (section.paragraphs.length > 0 || section.bullets.length > 0) ? (
                  <div className="feature-detail__layout">
                    <div className="panel">
                      {section.paragraphs.map((paragraph) => (
                        <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="sectionBody">
                          {paragraph}
                        </TypesetText>
                      ))}
                      {section.bullets.length > 0 ? (
                        <ul>
                          {section.bullets.map((bullet) => (
                            <TypesetText key={bullet} as="li" locale={locale} text={bullet} variant="listItem">
                              {bullet}
                            </TypesetText>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="panel-grid">
                      {section.cards.map((card) => (
                        <article key={card.title} className="panel">
                          {card.eyebrow ? <span className="page__eyebrow">{card.eyebrow}</span> : null}
                          <TypesetText as="h3" locale={locale} text={card.title} variant="cardTitle">
                            {card.title}
                          </TypesetText>
                          {renderCardBody(card, locale)}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderCardGrid(section, locale)
                )}
              </section>
            )
          case 'bulletList':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={getSectionClassName({ fullScreen })}
              >
                {section.style === 'plain'
                  ? renderSectionHeader(locale, section.label, section.title, section.description)
                  : null}
                <div className={section.style === 'plain' ? 'panel' : 'feature-detail__summary'}>
                  {section.style !== 'plain' && section.label ? (
                    <span className="page__eyebrow">{section.label}</span>
                  ) : null}
                  {section.title ? (
                    <TypesetText as="h2" locale={locale} text={section.title} variant="sectionTitle">
                      {section.title}
                    </TypesetText>
                  ) : null}
                  {section.description ? (
                    <TypesetText as="p" locale={locale} text={section.description} variant="sectionBody">
                      {section.description}
                    </TypesetText>
                  ) : null}
                  {section.items.length > 0 ? (
                    <ul>
                      {section.items.map((item) => (
                        <TypesetText key={item} as="li" locale={locale} text={item} variant="listItem">
                          {item}
                        </TypesetText>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            )
          case 'cta':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={getSectionClassName({ fullScreen })}
              >
                <div className="feature-detail__summary">
                  {section.label ? <span className="page__eyebrow">{section.label}</span> : null}
                  {section.title ? (
                    <TypesetText as="h2" locale={locale} text={section.title} variant="sectionTitle">
                      {section.title}
                    </TypesetText>
                  ) : null}
                  {section.description ? (
                    <TypesetText as="p" locale={locale} text={section.description} variant="sectionBody">
                      {section.description}
                    </TypesetText>
                  ) : null}
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
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={getSectionClassName({ article: true, fullScreen })}
              >
                {renderSectionHeader(locale, section.label, section.title, undefined)}
                <div className="panel">
                  <MarkdownContent locale={locale} markdown={section.markdown} />
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
