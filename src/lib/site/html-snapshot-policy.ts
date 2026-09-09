/** Next may stream an error page with HTTP 200; its robots meta still identifies it as non-public. */
export function allowsHtmlSnapshot(html: string): boolean {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0]
    const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1].toLowerCase()
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]
    if ((name === 'robots' || name === 'googlebot') && /\bnoindex\b/i.test(content || ''))
      return false
  }
  return true
}
