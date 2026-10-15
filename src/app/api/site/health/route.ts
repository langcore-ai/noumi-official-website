import { getCloudflareContext } from '@opennextjs/cloudflare'

export const dynamic = 'force-dynamic'

/** Read-only readiness probe: schema availability and storage binding access. */
export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true })
    await Promise.all([
      env.D1.prepare('SELECT id FROM users LIMIT 1').all(),
      env.R2.head('__health__'),
    ])
    return Response.json(
      {
        healthy: true,
        environment: process.env.APP_ENV || env.APP_ENV || 'production',
        instance: process.env.NEXT_PUBLIC_INSTANCE_ID || null,
        revision: process.env.NEXT_PUBLIC_BUILD_REVISION || null,
        database: true,
        storage: true,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return Response.json(
      { healthy: false },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
