import React from 'react'
import Link from 'next/link'
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { AdminViewServerProps } from 'payload'

vi.mock('@payloadcms/next/templates', () => ({
  DefaultTemplate: ({
    permissions,
    children,
  }: {
    permissions?: { collections?: { users?: { read?: boolean } } }
    children: React.ReactNode
  }) => (
    <>
      <nav>
        {permissions?.collections?.users?.read && (
          <Link href="/admin/collections/users">Users</Link>
        )}
      </nav>
      {children}
    </>
  ),
}))
vi.mock('@/components/admin/replay/ReplayDashboard', () => ({
  ReplayDashboard: () => <h1>Visit replays</h1>,
}))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('not-found')
  },
}))
import ReplayView from '@/components/admin/replay/ReplayView'
afterEach(cleanup)
it('preserves collection navigation using permissions supplied in Payload initPageResult', () => {
  // Match Payload Root: permissions are provided inside initPageResult, not at the top level.
  const props = {
    initPageResult: {
      req: { user: { roles: ['admin'] } },
      permissions: { collections: { users: { read: true } } },
      visibleEntities: { collections: ['users'], globals: [] },
    },
  } as unknown as AdminViewServerProps
  render(<ReplayView {...props} />)
  expect(screen.getByRole('link', { name: 'Users' }).getAttribute('href')).toBe(
    '/admin/collections/users',
  )
  expect(screen.getByRole('heading', { name: 'Visit replays' })).toBeTruthy()
})
it('still rejects non-admin access to the replay view', () => {
  const props = {
    initPageResult: { req: { user: { roles: ['viewer'] } } },
  } as unknown as AdminViewServerProps
  expect(() => ReplayView(props)).toThrow('not-found')
})
