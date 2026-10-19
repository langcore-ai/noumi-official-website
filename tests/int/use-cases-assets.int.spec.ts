import { readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import vm from 'node:vm'
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'

const root = resolve('public/assets/se-use-cases')
const templates: { window: { showcaseCases?: Record<string, { html: string }> } } = { window: {} }
vm.runInNewContext(readFileSync(join(root, 'assets/case-views.js'), 'utf8'), templates)
const cases = templates.window.showcaseCases!

it('ships all 12 cases, every referenced preview and original deliverable without external hosting', () => {
  expect(Object.keys(cases)).toHaveLength(12)
  const local = (url: string, base = root) => {
    expect(url).not.toMatch(/chatgpt\.site|\/Users\//)
    if (/^(https?:|data:|#)/.test(url)) return
    const path = resolve(base, decodeURIComponent(url.split(/[?#]/)[0]))
    expect(path.startsWith(root + '/')).toBe(true)
    expect(existsSync(path), url).toBe(true)
  }
  const check = (html: string) => {
    expect(html).not.toMatch(/chatgpt\.site|\/Users\//)
    const doc = new DOMParser().parseFromString(html, 'text/html')
    for (const element of doc.querySelectorAll('[src], [href]')) {
      local(element.getAttribute('src') || element.getAttribute('href')!)
    }
    const data = JSON.parse(doc.querySelector('#case-data')!.textContent!)
    for (const output of data.outputs) {
      local(output.download)
      const file = readFileSync(join(root, output.download))
      expect(createHash('sha256').update(file).digest('hex')).toBe(output.sha256)
      for (const page of output.preview_pages) {
        local(page.src)
        if (page.full_src) local(page.full_src)
      }
    }
  }
  check(readFileSync(join(root, 'index.html'), 'utf8'))
  for (let n = 1; n <= 12; n++) {
    check(readFileSync(join(root, `case-${String(n).padStart(2, '0')}.html`), 'utf8'))
    check(cases[String(n)].html)
  }
  for (const css of [
    'showcase.css',
    'case-layout.css',
    'showcase-header.css',
    'showcase-embed.css',
  ]) {
    const path = join(root, 'assets', css)
    for (const match of readFileSync(path, 'utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
      local(match[1], dirname(path))
    }
  }
})

it.each(['https://noumi.ai', 'https://preview.staging.noumi.ai', 'http://localhost:3000'])(
  'child height reports grow/shrink and trust only the same origin: %s',
  (origin) => {
    let height = 1500
    const sent: { data: { height: number }; origin: string }[] = []
    const listeners: Record<string, (event: unknown) => void> = {}
    const frames: (() => void)[] = []
    const observers: (() => void)[] = []
    const parent = {
      postMessage: (data: { height: number }, origin: string) => sent.push({ data, origin }),
    }
    const root = { append() {}, addEventListener() {}, getBoundingClientRect: () => ({ height }) }
    vm.runInNewContext(
      readFileSync(join('public/assets/se-use-cases/assets/showcase-embed.js'), 'utf8'),
      {
        location: { origin, search: '?embed=1' },
        URLSearchParams,
        window: {
          parent,
          addEventListener: (type: string, cb: () => void) => (listeners[type] = cb),
        },
        document: {
          readyState: 'complete',
          documentElement: { classList: { add() {} } },
          querySelector: () => ({ before() {} }),
          createElement: () => root,
        },
        requestAnimationFrame: (callback: () => void) => frames.push(callback),
        ResizeObserver: class {
          constructor(cb: () => void) {
            observers.push(cb)
          }
          observe() {}
        },
        MutationObserver: class {
          constructor(cb: () => void) {
            observers.push(cb)
          }
          observe() {}
        },
      },
    )
    const flush = () => frames.splice(0).forEach((cb) => cb())
    flush()
    height = 2400.5
    observers[0]()
    flush()
    height = 700
    observers[0]()
    flush()
    expect(sent.map((x) => x.data.height)).toEqual([1500, 2401, 700])
    expect(sent.every((x) => x.origin === origin)).toBe(true)
    for (const badOrigin of ['null', 'https://evil.test', origin + '.evil.test']) {
      listeners.message({
        source: parent,
        origin: badOrigin,
        data: { type: 'noumi:embed-measure' },
      })
      flush()
    }
    listeners.message({ source: {}, origin, data: { type: 'noumi:embed-measure' } })
    flush()
    expect(sent).toHaveLength(3)
    listeners.message({ source: parent, origin, data: { type: 'noumi:embed-measure' } })
    flush()
    expect(sent).toHaveLength(4)
  },
)
