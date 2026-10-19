import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'

/** Scope 必须显式配置；测试环境使用独立 Cloud 项目及 scope。 */
export async function readReplayConfig() {
  let env: Record<string, unknown> = {}
  try {
    env = (await getCloudflareContext({ async: true })).env as unknown as Record<string, unknown>
  } catch {
    /* 本地由 process.env 提供。 */
  }
  const read = (key: string) => String(env[key] ?? process.env[key] ?? '').trim()
  const test = ['local', 'staging'].includes(read('APP_ENV') || read('NEXT_PUBLIC_APP_ENV'))
  const prefix = test ? 'RRWEB_TEST_' : 'RRWEB_'
  const scope = read(`${prefix}SCOPE`)
  const publicKey = read(`${prefix}PUBLIC_KEY`)
  const secretKey = read(`${prefix}SECRET_KEY`)
  const validScope = /^[a-zA-Z0-9_-]{1,80}$/.test(scope)
  return {
    scope: validScope ? scope : 'unconfigured',
    publicKey: /^public_key_rr_[a-zA-Z0-9]+$/.test(publicKey) ? publicKey : null,
    secretKey: validScope ? secretKey : '',
    enabled: validScope && /^public_key_rr_[a-zA-Z0-9]+$/.test(publicKey),
  }
}
