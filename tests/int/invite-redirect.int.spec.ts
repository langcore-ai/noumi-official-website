import { expect, it, vi } from 'vitest'

const redirectTargets: string[] = []
vi.mock('next/navigation', () => ({
  redirect: (target: string) => {
    redirectTargets.push(target)
    throw new Error('NEXT_REDIRECT')
  },
}))
vi.mock('@/lib/site/managed-settings', () => ({ createManagedMetadata: () => ({}) }))

import InvitePage from '@/app/(frontend)/invite/page'

it('forwards UTM to the product auth URL', async () => {
  await expect(
    InvitePage({
      searchParams: Promise.resolve({
        utm_source: 'newsletter',
        utm_medium: 'email',
        utm_campaign: 'apollo',
        utm_content: 'hero',
        email: 'leak@example.com',
      }),
    }),
  ).rejects.toThrow('NEXT_REDIRECT')

  const target = new URL(redirectTargets[0]!)
  expect(target.origin).toBe('https://www.noumi.ai')
  expect(target.pathname).toBe('/auth')
  expect(target.searchParams.get('utm_source')).toBe('newsletter')
  expect(target.searchParams.get('utm_campaign')).toBe('apollo')
  expect(target.searchParams.get('first_touch_source')).toBe('newsletter')
  expect(target.toString()).not.toContain('leak@example.com')
})
