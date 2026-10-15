// @vitest-environment node
import { expect, it, vi } from 'vitest'
import { localR2Bucket } from '../../src/lib/site/local-r2'

it('converts only the supplied Buffer slice to Blob and preserves put options', async () => {
  const put = vi.fn(async () => null)
  const bucket = localR2Bucket({ put } as Partial<R2Bucket> as R2Bucket)
  const buffer = Buffer.from([0, 1, 2, 3]).subarray(1, 3)
  const options = { httpMetadata: { contentType: 'image/png' } }
  await bucket.put('test.png', buffer, options)
  const [key, body, receivedOptions] = put.mock.calls[0] as unknown as [string, Blob, R2PutOptions]
  expect(key).toBe('test.png')
  expect(Array.from(new Uint8Array(await body.arrayBuffer()))).toEqual([1, 2])
  expect(receivedOptions).toBe(options)
})
