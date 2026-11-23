import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

type HeaderRule = { detach: boolean; name: string; value: string }
type Rule = { headers: HeaderRule[]; pattern: string }

/** 读取并解析仓库内的 `_headers`，语法见 Cloudflare Workers static assets 文档。 */
function readHeaderRules(): Rule[] {
  const text = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8')
  const rules: Rule[] = []
  let current: Rule | null = null

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\s+$/, '')

    if (!line.trim() || line.trim().startsWith('#')) continue

    if (!/^\s/.test(line)) {
      current = { headers: [], pattern: line.trim() }
      rules.push(current)
      continue
    }

    if (!current) throw new Error(`Header line without a rule: ${line}`)

    const trimmed = line.trim()
    const detach = trimmed.match(/^!\s*(.+)$/)

    if (detach) {
      current.headers.push({ detach: true, name: detach[1].trim().toLowerCase(), value: '' })
      continue
    }

    const pair = trimmed.match(/^([^:]+):\s*(.*)$/)
    if (!pair) throw new Error(`Malformed header line: ${line}`)

    current.headers.push({
      detach: false,
      name: pair[1].trim().toLowerCase(),
      value: pair[2].trim(),
    })
  }

  return rules
}

/** Cloudflare 只支持单个 splat，且按文件顺序应用，重复的 Cache-Control 会拼接。 */
function matches(pattern: string, pathname: string): boolean {
  const splatIndex = pattern.indexOf('*')

  if (splatIndex === -1) return pathname === pattern

  return pathname.startsWith(pattern.slice(0, splatIndex))
}

/** 计算某个路径最终生效的 Cache-Control。 */
function effectiveCacheControl(pathname: string): string | undefined {
  const applied = new Map<string, string>()

  for (const rule of readHeaderRules()) {
    if (!matches(rule.pattern, pathname)) continue

    for (const header of rule.headers) {
      if (header.detach) {
        applied.delete(header.name)
        continue
      }

      const previous = applied.get(header.name)
      applied.set(header.name, previous ? `${previous}, ${header.value}` : header.value)
    }
  }

  return applied.get('cache-control')
}

describe('static asset cache headers', () => {
  it('keeps content-hashed homepage assets immutable', () => {
    expect(effectiveCacheControl('/assets/homepage/hero-static.dc60f55a09.webp')).toBe(
      'public,max-age=31536000,immutable',
    )
    expect(effectiveCacheControl('/assets/homepage/hero-static.NEWHASH.webp')).toBe(
      'public,max-age=31536000,immutable',
    )
  })

  it('keeps a single Cache-Control on stable-name assets so the first max-age wins', () => {
    for (const pathname of [
      '/assets/fonts/font-0.woff2',
      '/assets/usecases-gallery/assets/cases/bpmn-lead-governance.png',
      '/assets/intro-video/noumi-se-film-1080p.mp4',
      '/assets/about/member-1.jpeg',
    ]) {
      const value = effectiveCacheControl(pathname)

      expect(value).toBe('public,max-age=300,stale-while-revalidate=604800')
      expect(value?.match(/max-age=/g)).toHaveLength(1)
      expect(value).not.toContain('immutable')
    }
  })

  it('keeps build output immutable and leaves unrelated paths on the platform default', () => {
    expect(effectiveCacheControl('/_next/static/css/app.css')).toBe(
      'public,max-age=31536000,immutable',
    )
    expect(effectiveCacheControl('/favicon-96x96.png')).toBe(
      'public,max-age=86400,stale-while-revalidate=604800',
    )
    expect(effectiveCacheControl('/robots.txt')).toBeUndefined()
    expect(effectiveCacheControl('/api/site/health')).toBeUndefined()
  })
})
