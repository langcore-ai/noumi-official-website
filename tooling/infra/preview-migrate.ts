import { randomBytes } from 'node:crypto'

export async function migratePreview(branch: string, env: NodeJS.ProcessEnv) {
  Object.assign(process.env, env, {
    NODE_ENV: 'production',
    // Only needed to instantiate Payload for schema migration, never used to authenticate,
    // create users or deploy. Existing runtime secrets remain on the Worker.
    PAYLOAD_SECRET: randomBytes(32).toString('hex'),
  })
  const { getPlatformProxy } = await import('wrangler')
  const { stagingD1 } = await import('./staging-d1')
  const proxy = await getPlatformProxy({ environment: 'staging', remoteBindings: false })
  const database = stagingD1()
  proxy.env.D1 = database
  ;(globalThis as Record<symbol, unknown>)[Symbol.for('__cloudflare-context__')] = proxy
  try {
    // Cloud deployment only supports the already bootstrapped testing site.
    const count = await database.prepare('SELECT COUNT(*) AS n FROM users').first<number>('n')
    if (!count) throw new Error('测试站尚未初始化管理员，请维护者先初始化')
    const { getPayload } = await import('payload')
    const { default: payloadConfig } = await import('../../src/payload.config')
    const payload = await getPayload({ config: payloadConfig })
    try {
      if (branch === 'staging') await payload.db.migrate()
      else {
        const { migrations } = await import('../../src/migrations')
        const applied = await database
          .prepare('SELECT name FROM payload_migrations')
          .all<{ name: string }>()
        const pending = migrations.filter(
          (m) => !applied.results.some((row) => row.name === m.name),
        )
        if (pending.length) throw new Error('功能分支有尚未在 staging 应用的迁移，请先合入 staging')
      }
    } finally {
      await payload.destroy()
    }
  } finally {
    await proxy.dispose()
  }
}
