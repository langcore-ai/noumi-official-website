// Compile the reviewed local export; never execute its scripts in the application.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { parse, parseFragment, serialize, serializeOuter } from 'parse5'
import postcss from 'postcss'

const root = path.resolve('prototype-webflow')
const output = 'src/lib/site/prototype'
const routes = {
  'index.html': '/',
  'about.html': '/about',
  'features.html': '/features',
  'specialist-level-expertise.html': '/features/specialist-level-expertise',
  'full-project-fluency.html': '/features/full-project-fluency',
  'signature-level-fluency.html': '/features/signature-level-fluency',
  'use-cases.html': '/use-cases',
  'solution-engineer.html': '/use-cases/solutions-engineer',
  'business-analyst.html': '/use-cases/business-analyst',
  'pricing.html': '/pricing',
  'faq.html': '/faqs',
  'terms-conditions.html': '/terms',
  'blog.html': '/blog',
  'blog-article.html': '/blog/what-is-ai-in-hr',
  '401.html': '/protected',
  '404.html': '/not-found',
  'detail_blog.html': '/templates/blog',
  'detail_blog-author.html': '/templates/blog-author',
  'detail_blog-category.html': '/templates/blog-category',
  'detail_career.html': '/templates/career',
  'detail_integration.html': '/templates/integration',
  'template-info/licenses.html': '/template-info/licenses',
  'template-info/style-guide.html': '/template-info/style-guide',
}
const get = (n, key) => n.attrs?.find((a) => a.name === key)?.value
const set = (n, key, value) => {
  n.attrs ??= []
  n.attrs = n.attrs.filter((a) => a.name !== key)
  n.attrs.push({ name: key, value })
}
const has = (n, cls) => (get(n, 'class') || '').split(/\s+/).includes(cls)
const text = (n) => (n.value || '') + (n.childNodes || []).map(text).join('')
const walk = (n, fn) => {
  fn(n)
  for (const c of n.childNodes || []) walk(c, fn)
}
const assets = new Set()
function asset(url, file) {
  // This filename is referenced by the export but absent from its images directory.
  if (url === 'images/process-diagram-2.png') return '/assets/prototype/process-diagram.svg'
  if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url)) return url
  const target = path.resolve(root, path.dirname(file), decodeURI(url.split(/[?#]/)[0]))
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) return url
  const rel = path.relative(root, target).replaceAll(path.sep, '/')
  if (!/^(images|fonts|videos)\//.test(rel)) return url
  assets.add(rel)
  return '/assets/prototype/' + rel
}
const pages = {}
for (const [file, route] of Object.entries(routes)) {
  const doc = parse(fs.readFileSync(path.join(root, file), 'utf8'))
  let body, head, pageId
  walk(doc, (n) => {
    if (n.tagName === 'body') body = n
    if (n.tagName === 'head') head = n
    if (n.tagName === 'html') pageId = get(n, 'data-wf-page')
  })
  const container = body.childNodes.find((n) => has(n, 'page-wrap')) || body
  const excluded = (n) =>
    ['script', 'style', 'link'].includes(n.tagName) ||
    has(n, 'header-section') ||
    has(n, 'footer-section') ||
    n.nodeName === '#comment'
  const selected = container.childNodes.filter((n) => !excluded(n))
  let counter = 0
  function clean(n) {
    if (!n.tagName) return
    n.childNodes = (n.childNodes || []).filter((c) => !excluded(c))
    n.attrs = (n.attrs || []).filter((a) => !a.name.startsWith('on'))
    // Motion is progressively enhanced after hydration; HTML is visible without JS.
    const style = get(n, 'style')
    if (style)
      set(
        n,
        'style',
        style
          .split(';')
          .filter((s) => !/^\s*(opacity|(?:-\w+-)?transform|transform-style)\s*:/.test(s))
          .join(';'),
      )
    for (const key of ['src', 'poster']) if (get(n, key)) set(n, key, asset(get(n, key), file))
    if (get(n, 'srcset'))
      set(
        n,
        'srcset',
        get(n, 'srcset')
          .split(',')
          .map((item) => {
            const [url, size] = item.trim().split(/\s+/)
            return [asset(url, file), size].filter(Boolean).join(' ')
          })
          .join(', '),
      )
    if (get(n, 'style'))
      set(
        n,
        'style',
        get(n, 'style').replace(
          /url\(['"]?([^)'" ]+)['"]?\)/g,
          (_, url) => `url("${asset(url, file)}")`,
        ),
      )
    const href = get(n, 'href')
    if (href && !/^(?:[a-z]+:|\/\/|#)/i.test(href)) {
      const [target, hash] = href.split('#')
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target))
      set(
        n,
        'href',
        routes[resolved] ? routes[resolved] + (hash ? '#' + hash : '') : asset(href, file),
      )
    }
    if (get(n, 'target') === '_blank') set(n, 'rel', 'noopener noreferrer')
    if (has(n, 'faq') && has(n, 'w-dropdown')) {
      n.tagName = n.nodeName = 'details'
      set(n, 'data-prototype-faq', '')
    }
    if (has(n, 'faq-question')) n.tagName = n.nodeName = 'summary'
    if (has(n, 'faq-answer-wrap')) n.tagName = n.nodeName = 'div'
    if (has(n, 'w-tab-link')) {
      n.tagName = n.nodeName = 'button'
      set(n, 'type', 'button')
      set(n, 'role', 'tab')
      set(n, 'aria-selected', String(has(n, 'w--current')))
      set(n, 'id', `prototype-tab-${counter++}`)
    }
    if (has(n, 'w-tab-menu')) set(n, 'role', 'tablist')
    if (has(n, 'w-tab-pane')) set(n, 'role', 'tabpanel')
    if (has(n, 'w-slider-arrow-left') || has(n, 'w-slider-arrow-right')) {
      set(n, 'role', 'button')
      set(n, 'tabindex', '0')
      set(
        n,
        'aria-label',
        has(n, 'w-slider-arrow-left') ? 'Previous testimonial' : 'Next testimonial',
      )
    }
    if (n.tagName === 'iframe') {
      const src = get(n, 'src') || ''
      const id = decodeURIComponent(src).match(/youtube\.com\/embed\/([\w-]+)/)?.[1]
      if (id) {
        n.tagName = n.nodeName = 'button'
        n.attrs = [
          { name: 'type', value: 'button' },
          { name: 'class', value: 'prototype-video-play' },
          { name: 'data-video-id', value: id },
          { name: 'aria-label', value: 'Play video on YouTube (loads external media)' },
        ]
        n.childNodes = parse('<span aria-hidden="true">▶</span><span>Play video</span>')
          .childNodes.find((n) => n.tagName === 'html')
          .childNodes.find((n) => n.tagName === 'body').childNodes
      } else {
        set(n, 'title', 'Noumi interactive demonstration')
        set(n, 'loading', 'lazy')
      }
    }
    // The exported password form is a Webflow placeholder, not application authentication.
    if (n.tagName === 'form') {
      n.tagName = n.nodeName = 'div'
      set(n, 'data-prototype-form', '')
      n.attrs = n.attrs.filter((a) => !['action', 'method'].includes(a.name))
    }
    if (n.tagName === 'input' && get(n, 'type') === 'submit') {
      set(n, 'type', 'button')
      set(n, 'disabled', '')
      set(n, 'title', 'Prototype only; authentication is handled by the application')
    }
    for (const c of n.childNodes) clean(c)
  }
  selected.forEach(clean)
  const headings = []
  selected.forEach((n) =>
    walk(n, (el) => {
      if (/^h[1-3]$/.test(el.tagName) && text(el).trim()) headings.push(text(el).trim())
    }),
  )
  pages[route] = {
    file,
    route,
    pageId,
    title: text(head.childNodes.find((n) => n.tagName === 'title') || {}),
    description:
      get(head.childNodes.find((n) => get(n, 'name') === 'description') || {}, 'content') || '',
    bodyClass: get(body, 'class') || '',
    html: selected.map((n) => (n.tagName ? serializeOuter(n) : serialize(n))).join(''),
    headings,
    template: file.startsWith('detail_'),
  }
}
// Privacy is the second tab in terms-conditions.html; preserve the existing direct URL.
const privacy = parseFragment(pages['/terms'].html)
walk(privacy, (n) => {
  if (has(n, 'w-tab-link') || has(n, 'w-tab-pane')) {
    const selected = get(n, 'data-w-tab') === 'Privacy'
    const token = has(n, 'w-tab-link') ? 'w--current' : 'w--tab-active'
    set(
      n,
      'class',
      (get(n, 'class') || '')
        .split(/\s+/)
        .filter((c) => c !== token)
        .concat(selected ? [token] : [])
        .join(' '),
    )
    if (has(n, 'w-tab-link')) set(n, 'aria-selected', String(selected))
  }
})
pages['/privacy'] = { ...pages['/terms'], route: '/privacy', html: serialize(privacy) }
// Scope original CSS so exact layout rules cannot leak into CMS/admin or the rebuilt homepage.
let css = ''
for (const file of [
  'css/normalize.css',
  'css/webflow.css',
  'css/noumi-offical-website.webflow.css',
]) {
  const tree = postcss.parse(fs.readFileSync(path.join(root, file), 'utf8'))
  tree.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return
    rule.selectors = rule.selectors.map((selector) => {
      if (/^(?::root|html|body)$/.test(selector)) return '.prototype-page'
      if (/^\.body(?:-\d+)?$/.test(selector)) return '.prototype-page' + selector
      return '.prototype-page ' + selector.replace(/^html\s+/, '').replace(/^body(?=[.#\s])/, '')
    })
  })
  tree.walkDecls((decl) => {
    decl.value = decl.value.replace(
      /url\(['"]?([^)'"\s]+)['"]?\)/g,
      (_, url) => `url("${asset(url, file)}")`,
    )
  })
  css += tree.toString() + '\n'
}
const source = ts.createSourceFile(
  'webflow.js',
  fs.readFileSync(path.join(root, 'js/webflow.js'), 'utf8'),
  99,
  true,
)
let interactions
function scan(n) {
  if (ts.isCallExpression(n) && n.expression.getText(source) === 'Webflow.require("ix2").init')
    interactions = vm.runInNewContext('(' + n.arguments[0].getText(source) + ')')
  ts.forEachChild(n, scan)
}
scan(source)
fs.mkdirSync(output, { recursive: true })
fs.writeFileSync(output + '/pages.json', JSON.stringify(pages, null, 2) + '\n')
fs.writeFileSync(output + '/routes.json', JSON.stringify(routes, null, 2) + '\n')
fs.writeFileSync(output + '/interactions.json', JSON.stringify(interactions) + '\n')
fs.writeFileSync('src/app/(frontend)/prototype-pages.generated.css', css)
for (const rel of assets) {
  const dest = path.join('public/assets/prototype', rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(path.join(root, rel), dest)
}
console.log(
  `Compiled ${Object.keys(pages).length} pages and ${assets.size} referenced local assets.`,
)
