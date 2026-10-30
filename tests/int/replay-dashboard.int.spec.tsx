import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'

vi.mock('next/dynamic', () => ({
  default: () =>
    function EmptyPlayer(): null {
      return null
    },
}))
vi.mock('@/components/admin/replay/api', () => ({ readReplay: vi.fn() }))
import { readReplay } from '@/components/admin/replay/api'
import { ReplayDashboard } from '@/components/admin/replay/ReplayDashboard'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  history.replaceState(null, '', '/')
})
it('opens the visitor received from the product replay link without loading all visitors first', async () => {
  const visitor = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  history.replaceState(null, '', `/admin/visit-replays?visitor=${visitor}`)
  vi.mocked(readReplay).mockResolvedValue({ configured: true, items: [], nextOffset: null })
  render(<ReplayDashboard initialVisitor={visitor} />)
  expect((screen.getByLabelText('Visitor ID') as HTMLInputElement).value).toBe(visitor)
  await waitFor(() =>
    expect(readReplay).toHaveBeenCalledWith(
      `visits?offset=0&anonymousId=${visitor}`,
      expect.any(AbortSignal),
    ),
  )
})
