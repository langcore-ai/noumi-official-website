import { describe, expect, it } from 'vitest'

import {
  buildPreferredAbsoluteUrl,
  getCanonicalRedirectPath,
  normalizePreferredPathname,
  normalizeSiteHref,
} from '@/lib/site/url'

describe('site URL normalization', () => {
  it('normalizes internal page links to no trailing slash while preserving query and hash', () => {
    expect(normalizePreferredPathname('/blog/')).toBe('/blog')
    expect(normalizeSiteHref('/blog/?tag=ai#top')).toBe('/blog?tag=ai#top')
    expect(normalizeSiteHref('/blog/post-1/')).toBe('/blog/post-1')
    expect(normalizeSiteHref('/assets/og-cover.png')).toBe('/assets/og-cover.png')
    expect(normalizeSiteHref('#features')).toBe('#features')
    expect(normalizeSiteHref('mailto:official@noumi.ai')).toBe('mailto:official@noumi.ai')
  })

  it('normalizes absolute same-origin URLs and leaves external URLs untouched', () => {
    expect(normalizeSiteHref('https://noumi.ai/blog/')).toBe('/blog')
    expect(normalizeSiteHref('https://example.com/blog')).toBe('https://example.com/blog')
    expect(buildPreferredAbsoluteUrl('/blog/post-1/', 'https://noumi.ai')).toBe(
      'https://noumi.ai/blog/post-1',
    )
  })

  it('redirects only frontend GET and HEAD page paths with trailing slash', () => {
    expect(getCanonicalRedirectPath({ method: 'GET', pathname: '/blog/' })).toBe('/blog')
    expect(getCanonicalRedirectPath({ method: 'HEAD', pathname: '/use-cases/pm/' })).toBe(
      '/use-cases/pm',
    )
    expect(getCanonicalRedirectPath({ method: 'POST', pathname: '/blog/' })).toBeNull()
    expect(getCanonicalRedirectPath({ method: 'GET', pathname: '/api/preview/' })).toBeNull()
    expect(getCanonicalRedirectPath({ method: 'GET', pathname: '/admin/' })).toBeNull()
    expect(getCanonicalRedirectPath({ method: 'GET', pathname: '/robots.txt' })).toBeNull()
  })
})
