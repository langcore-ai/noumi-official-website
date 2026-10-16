import { getSitePayloadClient } from '@/lib/site/payload-client'
import { resolveManagedRedirect } from '@/lib/site/managed-routing'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') || '/'
  const payload = await getSitePayloadClient()
  const redirect = await resolveManagedRedirect(path, async (from) => {
    const { docs } = await payload.find({
      collection: 'redirects',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1,
      where: { and: [{ from: { equals: from } }, { _status: { equals: 'published' } }] },
    })
    const rule = docs[0]
    return rule?.resolvedTarget ? { target: rule.resolvedTarget, type: rule.type } : null
  })
  return Response.json(redirect, { headers: { 'Cache-Control': 'no-store' } })
}
