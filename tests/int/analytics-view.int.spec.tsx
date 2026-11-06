import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'
import { AnalyticsView } from '@/components/admin/AnalyticsView'
vi.mock('@/components/admin/AnalyticsDashboard', () => ({
  AnalyticsDashboard: ({ canManage }: { canManage: boolean }) => (
    <div>{canManage ? 'manage' : 'read'}</div>
  ),
}))
vi.mock('@payloadcms/next/templates', () => ({
  DefaultTemplate: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('@payloadcms/ui', () => ({
  Gutter: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  SetStepNav: (): null => null,
}))
vi.mock('next/navigation', () => ({
  redirect: () => {
    throw new Error('redirect')
  },
  notFound: () => {
    throw new Error('not-found')
  },
}))
const props = (roles?: string[]) =>
  ({
    initPageResult: {
      req: {
        user: roles ? { id: 1, roles } : null,
        payload: { config: { routes: { admin: '/admin' } } },
      },
      visibleEntities: { collections: [], globals: [] },
    },
  }) as unknown as AdminViewServerProps
afterEach(cleanup)
describe('analytics admin view', () => {
  it('rejects unauthenticated and unauthorized visitors', async () => {
    await expect(AnalyticsView(props())).rejects.toThrow('redirect')
    await expect(AnalyticsView(props(['legal-editor']))).rejects.toThrow('not-found')
  })
  it.each(['content-editor', 'viewer'])('gives %s read-only UI', async (role) => {
    render(await AnalyticsView(props([role])))
    expect(screen.getByText('read')).toBeTruthy()
    expect(document.querySelector('iframe')).toBeNull()
  })
  it('only admins can manage the shared connection', async () => {
    render(await AnalyticsView(props(['admin'])))
    expect(screen.getByText('manage')).toBeTruthy()
  })
})
