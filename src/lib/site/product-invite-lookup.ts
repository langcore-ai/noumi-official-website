import { getCloudflareContext } from '@opennextjs/cloudflare'

const PRODUCT_LOOKUP_PATH = '/api/official/invite-lookup'

/** 产品侧 invite 反查结果。 */
export type ProductInviteLookupResult =
  | {
      email: string
      loginUrl: string
      state: 'registered'
    }
  | {
      email: string
      inviteCode: string
      registrationUrl: string
      state: 'approved'
    }
  | {
      email: string
      state: 'waitlisted'
      status: string
    }
  | {
      email: string
      state: 'not_found'
    }

/**
 * 生成日志用邮箱摘要，避免在服务端日志中输出完整邮箱。
 *
 * @param email 已规范化的邮箱
 * @returns 脱敏后的邮箱摘要
 */
function maskEmailForLog(email: string): string {
  const [name = '', domain = ''] = email.split('@')
  return `${name.slice(0, 2)}***@${domain || 'unknown'}`
}

/**
 * 输出官网到产品侧 invite lookup 的结构化日志。
 *
 * @param event 事件名
 * @param context 日志上下文
 */
function logProductInviteLookup(event: string, context: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      context,
      event,
      scope: 'official.invite.productLookup',
    }),
  )
}

/**
 * 从本地环境或 Cloudflare binding 读取字符串配置。
 *
 * @param key 配置名
 * @returns 配置值；未配置时返回空串
 */
async function readRuntimeEnv(key: 'NOUMI_PRODUCT_API_URL' | 'OFFICIAL_WAITLIST_SYNC_TOKEN'): Promise<string> {
  const processValue = process.env[key]?.trim()
  if (processValue) {
    return processValue
  }

  try {
    const cloudflare = await getCloudflareContext({ async: true })
    const value = (
      cloudflare.env as typeof cloudflare.env & {
        NOUMI_PRODUCT_API_URL?: string
        OFFICIAL_WAITLIST_SYNC_TOKEN?: string
      }
    )[key]?.trim()

    return value || ''
  } catch {
    return ''
  }
}

/**
 * 构建产品侧 invite 反查接口地址。
 *
 * @returns 产品服务 lookup 绝对地址；未配置时返回空串
 */
async function getProductInviteLookupUrl(): Promise<string> {
  const productApiUrl = await readRuntimeEnv('NOUMI_PRODUCT_API_URL')
  if (!productApiUrl) {
    return ''
  }

  return new URL(PRODUCT_LOOKUP_PATH, productApiUrl).toString()
}

/**
 * 调用 noumi-server 反查账号、waitlist 审批和邀请码状态。
 *
 * @param email 已规范化的邮箱
 * @returns 产品侧反查结果；产品接口未配置或失败时返回 null
 */
export async function lookupProductInviteApplicant(email: string): Promise<ProductInviteLookupResult | null> {
  const [lookupUrl, token] = await Promise.all([
    getProductInviteLookupUrl(),
    readRuntimeEnv('OFFICIAL_WAITLIST_SYNC_TOKEN'),
  ])
  const emailMasked = maskEmailForLog(email)

  logProductInviteLookup('configResolved', {
    email: emailMasked,
    lookupUrl,
    tokenConfigured: Boolean(token),
  })

  if (!lookupUrl || !token) {
    logProductInviteLookup('configMissing', {
      email: emailMasked,
      lookupUrlConfigured: Boolean(lookupUrl),
      tokenConfigured: Boolean(token),
    })
    return null
  }

  let response: Response
  try {
    response = await fetch(lookupUrl, {
      body: JSON.stringify({ email }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  } catch (error) {
    logProductInviteLookup('requestFailed', {
      email: emailMasked,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
      lookupUrl,
    })
    throw error
  }

  logProductInviteLookup('responseReceived', {
    email: emailMasked,
    lookupUrl,
    status: response.status,
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json().catch((): null => null)) as
    | null
    | {
        result?: ProductInviteLookupResult
      }

  logProductInviteLookup('payloadParsed', {
    email: emailMasked,
    hasResult: Boolean(payload?.result),
    state: payload?.result?.state ?? null,
  })

  return payload?.result ?? null
}
