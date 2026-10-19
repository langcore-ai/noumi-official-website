// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: async () => ({ env: {} }) }))
import { readReplayConfig } from '@/lib/site/replay/config'
afterEach(() => vi.unstubAllEnvs())
it('never falls back to production capture keys in local/staging', async () => {
  vi.stubEnv('RRWEB_PUBLIC_KEY', 'public_key_rr_production')
  vi.stubEnv('RRWEB_SECRET_KEY', 'private-production')
  vi.stubEnv('RRWEB_SCOPE', 'production')
  vi.stubEnv('RRWEB_TEST_PUBLIC_KEY', '')
  vi.stubEnv('RRWEB_TEST_SECRET_KEY', '')
  vi.stubEnv('RRWEB_TEST_SCOPE', '')
  for (const env of ['local', 'staging']) {
    vi.stubEnv('APP_ENV', env)
    expect(await readReplayConfig()).toMatchObject({
      enabled: false,
      publicKey: null,
      secretKey: '',
    })
  }
})
it('requires explicit scope and allows independently configured test capture', async () => {
  vi.stubEnv('APP_ENV', 'local')
  vi.stubEnv('RRWEB_TEST_PUBLIC_KEY', 'public_key_rr_test')
  vi.stubEnv('RRWEB_TEST_SECRET_KEY', 'private-test')
  vi.stubEnv('RRWEB_TEST_SCOPE', '')
  expect((await readReplayConfig()).enabled).toBe(false)
  vi.stubEnv('RRWEB_TEST_SCOPE', 'official-local')
  expect(await readReplayConfig()).toMatchObject({
    enabled: true,
    scope: 'official-local',
    secretKey: 'private-test',
  })
})
