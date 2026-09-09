import { describe, expect, it } from 'vitest'
import { featureActivation, featureScrollProgress } from '@/lib/site/feature-progress'

describe('prototype feature scroll timeline', () => {
  it('keeps the original plateaus and continuous crossfades', () => {
    expect([0, 1, 2].map((i) => featureActivation(0, i))).toEqual([1, 0, 0])
    expect([0, 1, 2].map((i) => featureActivation(38.5, i))).toEqual([0.5, 0.5, 0])
    expect([0, 1, 2].map((i) => featureActivation(50, i))).toEqual([0, 1, 0])
    expect([0, 1, 2].map((i) => featureActivation(58.5, i))).toEqual([0, 0.5, 0.5])
    expect([0, 1, 2].map((i) => featureActivation(70, i))).toEqual([0, 0, 1])
    expect(featureActivation(78.5, 2)).toBe(0.5)
    expect([0, 1, 2].map((i) => featureActivation(100, i))).toEqual([0, 0, 0])
  })
  it('uses the prototype end offset instead of full element exit', () => {
    expect(featureScrollProgress(1000, 1600, 1000)).toBe(0)
    expect(featureScrollProgress(100, 1600, 1000)).toBe(50)
    expect(featureScrollProgress(-800, 1600, 1000)).toBe(100)
    expect(featureScrollProgress(-2000, 1600, 1000)).toBe(100)
  })
})
