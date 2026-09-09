import { describe, expect, it } from 'vitest'
import { allowsHtmlSnapshot } from '@/lib/site/html-snapshot-policy'

describe('HTML snapshot eligibility', () => {
  it('does not replay or cache streamed noindex error pages', () => {
    expect(allowsHtmlSnapshot('<meta name="robots" content="noindex"/><h1>404</h1>')).toBe(false)
  })
  it('recognizes attribute order, case and alternate quoting', () => {
    expect(allowsHtmlSnapshot("<META content='NOINDEX, nofollow' name='robots'>")).toBe(false)
    expect(allowsHtmlSnapshot('<meta name="googlebot" content="noindex,follow">')).toBe(false)
  })
  it('keeps ordinary pages eligible and does not confuse prose with robots metadata', () => {
    expect(
      allowsHtmlSnapshot('<meta name="robots" content="index,follow"><p>noindex explained</p>'),
    ).toBe(true)
    expect(allowsHtmlSnapshot('<meta name="description" content="noindex explained">')).toBe(true)
  })
})
