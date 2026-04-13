import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TypesetText } from '@/components/site/TypesetText'
import { extractTypographyMetrics, findBalancedWidth, resolveTypesetLocale } from '@/lib/site/typeset'

vi.mock('@chenglou/pretext', () => ({
  layout: vi.fn(() => ({ lineCount: 2, height: 40 })),
  measureLineStats: vi.fn((_prepared, width: number) => ({
    lineCount: width < 260 ? 3 : 2,
    maxLineWidth: width < 260 ? width - 20 : width - 40,
  })),
  prepare: vi.fn(() => ({ kind: 'prepared' })),
  prepareWithSegments: vi.fn(() => ({ kind: 'prepared-with-segments' })),
  setLocale: vi.fn(),
  walkLineRanges: vi.fn((_prepared, width: number, onLine: (line: { width: number }) => void) => {
    if (width < 260) {
      onLine({ width: width - 18 })
      onLine({ width: width - 24 })
      onLine({ width: Math.round(width * 0.88) })
      return 3
    }

    onLine({ width: width - 12 })
    onLine({ width: Math.round(width * 0.46) })
    return 2
  }),
}))

/**
 * 为组件测试提供最小的 ResizeObserver mock。
 */
class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

describe('typeset', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverMock,
    })
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: Promise.resolve() },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 320,
    })
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontFamily: '"Inter", sans-serif',
      fontSize: '32px',
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: '400',
      lineHeight: '1.25',
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration)
  })

  it('maps locale to browser-friendly pretext locale', () => {
    expect(resolveTypesetLocale('zh')).toBe('zh-CN')
    expect(resolveTypesetLocale('en')).toBe('en-US')
    expect(resolveTypesetLocale(undefined)).toBe('en-US')
  })

  it('extracts canvas font shorthand and px line-height from computed styles', () => {
    expect(
      extractTypographyMetrics({
        fontFamily: '"Inter", sans-serif',
        fontSize: '20px',
        fontStyle: 'italic',
        fontVariant: 'normal',
        fontWeight: '500',
        lineHeight: '1.4',
      } as CSSStyleDeclaration),
    ).toEqual({
      font: 'italic normal 500 20px "Inter", sans-serif',
      lineHeight: 28,
    })
  })

  it('finds a more balanced width for multi-line titles', () => {
    const result = findBalancedWidth({
      containerWidth: 320,
      getLineStats: (candidateWidth) =>
        candidateWidth < 260
          ? {
              lineCount: 3,
              lineWidths: [candidateWidth - 18, candidateWidth - 24, Math.round(candidateWidth * 0.88)],
            }
          : {
              lineCount: 2,
              lineWidths: [candidateWidth - 12, Math.round(candidateWidth * 0.46)],
            },
    })

    expect(result.width).toBeLessThan(320)
    expect(result.lineCount).toBeGreaterThanOrEqual(2)
  })

  it('preserves semantic markup and applies typeset vars after hydration', async () => {
    const { container } = render(
      <div style={{ width: '320px' }}>
        <TypesetText as="h2" locale="en" text="Balanced title sample" variant="sectionTitle">
          Balanced title sample
        </TypesetText>
      </div>,
    )

    const heading = container.querySelector('h2')

    expect(heading?.tagName).toBe('H2')

    await waitFor(() => {
      expect(heading?.getAttribute('data-typeset-ready')).toBe('true')
    })

    const style = heading?.getAttribute('style') ?? ''
    expect(style).toContain('--typeset-width')
    expect(style).toContain('--typeset-min-height')
  })
})
