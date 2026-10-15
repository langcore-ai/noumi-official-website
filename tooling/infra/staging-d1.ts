import { capture } from './shared'
import { testConfig } from './environment'

type Query = { sql: string; params: unknown[] }
type RawResult = {
  success: boolean
  results: { columns: string[]; rows: unknown[][] }
  meta: D1Meta & Record<string, unknown>
}

/** CLI-only HTTPS transport; the deployed Worker continues to use native D1 bindings. */
export function stagingD1(): D1Database {
  const config = testConfig('staging')
  const credentials = capture(['bunx', 'wrangler', 'auth', 'token', '--json'])
  const token = credentials ? (JSON.parse(credentials) as { token?: string }).token : null
  if (!token) throw new Error('无法读取 Wrangler 登录，请先 wrangler login')
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.account_id}/d1/database/${config.d1_databases[0].database_id}/raw`
  async function execute(query: Query): Promise<RawResult> {
    // Do not retry writes: an ambiguous response may already have committed.
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
      signal: AbortSignal.timeout(60_000),
    })
    const body = (await response.json()) as {
      success: boolean
      result: RawResult[]
      errors?: { message: string }[]
    }
    if (!response.ok || !body.success || !body.result?.[0]?.success)
      throw new Error(
        `D1 HTTPS 请求失败 (${response.status}): ${body.errors?.map((e) => e.message).join('; ') || 'query failed'}`,
      )
    return body.result[0]
  }
  function prepare(sql: string, params: unknown[] = []): D1PreparedStatement {
    async function all<T>(): Promise<D1Result<T>> {
      const result = await execute({ sql, params })
      return {
        success: true,
        meta: result.meta,
        results: result.results.rows.map(
          (row) =>
            Object.fromEntries(
              result.results.columns.map((column, index) => [column, row[index]]),
            ) as T,
        ),
      }
    }
    async function raw<T = unknown[]>(options: { columnNames: true }): Promise<[string[], ...T[]]>
    async function raw<T = unknown[]>(options?: { columnNames?: false }): Promise<T[]>
    async function raw<T = unknown[]>(options?: {
      columnNames?: boolean
    }): Promise<T[] | [string[], ...T[]]> {
      const result = await execute({ sql, params })
      const rows = result.results.rows as T[]
      return options?.columnNames ? [result.results.columns, ...rows] : rows
    }
    return {
      bind: (...values) => prepare(sql, values),
      all,
      run: all,
      raw,
      async first<T>(column?: string): Promise<T | null> {
        const result = await all<Record<string, unknown>>()
        const row = result.results[0]
        return ((column ? row?.[column] : row) as T) ?? null
      },
    }
  }
  return {
    prepare,
    async batch() {
      throw new Error(
        'CLI HTTPS migration transport does not support batch; use native D1 for batch operations',
      )
    },
    async exec(sql) {
      const result = await execute({ sql, params: [] })
      return { count: result.meta.changes, duration: result.meta.duration }
    },
    withSession() {
      throw new Error('CLI HTTPS migration transport does not support sessions')
    },
    async dump() {
      throw new Error('Use wrangler d1 export for backups')
    },
  }
}
