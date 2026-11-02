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
import ReplayView from '@/components/admin/replay/ReplayView'
import type { AdminViewServerProps } from 'payload'
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

vi.mock('@payloadcms/next/templates', () => ({
  DefaultTemplate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

it('resets the visitor and requests all visits when the route visitor is removed, then switches accounts', async () => {
  const visitor = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  const other = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  vi.mocked(readReplay).mockResolvedValue({ configured: true, items: [], nextOffset: null })
  const view = (value?: string) => (
    <ReplayView
      {...({
        initPageResult: { req: { user: { roles: ['admin'] } } },
        searchParams: { view: 'replays', ...(value ? { visitor: value } : {}) },
      } as unknown as AdminViewServerProps)}
    />
  )
  const { rerender } = render(view(visitor))
  await waitFor(() =>
    expect(readReplay).toHaveBeenLastCalledWith(
      `visits?offset=0&anonymousId=${visitor}`,
      expect.any(AbortSignal),
    ),
  )
  rerender(view())
  expect((screen.getByLabelText('Visitor ID') as HTMLInputElement).value).toBe('')
  await waitFor(() =>
    expect(readReplay).toHaveBeenLastCalledWith(
      'visits?offset=0&anonymousId=',
      expect.any(AbortSignal),
    ),
  )
  rerender(view(other))
  expect((screen.getByLabelText('Visitor ID') as HTMLInputElement).value).toBe(other)
  await waitFor(() =>
    expect(readReplay).toHaveBeenLastCalledWith(
      `visits?offset=0&anonymousId=${other}`,
      expect.any(AbortSignal),
    ),
  )
})
