import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ConversionDashboard } from '@/components/admin/replay/ConversionDashboard'
import type {
  ConversionAccount,
  ConversionDashboard as Dashboard,
} from '@/lib/site/conversion-types'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('classifies each account by its creation time even when the visitor has conflicting associations', async () => {
  const data: Dashboard = {
    version: 1,
    configured: true,
    generatedAt: '2026-10-08T00:00:00Z',
    from: '2026-10-01',
    to: '2026-10-07',
    summary: { visitors: 1, enteredProduct: 0, registered: 0, onboarded: 0, ambiguous: 1 },
    total: 1,
    nextOffset: null,
    visitors: [
      {
        visitorId: '11111111-1111-4111-8111-111111111111',
        firstSeenAt: '2026-10-01T01:00:00Z',
        lastSeenAt: '2026-10-07T23:59:59Z',
        pageViews: 2,
        enteredProductAt: null,
        landingPage: '/',
        association: 'ambiguous',
        registeredInWindow: false,
        onboardedInWindow: false,
        accounts: [
          '2026-09-30T00:00:00Z',
          '2026-10-01T01:00:00Z',
          '2026-10-07T23:59:59Z',
          '2026-10-08T00:00:00Z',
        ].map(
          (createdAt, index): ConversionAccount => ({
            id: `account-${index}`,
            email: `account-${index}@example.test`,
            username: null,
            createdAt,
            emailVerified: true,
            onboardingCompletedAt: null,
            legacyOnboarding: false,
          }),
        ),
      },
    ],
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(data)),
  )
  const { container } = render(<ConversionDashboard />)
  await screen.findByText(data.visitors[0]!.accounts[0]!.email)
  const statuses = [...container.querySelectorAll('tbody td:nth-child(4) > div')].map(
    (node) => node.firstElementChild?.textContent,
  )
  expect(statuses).toEqual([
    'Existing account',
    'Created in this conversion window',
    'Created in this conversion window',
    'Existing account',
  ])
})
