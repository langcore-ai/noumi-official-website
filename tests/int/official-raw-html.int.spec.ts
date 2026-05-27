import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { OfficialRawHtml, prepareOfficialRawHtml } from '@/components/site/official/OfficialRawHtml'

describe('OfficialRawHtml', () => {
  it('preserves JSON-LD scripts from full HTML while stripping them from body markup', () => {
    const prepared = prepareOfficialRawHtml(`
      <!doctype html>
      <html>
        <head>
          <style>.hero { color: red; }</style>
          <script type="application/ld+json">
            {"@context":"https://schema.org","@type":"BlogPosting","headline":"Noumi"}
          </script>
        </head>
        <body>
          <nav>Site nav</nav>
          <main class="page-body">
            <h1>Article</h1>
            <script>window.__rawHtmlLoaded = true</script>
          </main>
          <footer>Site footer</footer>
        </body>
      </html>
    `)

    expect(prepared.structuredDataScripts).toHaveLength(1)
    expect(prepared.structuredDataScripts[0]?.content).toContain('"@type":"BlogPosting"')
    expect(prepared.markup).toContain('<style>.hero { color: red; }</style>')
    expect(prepared.markup).toContain('data-noumi-raw-html-mobile')
    expect(prepared.markup).toContain('<h1>Article</h1>')
    expect(prepared.markup).not.toContain('application/ld+json')
    expect(prepared.markup).not.toContain('<nav>')
    expect(prepared.markup).not.toContain('<footer>')
    expect(prepared.scripts).toEqual([
      {
        attributes: '',
        content: 'window.__rawHtmlLoaded = true',
        type: 'text/javascript',
      },
    ])
  })

  it('preserves JSON-LD scripts from fragment HTML without executing external scripts', () => {
    const prepared = prepareOfficialRawHtml(`
      <section>
        <script type='application/ld+json; charset=utf-8'>
          {"@context":"https://schema.org","@type":"FAQPage"}
        </script>
        <script src="https://example.com/widget.js"></script>
        <script type="module">console.log('module')</script>
        <a href="/blog/">Blog</a>
      </section>
    `)

    expect(prepared.structuredDataScripts).toHaveLength(1)
    expect(prepared.structuredDataScripts[0]?.content).toContain('"@type":"FAQPage"')
    expect(prepared.markup).toContain('href="/blog"')
    expect(prepared.markup).not.toContain('<script')
    expect(prepared.scripts).toEqual([
      {
        attributes: ' type="module"',
        content: "console.log('module')",
        type: 'module',
      },
    ])
  })

  it('renders preserved JSON-LD into the initial HTML output', () => {
    const markup = renderToStaticMarkup(
      createElement(OfficialRawHtml, {
        html: `
          <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"}</script>
          <section>FAQ content</section>
        `,
      }),
    )

    expect(markup).toContain(
      '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"}</script>',
    )
    expect(markup).toContain('<main class="official-raw-html">')
    expect(markup).toContain('<section>FAQ content</section>')
  })
})
