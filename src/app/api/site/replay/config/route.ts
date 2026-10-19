import { draftMode } from 'next/headers'
import { readReplayConfig } from '@/lib/site/replay/config'

export const dynamic = 'force-dynamic'
export async function GET() {
  const [config, draft] = await Promise.all([readReplayConfig(), draftMode()])
  return Response.json(
    {
      enabled: config.enabled && !draft.isEnabled,
      publicKey: draft.isEnabled ? null : config.publicKey,
      scope: config.scope,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
