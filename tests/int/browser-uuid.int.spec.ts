import { webcrypto } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBrowserUuid } from '@/lib/site/browser-uuid'

afterEach(() => vi.unstubAllGlobals())

describe('browser observation UUIDs', () => {
  it('generates unique UUID v4 values when HTTP does not expose randomUUID', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: webcrypto.getRandomValues.bind(webcrypto),
    })
    const ids = Array.from({ length: 100 }, () => createBrowserUuid())
    expect(new Set(ids).size).toBe(100)
    for (const id of ids) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    }
  })

  it('uses the native UUID implementation when available', () => {
    const randomUUID = vi.fn(() => 'c29539f2-9c86-4c34-8d61-c8955a21bc11')
    vi.stubGlobal('crypto', { randomUUID })
    expect(createBrowserUuid()).toBe('c29539f2-9c86-4c34-8d61-c8955a21bc11')
    expect(randomUUID).toHaveBeenCalledOnce()
  })
})
