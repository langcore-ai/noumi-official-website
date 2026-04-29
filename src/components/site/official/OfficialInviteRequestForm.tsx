'use client'

import { useState } from 'react'

import { useOfficialAnalytics } from '@/components/site/OfficialAnalyticsProvider'

type InviteLookupAction = 'idle' | 'login' | 'register' | 'duplicate' | 'request'

type InviteLookupResult = {
  action: Exclude<InviteLookupAction, 'idle'>
  loginUrl?: string
  registrationUrl?: string
  status?: string
}

/**
 * 邀请申请表单
 * 提交到正式 invite 申请接口，由 Payload collection 统一写入 D1。
 * @returns 表单节点
 */
export function OfficialInviteRequestForm() {
  const { capture } = useOfficialAnalytics()
  const [email, setEmail] = useState('')
  const [lookupResult, setLookupResult] = useState<InviteLookupResult | null>(null)
  const [message, setMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const normalizedEmail = email.trim().toLowerCase()

  /**
   * 校验邮箱格式，避免空输入或明显错误输入触发请求。
   * @param value 邮箱文本
   * @returns 是否合法
   */
  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  /**
   * 根据反查结果生成按钮文案。
   * @returns 当前按钮文案
   */
  function getButtonLabel(): string {
    if (isChecking) {
      return 'Checking…'
    }

    if (isSubmitting) {
      return 'Requesting…'
    }

    switch (lookupResult?.action) {
      case 'login':
        return 'Go to Login →'
      case 'register':
        return 'Go to Register →'
      case 'duplicate':
        return 'Already Requested'
      case 'request':
      default:
        return 'Request Invite →'
    }
  }

  /**
   * 反查当前邮箱在产品侧和官网 waitlist 中的状态。
   * @returns 反查结果；失败或邮箱无效时返回 null
   */
  async function checkInviteStatus(): Promise<InviteLookupResult | null> {
    if (!isValidEmail(normalizedEmail)) {
      setLookupResult(null)
      setMessage('')
      return null
    }

    setIsChecking(true)

    try {
      const response = await fetch('/api/site/invite-requests/lookup', {
        body: JSON.stringify({ email: normalizedEmail }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Invite lookup failed.')
      }

      const result = (await response.json()) as InviteLookupResult
      setLookupResult(result)

      capture('official_invite_lookup_completed', {
        action: result.action,
        source_path: '/invite',
        status: result.status ?? null,
      })

      if (result.action === 'duplicate') {
        setMessage("You're already on the waitlist. We'll email you when your spot opens.")
      } else {
        setMessage('')
      }

      return result
    } catch {
      setLookupResult(null)
      setMessage('')
      return null
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * 提交邀请申请
   */
  async function handleSubmit() {
    if (!normalizedEmail || isSubmitting) {
      return
    }

    const currentLookup = lookupResult ?? (await checkInviteStatus())

    if (currentLookup?.action === 'login' && currentLookup.loginUrl) {
      capture('official_product_auth_redirected', {
        action: 'login',
        source_path: '/invite',
        target_path: '/auth',
      })
      window.location.href = currentLookup.loginUrl
      return
    }

    if (currentLookup?.action === 'register' && currentLookup.registrationUrl) {
      capture('official_product_auth_redirected', {
        action: 'register',
        source_path: '/invite',
        target_path: '/auth',
      })
      window.location.href = currentLookup.registrationUrl
      return
    }

    if (currentLookup?.action === 'duplicate') {
      setMessage("You're already on the waitlist. We'll email you when your spot opens.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/site/invite-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          sourcePath: '/invite/',
        }),
      })

      if (!response.ok) {
        throw new Error('Invite request failed.')
      }

      const result = (await response.json().catch((): null => null)) as InviteLookupResult | null
      if (result?.action === 'login' && result.loginUrl) {
        capture('official_product_auth_redirected', {
          action: 'login',
          source_path: '/invite',
          target_path: '/auth',
        })
        window.location.href = result.loginUrl
        return
      }

      if (result?.action === 'register' && result.registrationUrl) {
        capture('official_product_auth_redirected', {
          action: 'register',
          source_path: '/invite',
          target_path: '/auth',
        })
        window.location.href = result.registrationUrl
        return
      }

      if (result?.action === 'duplicate') {
        setLookupResult(result)
        setMessage("You're already on the waitlist. We'll email you when your spot opens.")
        return
      }

      capture('official_invite_request_submitted', {
        outcome: 'created',
        source_path: '/invite',
      })
      setSubmitted(true)
      setEmail('')
      setLookupResult(null)
      setMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="invite-success" style={{ display: submitted ? 'block' : 'none' }}>
        <p>
          <strong>You&apos;re on the list.</strong> We&apos;ll email you an invite code when your
          spot opens up. Keep an eye on your inbox.
        </p>
      </div>

      <div className="invite-form reveal d3" id="invite-form-wrap">
        <input
          autoComplete="email"
          className="invite-input"
          id="invite-email"
          onBlur={() => void checkInviteStatus()}
          onChange={(event) => {
            setEmail(event.target.value)
            setSubmitted(false)
            setLookupResult(null)
            setMessage('')
          }}
          placeholder="your@email.com"
          required
          type="email"
          value={email}
        />
        <button
          className="invite-submit"
          disabled={isSubmitting || lookupResult?.action === 'duplicate'}
          id="invite-btn"
          onClick={() => void handleSubmit()}
          onMouseDown={(event) => {
            // 点击按钮时避免输入框先触发 blur 反查，导致 click 被禁用状态吃掉。
            event.preventDefault()
          }}
          type="button"
        >
          {getButtonLabel()}
        </button>
      </div>
      <div className="invite-success" style={{ display: message ? 'block' : 'none' }}>
        <p>{message}</p>
      </div>
    </>
  )
}
