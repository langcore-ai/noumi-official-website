import { describe, expect, it } from 'vitest'

import { renderMarkdownToHtml } from '@/lib/site/markdown'

describe('renderMarkdownToHtml', () => {
  it('renders GFM tables, task lists and strikethrough', () => {
    const html = renderMarkdownToHtml(
      [
        '| Ability | Status |',
        '| --- | --- |',
        '| GFM table | supported |',
        '',
        '- [x] done',
        '- [ ] todo',
        '',
        '~~removed~~',
      ].join('\n'),
    )

    expect(html).toContain('<table>')
    expect(html).toContain('<th>Ability</th>')
    expect(html).toContain('<td>supported</td>')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('<del>removed</del>')
  })

  it('highlights fenced code blocks and anchors headings', () => {
    const html = renderMarkdownToHtml('# Title\n\n```ts\nconst answer = 42\n```\n')

    expect(html).toContain('id="title"')
    expect(html).toContain('class="heading-anchor"')
    expect(html).toContain('<pre>')
    expect(html).toContain('class="hljs language-ts"')
  })

  it('strips scripts, iframes, event handlers and unsafe URLs', () => {
    const html = renderMarkdownToHtml(
      [
        'Safe paragraph',
        '',
        '<script>alert("xss")</script>',
        '',
        '<iframe src="https://evil.example.com"></iframe>',
        '',
        '<img src="x" onerror="alert(1)" />',
        '',
        '[bad link](javascript:alert(1))',
      ].join('\n'),
    )

    expect(html).toContain('Safe paragraph')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('javascript:')
  })

  it('keeps images and external links', () => {
    const html = renderMarkdownToHtml(
      '![cover](https://cdn.example.com/a.png)\n\n[site](https://noumi.ai)',
    )

    expect(html).toContain('<img src="https://cdn.example.com/a.png" alt="cover"')
    expect(html).toContain('href="https://noumi.ai"')
  })
})
