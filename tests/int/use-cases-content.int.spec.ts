import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import content from '@/components/site/official/use-cases/content.json'

it('ships all reviewed case content, previews and original deliverables on the same origin', () => {
  const downloads = new Set<string>()
  const check = (url: string) => {
    expect(url.startsWith('/assets/se-use-cases/')).toBe(true)
    expect(existsSync(resolve('public', url.slice(1))), url).toBe(true)
  }
  for (const entry of content.cases) {
    const doc = document.implementation.createHTMLDocument()
    doc.body.innerHTML = entry.html
    expect(doc.querySelector('script, iframe, style')).toBeNull()
    expect(entry.html).not.toContain('The supplied comparison uses')
    for (const image of doc.querySelectorAll('img[src]')) {
      expect(image.getAttribute('loading')).toBe('lazy')
      expect(image.getAttribute('decoding')).toBe('async')
    }
    for (const element of doc.querySelectorAll('*')) {
      for (const attribute of element.attributes)
        expect(attribute.name.startsWith('on')).toBe(false)
    }
    for (const element of doc.querySelectorAll('[src],[href]')) {
      for (const attribute of ['src', 'href']) {
        const url = element.getAttribute(attribute)
        if (url) check(url)
      }
    }
    for (const output of entry.data.outputs) {
      check(output.download)
      downloads.add(output.download)
      if (output.sha256) {
        const hash = createHash('sha256')
          .update(readFileSync(resolve('public', output.download.slice(1))))
          .digest('hex')
        expect(hash, output.download).toBe(output.sha256)
      }
      for (const page of output.preview_pages || []) {
        check(page.src)
        if ('full_src' in page && typeof page.full_src === 'string') check(page.full_src)
      }
    }
  }
  expect(content.cases).toHaveLength(12)
  expect(downloads.size).toBe(20)
})
