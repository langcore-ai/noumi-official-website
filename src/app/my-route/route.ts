import { getSitePayloadClient } from '@/lib/site/payload-client'

/** 示例接口在运行时读取 Payload 配置，避免构建期预执行 */
export const dynamic = 'force-dynamic'

export const GET = async () => {
  await getSitePayloadClient()

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
