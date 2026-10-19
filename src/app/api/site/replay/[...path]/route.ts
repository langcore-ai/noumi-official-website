import { replayAdminRequest } from '@/lib/site/replay/admin-api'
export const dynamic = 'force-dynamic'
export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return replayAdminRequest(request, (await context.params).path)
}
