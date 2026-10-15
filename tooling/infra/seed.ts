import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { localInfraDir } from './shared'
import { testConfig, testEnv, type TestEnvironment } from './environment'

const target = process.argv[2] as TestEnvironment
if (target !== 'local' && target !== 'staging') throw new Error('必须指定 local 或 staging')
testConfig(target)
Object.assign(process.env, testEnv(target), { NODE_ENV: 'production' })
const { getPlatformProxy } = await import('wrangler')
const proxy = await getPlatformProxy({ environment: target, remoteBindings: target === 'staging' })
;(globalThis as Record<symbol, unknown>)[Symbol.for('__cloudflare-context__')] = proxy
const { getPayload } = await import('payload')
const { default: config } = await import('../../src/payload.config')
const payload = await getPayload({ config })
try {
  // Intentional administrative bootstrap, restricted to validated test resources.
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0) {
    const path = join(localInfraDir, `${target}.admin.json`)
    const credentials = existsSync(path)
      ? (JSON.parse(readFileSync(path, 'utf8')) as { email: string; password: string })
      : { email: `${target}-admin@noumi.ai`, password: randomBytes(24).toString('base64url') }
    writeFileSync(path, JSON.stringify(credentials, null, 2), { mode: 0o600 })
    await payload.create({ collection: 'users', data: { ...credentials, roles: ['admin'] } })
    console.log(`已初始化测试管理员；凭据仅保存在 ${path}`)
  } else console.log('已有管理员，保留现有账号。')
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  if (!settings.siteName) {
    await payload.updateGlobal({
      slug: 'site-settings',
      context: { skipOfficialSnapshot: true },
      data: {
        siteName: 'Noumi',
        siteUrl: target === 'staging' ? 'https://staging.noumi.ai' : 'http://localhost:3000',
        _status: 'published',
      },
    })
  }
} finally {
  await payload.destroy()
  await proxy.dispose()
}
process.exit(0)
