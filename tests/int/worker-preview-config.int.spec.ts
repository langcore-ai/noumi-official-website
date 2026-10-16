// @vitest-environment node
import { expect, it } from 'vitest'
import { previewConfig, previewIdentity } from '../../tooling/infra/worker-preview-config'

it('reserves preview for staging and avoids branch name collisions', () => {
  expect(previewIdentity('staging')).toEqual({
    name: 'preview',
    origin: 'https://preview.staging.noumi.ai',
  })
  expect(previewIdentity('feature/a').name).not.toBe(previewIdentity('feature-a').name)
  expect(previewIdentity('preview').name).not.toBe('preview')
  expect(() => previewIdentity('main')).toThrow()
  expect(() => previewIdentity('')).toThrow()
})
it('keeps both build-time and runtime bindings isolated from production', () => {
  const { config } = previewConfig('staging', 'a'.repeat(40))
  expect(config.name).toBe('noumi-official-website')
  expect(config.d1_databases[0].database_id).toBe('2cf5e2cf-7aa3-4ba9-ab17-e8ffe75be5be')
  expect(config.previews.d1_databases).toEqual(config.d1_databases)
  expect(
    config.r2_buckets.every(
      (b: { bucket_name: string }) => b.bucket_name === 'official-website-staging-bucket',
    ),
  ).toBe(true)
  expect(config.vars.NOUMI_DISABLE_SNAPSHOTS).toBe('true')
  expect(config.previews.vars).toEqual(config.vars)
  expect(config.vars.NEXT_PUBLIC_BUILD_REVISION).toBe('aaaaaaa')
  expect(config).not.toHaveProperty('routes')
  expect(config).not.toHaveProperty('triggers')
})
