'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { layout, prepare, setLocale } from '@chenglou/pretext'

import { TypesetText } from '@/components/site/TypesetText'
import type { CmsCardView } from '@/lib/site/cms'
import { extractTypographyMetrics, resolveTypesetLocale } from '@/lib/site/typeset'

/** masonry 卡片基础间距 */
const MASONRY_GAP = 20

/** 卡片允许的最小宽度 */
const MASONRY_MIN_COLUMN_WIDTH = 280

/** 当前已同步到 Pretext 的 locale */
let activePretextLocale: null | string = null

/** 卡片排版结果 */
type PositionedCard = {
  /** 卡片左侧偏移 */
  left: number
  /** 卡片顶部偏移 */
  top: number
  /** 卡片宽度 */
  width: number
}

/** masonry 整体布局结果 */
type MasonryLayoutState = {
  /** 实际列数 */
  columnCount: number
  /** 列宽 */
  columnWidth: number
  /** 容器总高度 */
  height: number
  /** 卡片定位结果 */
  cards: PositionedCard[]
}

/** 卡片测量所需排版参数 */
type CardMeasurementMetrics = {
  /** 卡片上下内边距总和 */
  verticalPadding: number
  /** 卡片水平内边距总和 */
  horizontalPadding: number
  /** 角标占位高度，包含和标题之间的留白 */
  eyebrowBlockHeight: number
  /** 标题字体串 */
  titleFont: string
  /** 标题行高 */
  titleLineHeight: number
  /** 标题段前距 */
  titleMarginTop: number
  /** 正文字体串 */
  bodyFont: string
  /** 正文行高 */
  bodyLineHeight: number
  /** 段落段前距 */
  paragraphMarginTop: number
  /** 列表段前距 */
  listMarginTop: number
  /** 条目段前距 */
  listItemMarginTop: number
}

/** 组件 props */
type PretextMasonryCardsProps = {
  /** 需要排布的卡片 */
  cards: CmsCardView[]
  /** CMS 允许的最大列数 */
  columns: 2 | 3 | 4
  /** 当前 locale */
  locale?: string
  /** 自定义卡片类名 */
  getItemClassName?: (card: CmsCardView, index: number) => string | undefined
  /** 自定义卡片内容 */
  renderCardContent?: (card: CmsCardView, index: number) => ReactNode
}

/**
 * 使用 Pretext 预估文本高度，并按 masonry 方式放置卡片。
 * @param props 组件参数
 * @returns masonry 卡片节点
 */
export function PretextMasonryCards(props: PretextMasonryCardsProps) {
  const { cards, columns, getItemClassName, locale, renderCardContent } = props
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sampleCardRef = useRef<HTMLElement | null>(null)
  const sampleEyebrowRef = useRef<HTMLSpanElement | null>(null)
  const sampleTitleRef = useRef<HTMLHeadingElement | null>(null)
  const sampleParagraphRef = useRef<HTMLParagraphElement | null>(null)
  const sampleListRef = useRef<HTMLUListElement | null>(null)
  const sampleListItemRef = useRef<HTMLLIElement | null>(null)
  const [layoutState, setLayoutState] = useState<MasonryLayoutState | null>(null)

  /**
   * 执行一次 masonry 测量。
   * 这里直接复用 Pretext 的布局引擎估算每张卡的文本高度。
   * 当前发布构建链路不支持 useEffectEvent，这里改为 useCallback 保持兼容。
   */
  const runMeasurement = useCallback(async () => {
    const container = containerRef.current
    const sampleCard = sampleCardRef.current
    const sampleEyebrow = sampleEyebrowRef.current
    const sampleTitle = sampleTitleRef.current
    const sampleParagraph = sampleParagraphRef.current
    const sampleList = sampleListRef.current
    const sampleListItem = sampleListItemRef.current

    if (
      !container ||
      !sampleCard ||
      !sampleEyebrow ||
      !sampleTitle ||
      !sampleParagraph ||
      !sampleList ||
      !sampleListItem ||
      cards.length === 0
    ) {
      setLayoutState(null)
      return
    }

    if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
      return
    }

    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    syncPretextLocale(locale)

    const containerWidth = container.clientWidth

    if (containerWidth <= 0) {
      setLayoutState(null)
      return
    }

    const measurement = readMeasurementMetrics({
      sampleCard,
      sampleEyebrow,
      sampleTitle,
      sampleParagraph,
      sampleList,
      sampleListItem,
    })
    const nextLayoutState = computeMasonryLayout({
      cards,
      columns,
      containerWidth,
      measurement,
    })

    setLayoutState(nextLayoutState)
  }, [cards, columns, locale])

  useEffect(() => {
    void runMeasurement()
  }, [runMeasurement])

  useEffect(() => {
    const container = containerRef.current

    if (!container || typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      void runMeasurement()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [runMeasurement])

  const containerStyle = createContainerStyle(layoutState)

  return (
    <div
      ref={containerRef}
      className="pretext-masonry"
      data-ready={layoutState ? 'true' : 'false'}
      style={containerStyle}
    >
      <article
        ref={sampleCardRef}
        aria-hidden="true"
        className="card pretext-masonry__sample"
      >
        <span ref={sampleEyebrowRef} className="page__eyebrow">
          sample
        </span>
        <h3 ref={sampleTitleRef}>Sample title</h3>
        <p ref={sampleParagraphRef}>Sample paragraph</p>
        <ul ref={sampleListRef}>
          <li ref={sampleListItemRef}>Sample bullet</li>
        </ul>
      </article>

      {cards.map((card, index) => {
        const positionedCard = layoutState?.cards[index]

        return (
          <article
            key={`${card.title}-${index}`}
            className={resolveItemClassName(getItemClassName?.(card, index))}
            style={createCardStyle(positionedCard, layoutState)}
          >
            {renderCardContent ? renderCardContent(card, index) : renderDefaultCardContent(card, locale)}
          </article>
        )
      })}
    </div>
  )
}

/**
 * 渲染默认卡片内容。
 * @param card 卡片数据
 * @param locale 当前 locale
 * @returns 卡片正文
 */
function renderDefaultCardContent(card: CmsCardView, locale?: string): ReactNode {
  return (
    <>
      {card.eyebrow ? <span className="page__eyebrow">{card.eyebrow}</span> : null}
      <TypesetText as="h3" locale={locale} text={card.title} variant="cardTitle">
        {card.title}
      </TypesetText>
      {card.body ? (
        <TypesetText as="p" locale={locale} text={card.body} variant="body">
          {card.body}
        </TypesetText>
      ) : null}
      {card.paragraphs.map((paragraph, paragraphIndex) => (
        <TypesetText
          key={`${card.title}-paragraph-${paragraphIndex}`}
          as="p"
          locale={locale}
          text={paragraph}
          variant="body"
        >
          {paragraph}
        </TypesetText>
      ))}
      {card.bullets.length > 0 ? (
        <ul>
          {card.bullets.map((bullet, bulletIndex) => (
            <TypesetText
              key={`${card.title}-bullet-${bulletIndex}`}
              as="li"
              locale={locale}
              text={bullet}
              variant="listItem"
            >
              {bullet}
            </TypesetText>
          ))}
        </ul>
      ) : null}
    </>
  )
}

/**
 * 读取卡片测量所需的排版参数。
 * @param elements 测量模板节点
 * @returns 用于 Pretext 高度估算的参数
 */
function readMeasurementMetrics(elements: {
  sampleCard: HTMLElement
  sampleEyebrow: HTMLElement
  sampleTitle: HTMLElement
  sampleParagraph: HTMLElement
  sampleList: HTMLElement
  sampleListItem: HTMLElement
}): CardMeasurementMetrics {
  const { sampleCard, sampleEyebrow, sampleTitle, sampleParagraph, sampleList, sampleListItem } = elements
  const cardStyle = window.getComputedStyle(sampleCard)
  const titleStyle = window.getComputedStyle(sampleTitle)
  const paragraphStyle = window.getComputedStyle(sampleParagraph)
  const listStyle = window.getComputedStyle(sampleList)
  const listItemStyle = window.getComputedStyle(sampleListItem)
  const verticalPadding =
    toPixelValue(cardStyle.paddingTop) + toPixelValue(cardStyle.paddingBottom)
  const horizontalPadding =
    toPixelValue(cardStyle.paddingLeft) + toPixelValue(cardStyle.paddingRight)

  return {
    verticalPadding,
    horizontalPadding,
    eyebrowBlockHeight:
      sampleEyebrow.offsetHeight + toPixelValue(window.getComputedStyle(sampleEyebrow).marginBottom),
    titleFont: extractTypographyMetrics(titleStyle).font,
    titleLineHeight: extractTypographyMetrics(titleStyle).lineHeight,
    titleMarginTop: toPixelValue(titleStyle.marginTop),
    bodyFont: extractTypographyMetrics(paragraphStyle).font,
    bodyLineHeight: extractTypographyMetrics(paragraphStyle).lineHeight,
    paragraphMarginTop: toPixelValue(paragraphStyle.marginTop),
    listMarginTop: toPixelValue(listStyle.marginTop),
    listItemMarginTop: toPixelValue(listItemStyle.marginTop),
  }
}

/**
 * 计算 masonry 布局。
 * @param options 布局参数
 * @returns 布局结果
 */
function computeMasonryLayout(options: {
  cards: CmsCardView[]
  columns: 2 | 3 | 4
  containerWidth: number
  measurement: CardMeasurementMetrics
}): MasonryLayoutState {
  const { cards, columns, containerWidth, measurement } = options
  const maxColumnCount = Math.max(1, columns)
  const columnCount = Math.max(
    1,
    Math.min(
      maxColumnCount,
      Math.floor((containerWidth + MASONRY_GAP) / (MASONRY_MIN_COLUMN_WIDTH + MASONRY_GAP)),
    ),
  )
  const columnWidth = Math.max(
    (containerWidth - MASONRY_GAP * Math.max(columnCount - 1, 0)) / columnCount,
    1,
  )
  const columnHeights = new Array<number>(columnCount).fill(0)
  const positionedCards = cards.map((card) => {
    const cardHeight = estimateCardHeight({
      card,
      columnWidth,
      measurement,
    })
    const shortestColumnIndex = findShortestColumn(columnHeights)
    const left = shortestColumnIndex * (columnWidth + MASONRY_GAP)
    const top = columnHeights[shortestColumnIndex] ?? 0

    columnHeights[shortestColumnIndex] = top + cardHeight + MASONRY_GAP

    return {
      left,
      top,
      width: columnWidth,
    } satisfies PositionedCard
  })
  const height = Math.max(...columnHeights.map((value) => Math.max(value - MASONRY_GAP, 0)), 0)

  return {
    columnCount,
    columnWidth,
    height,
    cards: positionedCards,
  }
}

/**
 * 估算单张卡片高度。
 * @param options 卡片测量参数
 * @returns 卡片总高度
 */
function estimateCardHeight(options: {
  card: CmsCardView
  columnWidth: number
  measurement: CardMeasurementMetrics
}): number {
  const { card, columnWidth, measurement } = options
  const textWidth = Math.max(columnWidth - measurement.horizontalPadding, 1)
  let height = measurement.verticalPadding
  let hasBodyContent = false

  if (card.eyebrow) {
    height += measurement.eyebrowBlockHeight
  }

  if (card.title) {
    if (measurement.titleMarginTop > 0) {
      height += measurement.titleMarginTop
    }

    height += layout(prepare(card.title, measurement.titleFont), textWidth, measurement.titleLineHeight).height
  }

  if (card.body) {
    hasBodyContent = true
    height += measurement.paragraphMarginTop
    height += layout(prepare(card.body, measurement.bodyFont), textWidth, measurement.bodyLineHeight).height
  }

  for (const paragraph of card.paragraphs) {
    hasBodyContent = true
    height += measurement.paragraphMarginTop
    height += layout(prepare(paragraph, measurement.bodyFont), textWidth, measurement.bodyLineHeight).height
  }

  if (card.bullets.length > 0) {
    hasBodyContent = true
    height += measurement.listMarginTop

    for (const bullet of card.bullets) {
      height += measurement.listItemMarginTop
      height += layout(prepare(bullet, measurement.bodyFont), textWidth, measurement.bodyLineHeight).height
    }
  }

  if (!hasBodyContent) {
    height += measurement.paragraphMarginTop
  }

  return Math.ceil(height)
}

/**
 * 找到当前最短列。
 * @param columnHeights 每列高度
 * @returns 最短列索引
 */
function findShortestColumn(columnHeights: number[]): number {
  let shortestColumnIndex = 0

  for (let index = 1; index < columnHeights.length; index += 1) {
    if ((columnHeights[index] ?? 0) < (columnHeights[shortestColumnIndex] ?? 0)) {
      shortestColumnIndex = index
    }
  }

  return shortestColumnIndex
}

/**
 * 构建容器内联样式。
 * @param layoutState 布局结果
 * @returns style 对象
 */
function createContainerStyle(layoutState: MasonryLayoutState | null): CSSProperties {
  if (!layoutState) {
    return {}
  }

  return {
    height: `${layoutState.height}px`,
    '--pretext-masonry-columns': String(layoutState.columnCount),
    '--pretext-masonry-column-width': `${layoutState.columnWidth}px`,
  } as CSSProperties
}

/**
 * 构建单张卡片内联样式。
 * @param card 卡片定位结果
 * @param layoutState 容器布局结果
 * @returns style 对象
 */
function createCardStyle(
  card: PositionedCard | undefined,
  layoutState: MasonryLayoutState | null,
): CSSProperties | undefined {
  if (!card || !layoutState) {
    return undefined
  }

  return {
    left: `${card.left}px`,
    top: `${card.top}px`,
    width: `${card.width}px`,
  }
}

/**
 * 统一拼接卡片 className。
 * @param customClassName 额外类名
 * @returns 完整类名
 */
function resolveItemClassName(customClassName?: string): string {
  return customClassName ? `card pretext-masonry__item ${customClassName}` : 'card pretext-masonry__item'
}

/**
 * 将 CSS 像素值安全转换成数字。
 * @param value CSS 属性值
 * @returns 像素数值
 */
function toPixelValue(value: string): number {
  const parsedValue = Number.parseFloat(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

/**
 * 将 locale 同步给 Pretext，避免重复刷新缓存。
 * @param locale 当前页面 locale
 */
function syncPretextLocale(locale?: string) {
  const normalizedLocale = resolveTypesetLocale(locale)

  if (activePretextLocale === normalizedLocale) {
    return
  }

  activePretextLocale = normalizedLocale
  setLocale(normalizedLocale)
}
