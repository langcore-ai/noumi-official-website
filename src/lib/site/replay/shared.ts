import { z } from 'zod'

export const REPLAY_APP = 'noumi-official'
export const REPLAY_IDLE_MS = 30 * 60_000
export const REPLAY_IDENTITY_KEY = 'noumi:official:replay:identity'
export const REPLAY_VISIT_KEY = 'noumi:official:replay:visit'

/** 只录制已知公开页面；预览由服务端 draftMode 额外阻断。 */
export function replayRoute(pathname: string): string | null {
  if (pathname === '/') return '/'
  return /^\/(?:features|use-cases|blog|pricing|about|faqs|contact|links|privacy|terms)(?:\/[a-zA-Z0-9_-]+)?\/?$/.test(
    pathname,
  )
    ? pathname
    : null
}

export const productRouteSchema = z.string().refine((value) => replayRoute(value) !== null)
export const productEventNameSchema = z.enum([
  'official_page_viewed',
  'official_cta_clicked',
  'official_product_auth_redirected',
  'official_invite_lookup_completed',
  'official_invite_request_submitted',
])
const label = z
  .string()
  .max(96)
  .regex(/^[a-zA-Z0-9_.:/ -]*$/)
export const productEventPropertiesSchema = z
  .object({
    action: label.optional(),
    cta_id: label.optional(),
    placement: label.optional(),
    outcome: label.optional(),
    status: label.optional(),
    page_path: productRouteSchema.optional(),
    source_path: productRouteSchema.optional(),
    target_path: z
      .string()
      .max(160)
      .regex(/^\/[a-zA-Z0-9/_-]*$/)
      .optional(),
    utm_source: label.optional(),
    utm_medium: label.optional(),
    utm_campaign: label.optional(),
    referrerHost: z
      .string()
      .max(253)
      .regex(/^[a-zA-Z0-9.-]*$/)
      .optional(),
    language: z
      .string()
      .max(35)
      .regex(/^[a-zA-Z0-9-]*$/)
      .optional(),
    device: z.enum(['mobile', 'desktop']).optional(),
  })
  .strict()
export type ProductEventName = z.infer<typeof productEventNameSchema>
export type ProductEventProperties = z.infer<typeof productEventPropertiesSchema>
export const replayConfigSchema = z.object({
  enabled: z.boolean(),
  publicKey: z
    .string()
    .regex(/^public_key_rr_[a-zA-Z0-9]+$/)
    .nullable(),
  scope: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
})
export type ReplayConfig = z.infer<typeof replayConfigSchema>

/** 字段逐个白名单校验，避免一个不支持的属性丢掉整个业务事件。 */
export function replayProperties(input: Record<string, unknown>): ProductEventProperties {
  return Object.fromEntries(
    Object.entries(productEventPropertiesSchema.shape).flatMap(([key, schema]) => {
      const parsed = schema.safeParse(input[key])
      return parsed.success && parsed.data !== undefined ? [[key, parsed.data]] : []
    }),
  )
}
