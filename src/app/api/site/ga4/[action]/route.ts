import { getPayload } from 'payload'
import config from '@payload-config'
import { handleGa4 } from '@/lib/ga4/handler'
export const dynamic = 'force-dynamic'
async function handle(request: Request, context: { params: Promise<{ action: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  return handleGa4(request, (await context.params).action, user)
}
export { handle as GET, handle as POST }
