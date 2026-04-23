import { render, screen } from '@testing-library/react'
import { createElement, type ElementType, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { MarkdownContent } from '@/components/site/MarkdownContent'

vi.mock('@/components/site/TypesetText', () => ({
  /**
   * 测试中只保留语义标签，避免排版逻辑影响 Markdown 行为断言。
   */
  TypesetText: ({ as = 'div', children }: { as?: ElementType; children?: ReactNode }) =>
    createElement(as, null, children),
}))

describe('MarkdownContent', () => {
  it('consumes level-4 headings without entering an infinite loop', () => {
    render(
      <MarkdownContent
        markdown={[
          '# Privacy Policy',
          '',
          '### 3.1 Google Services',
          '',
          '#### Gmail',
          '',
          'Send emails only when you explicitly instruct Noumi to do so.',
        ].join('\n')}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: '3.1 Google Services' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Gmail' })).toBeTruthy()
    expect(screen.getByText('Send emails only when you explicitly instruct Noumi to do so.')).toBeTruthy()
  })

  it('renders internal markdown links with the preferred URL', () => {
    render(<MarkdownContent markdown="[Read blog](/blog/?tag=ai#top)" />)

    expect(screen.getByRole('link', { name: 'Read blog' }).getAttribute('href')).toBe(
      '/blog?tag=ai#top',
    )
  })
})
