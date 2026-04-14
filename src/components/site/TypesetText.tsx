'use client'

import type { CSSProperties, ReactNode } from 'react'
import { createElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { layout, measureLineStats, prepare, prepareWithSegments, setLocale, walkLineRanges } from '@chenglou/pretext'

import {
  TYPESET_POLICIES,
  extractTypographyMetrics,
  findBalancedWidth,
  getTypesetContentWidth,
  getTypesetMinHeight,
  resolveTypesetLocale,
  type TypesetVariant,
} from '@/lib/site/typeset'

/**
 * 允许接管的语义标签
 */
type TypesetTag = 'h1' | 'h2' | 'h3' | 'p' | 'li'

/**
 * 正文排版结果
 */
type TypesetMeasurement = {
  /** 平衡后推荐宽度 */
  maxWidth?: number
  /** 最小高度 */
  minHeight?: number
  /** 当前估算行数 */
  lineCount: number
}

/**
 * 正文排版组件 props
 */
export type TypesetTextProps<TTag extends TypesetTag = TypesetTag> = {
  /** 语义标签 */
  as: TTag
  /** 排版变体 */
  variant: TypesetVariant
  /** 原始纯文本，用于 Pretext 测量 */
  text: string
  /** 当前页面 locale */
  locale?: string
  /** 可选 className */
  className?: string
  /** 实际渲染内容 */
  children?: ReactNode
}

/** 当前已同步到 Pretext 的 locale */
let activePretextLocale: null | string = null

/**
 * 语义化正文排版组件
 * 保留 SSR HTML 结构，只在客户端增强排版宽度与高度。
 * @param props 组件参数
 * @returns 语义文本节点
 */
export function TypesetText<TTag extends TypesetTag>(props: TypesetTextProps<TTag>) {
  const { as, children, className, locale, text, variant } = props
  const elementRef = useRef<HTMLElement | null>(null)
  const [measurement, setMeasurement] = useState<TypesetMeasurement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const policy = TYPESET_POLICIES[variant]

  /**
   * 执行一次排版测量。
   * 当前发布构建链路不支持 useEffectEvent，这里退回到 useCallback 兼容实现。
   */
  const runMeasurement = useCallback(async () => {
    const element = elementRef.current

    if (!element || !text.trim()) {
      setMeasurement(null)
      setIsReady(false)
      return
    }

    if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
      return
    }

    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    syncPretextLocale(locale)

    const container = element.parentElement ?? element
    const containerWidth = container.clientWidth || element.clientWidth

    if (containerWidth <= 0) {
      setMeasurement(null)
      setIsReady(false)
      return
    }

    const { font, lineHeight } = extractTypographyMetrics(window.getComputedStyle(element))
    const contentWidth = getTypesetContentWidth(containerWidth, policy.contentInset)

    try {
      if (policy.mode === 'balance') {
        const prepared = prepareWithSegments(text, font)
        const balanced = findBalancedWidth({
          containerWidth: contentWidth,
          minWidthRatio: policy.minWidthRatio,
          sampleCount: policy.sampleCount,
          getLineStats: (candidateWidth) => {
            const lineWidths: number[] = []

            walkLineRanges(prepared, candidateWidth, (line) => {
              lineWidths.push(line.width)
            })

            return {
              lineCount: measureLineStats(prepared, candidateWidth).lineCount,
              lineWidths,
            }
          },
        })

        setMeasurement({
          maxWidth: balanced.width,
          minHeight: getTypesetMinHeight(balanced.lineCount, lineHeight),
          lineCount: balanced.lineCount,
        })
        setIsReady(true)
        return
      }

      const prepared = prepare(text, font)
      const result = layout(prepared, contentWidth, lineHeight)

      setMeasurement({
        minHeight: getTypesetMinHeight(result.lineCount, lineHeight),
        lineCount: result.lineCount,
      })
      setIsReady(true)
    } catch {
      // 某些测试环境或极端浏览器环境没有可用 canvas，直接回退到原生排版。
      setMeasurement(null)
      setIsReady(false)
    }
  }, [locale, policy, text])

  useEffect(() => {
    void runMeasurement()
  }, [runMeasurement])

  useEffect(() => {
    const element = elementRef.current

    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    const observedTarget = element.parentElement ?? element
    const resizeObserver = new ResizeObserver(() => {
      void runMeasurement()
    })

    resizeObserver.observe(observedTarget)

    return () => {
      resizeObserver.disconnect()
    }
  }, [runMeasurement])

  const style = createTypesetStyle(measurement)
  const content = children ?? text

  return createElement(
    as,
    {
      ref: elementRef,
      className: className ? `typeset-text ${className}` : 'typeset-text',
      'data-typeset-mode': policy.mode,
      'data-typeset-ready': isReady ? 'true' : 'false',
      style,
    },
    content,
  )
}

/**
 * 构建用于驱动 CSS 变量的内联样式。
 * @param measurement 排版结果
 * @returns style 对象
 */
function createTypesetStyle(measurement: null | TypesetMeasurement): CSSProperties {
  if (!measurement) {
    return {}
  }

  const style = {
    '--typeset-line-count': String(measurement.lineCount),
  } as CSSProperties & Record<'--typeset-line-count' | '--typeset-min-height' | '--typeset-width', string>

  if (measurement.maxWidth) {
    style['--typeset-width'] = `${measurement.maxWidth}px`
  }

  if (measurement.minHeight) {
    style['--typeset-min-height'] = `${measurement.minHeight}px`
  }

  return style
}

/**
 * 将当前 locale 同步给 Pretext，避免每个组件重复清空缓存。
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
