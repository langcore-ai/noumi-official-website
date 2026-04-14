import { describe, expect, it } from 'vitest'

import { hasRenderableHeroContent } from '@/lib/site/hero'

describe('hasRenderableHeroContent', () => {
  it('returns false when all rendered hero fields are empty', () => {
    expect(
      hasRenderableHeroContent({
        eyebrow: undefined,
        title: undefined,
        description: undefined,
        supportingText: undefined,
      }),
    ).toBe(false)
  })

  it('returns true when at least one rendered hero field exists', () => {
    expect(
      hasRenderableHeroContent({
        eyebrow: undefined,
        title: 'Privacy Policy',
        description: undefined,
        supportingText: undefined,
      }),
    ).toBe(true)
  })
})
