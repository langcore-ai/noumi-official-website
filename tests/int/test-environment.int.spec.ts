// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseConfigFileTextToJson } from 'typescript'
import { testConfig } from '../../tooling/infra/environment'

vi.mock('node:fs', async (original) => ({
  ...(await original<typeof import('node:fs')>()),
  readFileSync: vi.fn(),
}))
const fs = await vi.importActual<typeof import('node:fs')>('node:fs')
const source = fs.readFileSync('wrangler.jsonc', 'utf8')
afterEach(() => vi.resetAllMocks())

it('isolates local, staging and production resources', () => {
  vi.mocked(readFileSync).mockReturnValue(source)
  expect(testConfig('local').d1_databases[0].remote).toBe(false)
  expect(testConfig('staging').routes[0].pattern).toBe('staging.noumi.ai')
})

it.each(['database', 'bucket', 'origin', 'analytics'])(
  'rejects unsafe staging %s before any remote operation',
  (kind) => {
    const root = parseConfigFileTextToJson('wrangler.jsonc', source).config
    const stage = root.env.staging
    if (kind === 'database') stage.d1_databases[0].database_id = root.d1_databases[0].database_id
    if (kind === 'bucket') stage.r2_buckets[0].bucket_name = root.r2_buckets[0].bucket_name
    if (kind === 'origin') stage.vars.OFFICIAL_SNAPSHOT_REFRESH_ORIGIN = 'https://noumi.ai'
    if (kind === 'analytics') stage.vars.POSTHOG_ENABLED = 'true'
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(root))
    expect(() => testConfig('staging')).toThrow()
  },
)
