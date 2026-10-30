import { afterEach, expect, it } from 'vitest'
import { clearSharedVisitorId, readSharedVisitorId } from '@/lib/site/shared-visitor'
import { writeStoredConsent } from '@/lib/site/consent'

afterEach(() => {
  clearSharedVisitorId()
  localStorage.clear()
})
it('clears only the visitor Cookie when analytics consent is withdrawn', () => {
  document.cookie = 'session_example=kept; Path=/'
  const id = readSharedVisitorId()
  expect(document.cookie).toContain(id)
  writeStoredConsent(false, true, false)
  expect(document.cookie).not.toContain('noumi_visitor_id_preview=')
  expect(document.cookie).toContain('session_example=kept')
})
