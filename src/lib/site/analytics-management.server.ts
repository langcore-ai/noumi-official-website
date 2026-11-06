import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { normalizeGtmContainerId } from './analytics-management'

/** Read runtime settings on Workers as well as local Node; never expose report settings publicly. */
export async function getAnalyticsManagementConfig() {
  let runtime: Record<string, unknown> = {}
  try {
    runtime = (await getCloudflareContext({ async: true })).env as unknown as Record<
      string,
      unknown
    >
  } catch {
    // Local Node and build tooling may not have a Workers context.
  }
  const read = (key: string) => {
    const value = process.env[key] || runtime[key]
    return typeof value === 'string' ? value : ''
  }
  return {
    gtmContainerId: normalizeGtmContainerId(read('OFFICIAL_GTM_CONTAINER_ID')),
  }
}
