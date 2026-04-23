'use client'

import { useState } from 'react'

/**
 * 邀请申请表单
 * 提交到正式 invite 申请接口，由 Payload collection 统一写入 D1。
 * @returns 表单节点
 */
export function OfficialInviteRequestForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  /**
   * 提交邀请申请
   */
  async function handleSubmit() {
    if (!email.trim() || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/invite-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          sourcePath: '/invite/',
        }),
      })

      if (!response.ok) {
        throw new Error('Invite request failed.')
      }

      setSubmitted(true)
      setEmail('')
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
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          required
          type="email"
          value={email}
        />
        <button
          className="invite-submit"
          disabled={isSubmitting}
          id="invite-btn"
          onClick={() => void handleSubmit()}
          type="button"
        >
          {isSubmitting ? 'Requesting…' : 'Request Invite →'}
        </button>
      </div>
    </>
  )
}
