import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseConfigFileTextToJson } from 'typescript'
import { repositoryRoot } from './shared'
import { testConfig } from './environment'

export function previewIdentity(branch: string) {
  if (!branch || branch === 'main' || branch === 'HEAD')
    throw new Error('Preview requires a non-main branch')
  const suffix = createHash('sha256').update(branch).digest('hex').slice(0, 8)
  const name =
    branch === 'staging'
      ? 'preview'
      : `branch-${branch
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 30)}-${suffix}`
  return { name, origin: `https://${name}.staging.noumi.ai` }
}

export function previewConfig(branch: string, revision: string) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Invalid build revision')
  const identity = previewIdentity(branch)
  const config = parseConfigFileTextToJson(
    'wrangler.jsonc',
    readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8'),
  ).config
  const staging = testConfig('staging')
  const base = config.previews
  if (
    config.name !== 'noumi-official-website' ||
    !base ||
    base.d1_databases?.length !== 1 ||
    base.d1_databases[0].database_id !== staging.d1_databases[0].database_id ||
    base.r2_buckets?.length !== 2 ||
    base.r2_buckets.some(
      (b: { bucket_name: string }) => b.bucket_name !== 'official-website-staging-bucket',
    ) ||
    base.vars?.APP_ENV !== 'staging' ||
    base.vars?.POSTHOG_ENABLED !== 'false' ||
    base.vars?.NOUMI_PRODUCT_API_URL !== '' ||
    base.vars?.NOUMI_DISABLE_SNAPSHOTS !== 'true'
  )
    throw new Error('Unsafe Preview resources or variables')
  const vars = {
    ...base.vars,
    NEXT_PUBLIC_SITE_URL: identity.origin,
    OFFICIAL_SNAPSHOT_REFRESH_ORIGIN: identity.origin,
    NEXT_PUBLIC_BUILD_REVISION: revision.slice(0, 7),
    NEXT_INC_CACHE_R2_PREFIX: `previews/${identity.name}/next-cache`,
    OFFICIAL_SNAPSHOT_R2_PREFIX: `previews/${identity.name}/snapshots`,
  }
  return {
    identity,
    config: {
      $schema: resolve(repositoryRoot, 'node_modules/wrangler/config-schema.json'),
      name: config.name,
      account_id: staging.account_id,
      main: resolve(repositoryRoot, 'worker.ts'),
      compatibility_date: config.compatibility_date,
      compatibility_flags: config.compatibility_flags,
      assets: { ...config.assets, directory: resolve(repositoryRoot, '.open-next/assets') },
      // The generated build config is test-only, even if a build-time proxy reads top-level bindings.
      ...base,
      vars,
      previews: { ...base, vars },
      observability: config.observability,
    },
  }
}
