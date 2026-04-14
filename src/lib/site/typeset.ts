import type { SiteLocale } from '@/lib/site/i18n'

/**
 * 站点正文排版变体
 */
export type TypesetVariant =
  | 'heroTitle'
  | 'pageTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'heroBody'
  | 'sectionBody'
  | 'body'
  | 'articleBody'
  | 'listItem'
  | 'tableCell'
  | 'statValue'
  | 'statLabel'

/**
 * 正文排版策略
 */
export type TypesetPolicy = {
  /** 是否对标题执行宽度平衡 */
  mode: 'balance' | 'flow'
  /** 搜索平衡宽度时的最小比例 */
  minWidthRatio: number
  /** 平衡宽度采样数量 */
  sampleCount: number
  /** 估算正文宽度时要扣除的内容内边距 */
  contentInset: number
}

/**
 * 标题宽度搜索结果
 */
export type BalancedWidthResult = {
  /** 推荐的标题宽度 */
  width: number
  /** 推荐宽度对应的行数 */
  lineCount: number
}

/**
 * 用于平衡标题的行宽统计
 */
export type BalancedLineStats = {
  /** 当前候选宽度下的行数 */
  lineCount: number
  /** 每一行的实际宽度 */
  lineWidths: number[]
}

/**
 * 从计算样式中抽取的排版度量
 */
export type TypesetTypography = {
  /** Canvas 可识别的 font shorthand */
  font: string
  /** 像素级行高 */
  lineHeight: number
}

/**
 * 排版变体到行为策略的映射
 * 这里只表达行为差异，具体字体和字号统一从运行时计算样式中提取。
 */
export const TYPESET_POLICIES: Record<TypesetVariant, TypesetPolicy> = {
  heroTitle: { mode: 'balance', minWidthRatio: 0.58, sampleCount: 16, contentInset: 0 },
  pageTitle: { mode: 'balance', minWidthRatio: 0.62, sampleCount: 14, contentInset: 0 },
  sectionTitle: { mode: 'balance', minWidthRatio: 0.62, sampleCount: 14, contentInset: 0 },
  cardTitle: { mode: 'balance', minWidthRatio: 0.72, sampleCount: 10, contentInset: 0 },
  heroBody: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 0 },
  sectionBody: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 0 },
  body: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 0 },
  articleBody: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 0 },
  listItem: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 20 },
  tableCell: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 0 },
  statValue: { mode: 'balance', minWidthRatio: 0.86, sampleCount: 6, contentInset: 0 },
  statLabel: { mode: 'flow', minWidthRatio: 1, sampleCount: 1, contentInset: 0 },
}

/**
 * 将站点 locale 归一化为 Pretext 更容易理解的浏览器 locale。
 * @param locale 站点 locale
 * @returns 可传给 Pretext 的 locale
 */
export function resolveTypesetLocale(locale?: null | SiteLocale | string): string {
  if (!locale) {
    return 'en-US'
  }

  return locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

/**
 * 从运行时计算样式提取 Canvas 字体与像素行高。
 * @param style 运行时计算样式
 * @returns 排版度量
 */
export function extractTypographyMetrics(
  style: Pick<
    CSSStyleDeclaration,
    'fontFamily' | 'fontSize' | 'fontStyle' | 'fontVariant' | 'fontWeight' | 'lineHeight'
  >,
): TypesetTypography {
  const fontStyle = normalizeTypographyToken(style.fontStyle, 'normal')
  const fontVariant = normalizeTypographyToken(style.fontVariant, 'normal')
  const fontWeight = normalizeTypographyToken(style.fontWeight, '400')
  const fontSize = normalizeTypographyToken(style.fontSize, '16px')
  const fontFamily = normalizeTypographyToken(style.fontFamily, 'Inter, sans-serif')
  const lineHeight = resolveLineHeight(style.lineHeight, fontSize)

  return {
    font: [fontStyle, fontVariant, fontWeight, fontSize, fontFamily].join(' '),
    lineHeight,
  }
}

/**
 * 解析内容可用宽度。
 * @param containerWidth 容器总宽度
 * @param contentInset 需要扣除的额外内边距
 * @returns Pretext 应使用的内容宽度
 */
export function getTypesetContentWidth(containerWidth: number, contentInset = 0): number {
  return Math.max(containerWidth - contentInset, 1)
}

/**
 * 搜索更均衡的标题宽度，尽量减少极短最后一行。
 * @param options 标题宽度搜索参数
 * @returns 推荐宽度与行数
 */
export function findBalancedWidth(options: {
  containerWidth: number
  minWidthRatio?: number
  sampleCount?: number
  getLineStats: (candidateWidth: number) => BalancedLineStats
}): BalancedWidthResult {
  const { containerWidth, getLineStats, minWidthRatio = 0.62, sampleCount = 14 } = options

  if (containerWidth <= 0) {
    return { width: 0, lineCount: 0 }
  }

  const baseline = getLineStats(containerWidth)

  if (baseline.lineCount <= 1 || baseline.lineWidths.length <= 1) {
    return { width: containerWidth, lineCount: baseline.lineCount }
  }

  let bestWidth = containerWidth
  let bestLineCount = baseline.lineCount
  let bestScore = scoreBalancedCandidate(containerWidth, baseline, baseline)
  const minWidth = Math.max(Math.round(containerWidth * minWidthRatio), 1)

  for (let index = 0; index < sampleCount; index += 1) {
    const ratio = sampleCount === 1 ? 1 : index / (sampleCount - 1)
    const candidateWidth = Math.round(containerWidth - (containerWidth - minWidth) * ratio)
    const candidate = getLineStats(candidateWidth)

    if (candidate.lineWidths.length === 0) {
      continue
    }

    const score = scoreBalancedCandidate(containerWidth, baseline, candidate)

    if (score < bestScore || (score === bestScore && candidateWidth > bestWidth)) {
      bestScore = score
      bestWidth = candidateWidth
      bestLineCount = candidate.lineCount
    }
  }

  return {
    width: bestWidth,
    lineCount: bestLineCount,
  }
}

/**
 * 将行数换算成最终最小高度。
 * @param lineCount 行数
 * @param lineHeight 像素行高
 * @returns 最小高度
 */
export function getTypesetMinHeight(lineCount: number, lineHeight: number): number {
  const normalizedLineCount = Math.max(lineCount, 1)
  return normalizedLineCount * lineHeight
}

/**
 * 归一化排版 token，避免空串进入 Canvas 字体串。
 * @param value 原始值
 * @param fallback 回退值
 * @returns 可用 token
 */
function normalizeTypographyToken(value: string, fallback: string): string {
  const normalized = value.trim()
  return normalized || fallback
}

/**
 * 将 CSS line-height 解析成像素值。
 * @param lineHeight CSS line-height
 * @param fontSize CSS font-size
 * @returns 像素行高
 */
function resolveLineHeight(lineHeight: string, fontSize: string): number {
  const numericLineHeight = Number.parseFloat(lineHeight)

  if (lineHeight.endsWith('px') && Number.isFinite(numericLineHeight)) {
    return numericLineHeight
  }

  const numericFontSize = Number.parseFloat(fontSize)

  if (Number.isFinite(numericLineHeight) && Number.isFinite(numericFontSize)) {
    return numericLineHeight * numericFontSize
  }

  if (Number.isFinite(numericFontSize)) {
    // CSS `normal` 一般接近 1.2 倍字号，这里给出稳定回退。
    return numericFontSize * 1.2
  }

  return 19.2
}

/**
 * 为标题候选宽度打分。
 * @param containerWidth 原始容器宽度
 * @param baseline 原始容器宽度下的行分布
 * @param candidate 候选宽度下的行分布
 * @returns 越小越好
 */
function scoreBalancedCandidate(
  containerWidth: number,
  baseline: BalancedLineStats,
  candidate: BalancedLineStats,
): number {
  const averageWidth = candidate.lineWidths.reduce((total, width) => total + width, 0) / candidate.lineWidths.length
  const raggedness =
    candidate.lineWidths.reduce((total, width) => total + Math.abs(width - averageWidth), 0) /
    (candidate.lineWidths.length * Math.max(containerWidth, 1))
  const widestWidth = Math.max(...candidate.lineWidths)
  const lastLineWidth = candidate.lineWidths.at(-1) ?? widestWidth
  const lastLinePenalty = (widestWidth - lastLineWidth) / Math.max(widestWidth, 1)
  const lineGrowthPenalty = Math.max(0, candidate.lineCount - baseline.lineCount) * 0.32

  return raggedness * 0.45 + lastLinePenalty * 0.45 + lineGrowthPenalty
}
