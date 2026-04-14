import type { ReactNode } from 'react'

import Link from 'next/link'

import { MarkdownContent } from '@/components/site/MarkdownContent'
import { PretextMasonryCards } from '@/components/site/PretextMasonryCards'
import { TypesetText } from '@/components/site/TypesetText'
import type {
  CmsButtonView,
  CmsCardGridSectionView,
  CmsCompanyOverviewSectionView,
  CmsCardView,
  CmsFeatureShowcaseSectionView,
  CmsPageSectionView,
  CmsProcessStepsSectionView,
  CmsSectionHeaderAlignment,
  CmsSplitPanelSectionView,
  CmsUseCaseGridSectionView,
} from '@/lib/site/cms'

/**
 * 生成带对齐修饰符的 className
 * @param baseClassName 基础类名
 * @param alignment 头部对齐方式
 * @returns className
 */
function getAlignedHeaderClassName(
  baseClassName: string,
  alignment?: CmsSectionHeaderAlignment,
): string {
  if (!alignment || alignment === 'left') {
    return baseClassName
  }

  return `${baseClassName} ${baseClassName}--${alignment}`
}

/**
 * 渲染 section 公共头部
 * @param locale 当前语言
 * @param label 角标
 * @param title 标题
 * @param description 描述
 * @param alignment 头部对齐方式
 * @returns 头部节点
 */
function renderSectionHeader(
  locale?: string,
  label?: string,
  title?: string,
  description?: string,
  alignment?: CmsSectionHeaderAlignment,
): ReactNode {
  if (!label && !title && !description) {
    return null
  }

  return (
    <div className={getAlignedHeaderClassName('section__header', alignment)}>
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
 * 渲染普通文本链接
 * @param href 链接地址
 * @param label 链接文案
 * @param className 样式类
 * @returns 链接节点
 */
function renderLink(href: string, label: string, className: string): ReactNode {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:')

  if (isExternal) {
    return (
      <a className={className} href={href}>
        {label}
      </a>
    )
  }

  return (
    <Link className={className} href={href}>
      {label}
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

  if (section.style === 'default' && section.layoutMode === 'auto' && section.cards.length > 1) {
    return <PretextMasonryCards cards={section.cards} columns={section.columns} locale={locale} />
  }

  const cardsClassName = ['cards', `cards--${section.columns}`]

  if (section.style === 'steps') {
    cardsClassName.push('steps')
  }

  return (
    <div className={cardsClassName.join(' ')}>
      {section.cards.map((card, index) => (
        <article key={`${card.title}-${index}`} className="card">
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
 * 渲染功能展示 section
 * @param section 分节数据
 * @param locale 当前语言
 * @returns 分节节点
 */
function renderFeatureShowcaseSection(
  section: CmsFeatureShowcaseSectionView,
  locale?: string,
): ReactNode {
  return (
    <>
      {renderSectionHeader(locale, section.label, section.title, section.description, section.headerAlignment)}
      <div className="feature-showcase">
        {section.items.map((item) => (
          <article
            key={`${item.eyebrow}-${item.title}`}
            className={`feature ${item.reversed ? 'feature--reverse' : ''}`}
          >
            <div className="feature__visual" aria-hidden="true">
              <div className="feature__diagram">
                {renderFeatureVisual(item.visualVariant)}
              </div>
            </div>
            <div className="feature__copy">
              <span className="label">{item.eyebrow}</span>
              <TypesetText as="h3" locale={locale} text={item.title} variant="cardTitle">
                {item.title}
              </TypesetText>
              {item.lead ? (
                <TypesetText as="p" className="lead" locale={locale} text={item.lead} variant="body">
                  {item.lead}
                </TypesetText>
              ) : null}
              {item.body ? (
                <TypesetText as="p" className="feature__body" locale={locale} text={item.body} variant="body">
                  {item.body}
                </TypesetText>
              ) : null}
              {item.bullets.length > 0 ? (
                <ul className="feature__list">
                  {item.bullets.map((bullet) => (
                    <TypesetText key={bullet} as="li" locale={locale} text={bullet} variant="listItem">
                      {bullet}
                    </TypesetText>
                  ))}
                </ul>
              ) : null}
              {item.linkLabel && item.linkHref ? renderLink(item.linkHref, item.linkLabel, 'feature__link') : null}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

/**
 * 渲染流程步骤 section
 * @param section 分节数据
 * @param locale 当前语言
 * @returns 分节节点
 */
function renderProcessStepsSection(section: CmsProcessStepsSectionView, locale?: string): ReactNode {
  return (
    <>
      <div className="section__head">
        {section.label ? <span className="label">{section.label}</span> : null}
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
      </div>
      <div className="hiw__steps">
        {section.steps.map((step, index) => (
          <article key={`${step.title}-${index}`} className="hiw__step">
            <div className="hiw__num">{step.label || String(index + 1).padStart(2, '0')}</div>
            <div className="hiw__body">
              <TypesetText as="h3" locale={locale} text={step.title} variant="cardTitle">
                {step.title}
              </TypesetText>
              <TypesetText as="p" locale={locale} text={step.body} variant="body">
                {step.body}
              </TypesetText>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

/**
 * 渲染左右分栏 section
 * @param section 分节数据
 * @param locale 当前语言
 * @returns 分节节点
 */
function renderSplitPanelSection(section: CmsSplitPanelSectionView, locale?: string): ReactNode {
  return (
    <>
      <div className="section__head">
        {section.label ? <span className="label">{section.label}</span> : null}
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
      </div>
      {section.style === 'memory' ? (
        <div className="memory__layout">
          <div className="memory__layers">
            {section.entries.map((entry) => (
              <article key={entry.title} className="memory-layer">
                <TypesetText as="h3" locale={locale} text={entry.title} variant="cardTitle">
                  {entry.title}
                </TypesetText>
                <TypesetText as="p" locale={locale} text={entry.body} variant="body">
                  {entry.body}
                </TypesetText>
              </article>
            ))}
          </div>
          <div className="memory__summary">
            {section.panelTitle ? (
              <TypesetText as="h3" locale={locale} text={section.panelTitle} variant="cardTitle">
                {section.panelTitle}
              </TypesetText>
            ) : null}
            {section.panelItems.length > 0 ? (
              <ul>
                {section.panelItems.map((item) => (
                  <TypesetText key={item} as="li" locale={locale} text={item} variant="listItem">
                    {item}
                  </TypesetText>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="skills__layout">
          <div className="tier-stack">
            {section.entries.map((entry) => (
              <article key={entry.title} className="tier-card">
                {entry.badge ? <div className="tier-badge">{entry.badge}</div> : null}
                <div>
                  <TypesetText as="h3" locale={locale} text={entry.title} variant="cardTitle">
                    {entry.title}
                  </TypesetText>
                  <TypesetText as="p" locale={locale} text={entry.body} variant="body">
                    {entry.body}
                  </TypesetText>
                </div>
              </article>
            ))}
          </div>
          <div className="skills__panel">
            {section.panelTitle ? (
              <TypesetText as="h3" locale={locale} text={section.panelTitle} variant="cardTitle">
                {section.panelTitle}
              </TypesetText>
            ) : null}
            {section.panelItems.map((item) => (
              <div key={item} className="skill-row">
                <span className="skill-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/**
 * 渲染 Use Case 网格 section
 * @param section 分节数据
 * @param locale 当前语言
 * @returns 分节节点
 */
function renderUseCaseGridSection(section: CmsUseCaseGridSectionView, locale?: string): ReactNode {
  return (
    <>
      <div className="section__head">
        {section.label ? <span className="label">{section.label}</span> : null}
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
      </div>
      <div className="usecases__grid">
        {section.items.map((item) => (
          <article key={`${item.role}-${item.title}`} className="usecase-card">
            <div className="usecase-card__head">
              <p className="usecase-card__role">{item.role}</p>
              <TypesetText as="h3" locale={locale} text={item.title} variant="cardTitle">
                {item.title}
              </TypesetText>
            </div>
            <div className="usecase-card__body">
              {item.paragraphs.map((paragraph) => (
                <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
                  {paragraph}
                </TypesetText>
              ))}
              {item.result ? <div className="usecase-card__result">{item.result}</div> : null}
              {item.href ? renderLink(item.href, 'View detail →', 'feature__link') : null}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

/**
 * 渲染公司概览 section
 * @param section 分节数据
 * @param locale 当前语言
 * @returns 分节节点
 */
function renderCompanyOverviewSection(
  section: CmsCompanyOverviewSectionView,
  locale?: string,
): ReactNode {
  return (
    <>
      <div className="section__head">
        {section.label ? <span className="label">{section.label}</span> : null}
        {section.title ? (
          <TypesetText as="h2" locale={locale} text={section.title} variant="sectionTitle">
            {section.title}
          </TypesetText>
        ) : null}
        {section.subtitle ? (
          <TypesetText as="p" className="about__subtitle" locale={locale} text={section.subtitle} variant="sectionBody">
            {section.subtitle}
          </TypesetText>
        ) : null}
      </div>

      {section.missionTitle || section.missionLead || section.missionParagraphs.length > 0 ? (
        <div className="about__mission">
          {section.missionTitle ? (
            <TypesetText as="h3" className="grad-text" locale={locale} text={section.missionTitle} variant="cardTitle">
              {section.missionTitle}
            </TypesetText>
          ) : null}
          {section.missionLead ? (
            <TypesetText as="p" className="about__lead" locale={locale} text={section.missionLead} variant="body">
              {section.missionLead}
            </TypesetText>
          ) : null}
          {section.missionParagraphs.map((paragraph) => (
            <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
              {paragraph}
            </TypesetText>
          ))}
        </div>
      ) : null}

      {section.storyTitle || section.storyLead || section.storyParagraphs.length > 0 ? (
        <div className="about__story">
          {section.storyTitle ? (
            <TypesetText as="h3" className="grad-text" locale={locale} text={section.storyTitle} variant="cardTitle">
              {section.storyTitle}
            </TypesetText>
          ) : null}
          {section.storyLead ? (
            <TypesetText as="p" className="about__lead" locale={locale} text={section.storyLead} variant="body">
              {section.storyLead}
            </TypesetText>
          ) : null}
          {section.storyParagraphs.map((paragraph) => (
            <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
              {paragraph}
            </TypesetText>
          ))}
        </div>
      ) : null}

      {section.stats.length > 0 ? (
        <div className="about__stats">
          {section.stats.map((stat) => (
            <div key={`${stat.value}-${stat.label}`} className="stat-item">
              <p className="stat-num">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {section.recognitionTitle || section.recognitionItems.length > 0 ? (
        <div className="about__recognition">
          {section.recognitionTitle ? <h3>{section.recognitionTitle}</h3> : null}
          {section.recognitionItems.length > 0 ? (
            <ul className="recognition__list">
              {section.recognitionItems.map((item) => (
                <TypesetText key={item} as="li" locale={locale} text={item} variant="listItem">
                  {item}
                </TypesetText>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {section.contactTitle || section.contactParagraphs.length > 0 || section.contactLink ? (
        <div className="about__contact">
          {section.contactTitle ? <h3>{section.contactTitle}</h3> : null}
          {section.contactParagraphs.map((paragraph) => (
            <TypesetText key={paragraph} as="p" locale={locale} text={paragraph} variant="body">
              {paragraph}
            </TypesetText>
          ))}
          {section.contactLink ? (
            <p>{renderLink(section.contactLink.href, section.contactLink.label, 'about__contact-link')}</p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

/**
 * 渲染首页功能示意图
 * @param variant 图示类型
 * @returns 图示节点
 */
function renderFeatureVisual(variant: CmsFeatureShowcaseSectionView['items'][number]['visualVariant']): ReactNode {
  switch (variant) {
    case 'persistentMemory':
      return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="320" height="64" rx="14" fill="rgba(99,102,241,0.14)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" />
          <text x="44" y="49" fill="#a5b4fc" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.06em">GLOBAL USER PROFILE</text>
          <text x="44" y="67" fill="#555" fontSize="10" fontFamily="Inter,sans-serif">Preferences · Working style · Standards · History</text>
          <rect x="44" y="104" width="272" height="60" rx="14" fill="rgba(99,102,241,0.09)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <text x="64" y="131" fill="#a5b4fc" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.06em">PROJECT MEMORY</text>
          <text x="64" y="149" fill="#555" fontSize="10" fontFamily="Inter,sans-serif">Goals · Background · Stakeholders · Decisions</text>
          <rect x="68" y="184" width="224" height="60" rx="14" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.18)" strokeWidth="1.5" />
          <text x="86" y="211" fill="#a5b4fc" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.06em">TOPIC THREAD</text>
          <text x="86" y="229" fill="#555" fontSize="10" fontFamily="Inter,sans-serif">Conversation · Files · Causal history</text>
          <line x1="180" y1="84" x2="180" y2="104" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="180" y1="164" x2="180" y2="184" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
      )
    case 'autonomousExecution':
      return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="115" y="16" width="130" height="44" rx="10" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
          <text x="180" y="44" fill="#c7d2fe" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="600" textAnchor="middle">Goal Decomposition</text>
          <line x1="180" y1="60" x2="100" y2="104" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" />
          <line x1="180" y1="60" x2="180" y2="104" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" />
          <line x1="180" y1="60" x2="260" y2="104" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" />
          <rect x="52" y="104" width="96" height="40" rx="9" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="100" y="129" fill="#a5b4fc" fontSize="9.5" fontFamily="Inter,sans-serif" textAnchor="middle">Sub-Agent A</text>
          <rect x="132" y="104" width="96" height="40" rx="9" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="180" y="129" fill="#a5b4fc" fontSize="9.5" fontFamily="Inter,sans-serif" textAnchor="middle">Sub-Agent B</text>
          <rect x="212" y="104" width="96" height="40" rx="9" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="260" y="129" fill="#a5b4fc" fontSize="9.5" fontFamily="Inter,sans-serif" textAnchor="middle">Sub-Agent C</text>
          <line x1="100" y1="144" x2="180" y2="188" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <line x1="180" y1="144" x2="180" y2="188" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <line x1="260" y1="144" x2="180" y2="188" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <rect x="120" y="188" width="120" height="44" rx="10" fill="rgba(102,126,234,0.18)" stroke="rgba(102,126,234,0.45)" strokeWidth="1.5" />
          <text x="180" y="216" fill="#c7d2fe" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="600" textAnchor="middle">Validation Agent</text>
          <line x1="180" y1="232" x2="180" y2="256" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="132" y="256" width="96" height="14" rx="7" fill="rgba(99,102,241,0.25)" />
          <text x="180" y="267" fill="#a5b4fc" fontSize="8.5" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Output Delivered</text>
        </svg>
      )
    case 'selfEvolvingSkills':
      return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="180" cy="140" r="90" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="180" cy="140" r="56" stroke="rgba(99,102,241,0.22)" strokeWidth="1.5" strokeDasharray="6 4" />
          <rect x="148" y="24" width="64" height="36" rx="10" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="180" y="44" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Work Session</text>
          <rect x="246" y="80" width="80" height="36" rx="10" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="286" y="100" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Correction Logged</text>
          <rect x="246" y="174" width="80" height="36" rx="10" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="286" y="194" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">SOP Extracted</text>
          <rect x="142" y="230" width="76" height="36" rx="10" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="180" y="250" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Skill Published</text>
          <rect x="30" y="174" width="80" height="36" rx="10" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="70" y="194" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Standard Updated</text>
          <rect x="34" y="80" width="80" height="36" rx="10" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="74" y="100" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Memory Deepens</text>
          <text x="180" y="135" fill="#6366f1" fontSize="11" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="700">Self-Evolving</text>
          <text x="180" y="152" fill="#6366f1" fontSize="11" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="700">Flywheel</text>
        </svg>
      )
    case 'intelligentFileSearch':
      return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="320" height="240" rx="16" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.18)" strokeWidth="1.5" />
          <text x="40" y="46" fill="#555" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing=".06em">WORKSPACE SEMANTIC MAP</text>
          <rect x="40" y="60" width="80" height="48" rx="9" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <text x="80" y="89" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Research</text>
          <rect x="140" y="60" width="80" height="48" rx="9" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <text x="180" y="89" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Proposals</text>
          <rect x="240" y="60" width="80" height="48" rx="9" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
          <text x="280" y="89" fill="#a5b4fc" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Reports</text>
          <line x1="180" y1="140" x2="180" y2="108" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="180" cy="152" r="16" fill="rgba(99,102,241,0.22)" stroke="rgba(99,102,241,0.55)" strokeWidth="1.5" />
          <text x="180" y="157" fill="#a5b4fc" fontSize="10" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="700">Q</text>
          <rect x="120" y="186" width="120" height="48" rx="10" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.6)" strokeWidth="2" />
          <text x="180" y="207" fill="#c7d2fe" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">Market-analysis-Q1.pdf</text>
          <text x="180" y="222" fill="#6366f1" fontSize="8.5" fontFamily="Inter,sans-serif" textAnchor="middle">Precision match · Low token cost</text>
        </svg>
      )
    case 'intentAlignment':
      return (
        <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="30" width="280" height="44" rx="11" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="180" y="49" fill="#c7d2fe" fontSize="10" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">1 — Describe your goal</text>
          <text x="180" y="65" fill="#555" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Plain-language intent input</text>
          <line x1="180" y1="74" x2="180" y2="94" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="40" y="94" width="280" height="44" rx="11" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="180" y="113" fill="#c7d2fe" fontSize="10" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">2 — Plan Mode alignment</text>
          <text x="180" y="129" fill="#555" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Full action plan output · Confidence scoring</text>
          <line x1="180" y1="138" x2="180" y2="158" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="40" y="158" width="280" height="44" rx="11" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
          <text x="180" y="177" fill="#c7d2fe" fontSize="10" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="600">3 — You approve</text>
          <text x="180" y="193" fill="#555" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Review plan · Amend if needed · Confirm</text>
          <line x1="180" y1="202" x2="180" y2="222" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="40" y="222" width="280" height="44" rx="11" fill="rgba(102,126,234,0.2)" stroke="rgba(99,102,241,0.55)" strokeWidth="2" />
          <text x="180" y="241" fill="#c7d2fe" fontSize="10" fontFamily="Inter,sans-serif" textAnchor="middle" fontWeight="700">4 — Execution + Validation</text>
          <text x="180" y="257" fill="#6366f1" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">Full-auto or checkpoint mode · Traceable</text>
        </svg>
      )
  }
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
        const sectionId = section.slotKey || undefined

        switch (section.type) {
          case 'richText':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className={getSectionClassName({
                  article: section.style === 'article',
                  fullScreen,
                })}
              >
                {renderSectionHeader(
                  locale,
                  section.label,
                  section.title,
                  section.description,
                  section.headerAlignment,
                )}
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
                id={sectionId}
                className={getSectionClassName({ fullScreen })}
              >
                {renderSectionHeader(
                  locale,
                  section.label,
                  section.title,
                  section.description,
                  section.headerAlignment,
                )}
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
                      {section.style === 'default' && section.layoutMode === 'auto' && section.cards.length > 1 ? (
                        <PretextMasonryCards cards={section.cards} columns={section.columns} locale={locale} />
                      ) : (
                        section.cards.map((card, cardIndex) => (
                          <article key={`${card.title}-${cardIndex}`} className="panel">
                            {card.eyebrow ? <span className="page__eyebrow">{card.eyebrow}</span> : null}
                            <TypesetText as="h3" locale={locale} text={card.title} variant="cardTitle">
                              {card.title}
                            </TypesetText>
                            {renderCardBody(card, locale)}
                          </article>
                        ))
                      )}
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
                id={sectionId}
                className={getSectionClassName({ fullScreen })}
              >
                {section.style === 'plain'
                  ? renderSectionHeader(
                      locale,
                      section.label,
                      section.title,
                      section.description,
                      section.headerAlignment,
                    )
                  : null}
                <div className={section.style === 'plain' ? 'panel' : 'feature-detail__summary'}>
                  {section.style !== 'plain'
                    ? renderSectionHeader(
                        locale,
                        section.label,
                        section.title,
                        section.description,
                        section.headerAlignment,
                      )
                    : null}
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
          case 'featureShowcase':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className={getSectionClassName({ fullScreen })}
              >
                {renderFeatureShowcaseSection(section, locale)}
              </section>
            )
          case 'processSteps':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className={getSectionClassName({ fullScreen })}
              >
                {renderProcessStepsSection(section, locale)}
              </section>
            )
          case 'splitPanel':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className={getSectionClassName({ fullScreen })}
              >
                {renderSplitPanelSection(section, locale)}
              </section>
            )
          case 'useCaseGrid':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className={getSectionClassName({ fullScreen })}
              >
                {renderUseCaseGridSection(section, locale)}
              </section>
            )
          case 'companyOverview':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                className={getSectionClassName({ fullScreen })}
              >
                {renderCompanyOverviewSection(section, locale)}
              </section>
            )
          case 'cta':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className="cta-section"
              >
                <div className="cta-section__inner">
                  {section.label ? <span className="label">{section.label}</span> : null}
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
                  {section.footnote ? (
                    <TypesetText as="p" className="cta-trust" locale={locale} text={section.footnote} variant="body">
                      {section.footnote}
                    </TypesetText>
                  ) : null}
                </div>
              </section>
            )
          case 'markdownDocument':
            return (
              <section
                key={`${section.type}-${section.slotKey ?? index}`}
                id={sectionId}
                className={getSectionClassName({ article: true, fullScreen })}
              >
                {renderSectionHeader(
                  locale,
                  section.label,
                  section.title,
                  undefined,
                  section.headerAlignment,
                )}
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
