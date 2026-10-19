import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { OfficialReplayController } from '@/components/site/OfficialReplayController'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from '@/lib/site/consent'
const sdk = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  getRecordingId: vi.fn(() => null),
  addMeta: vi.fn(),
}))
vi.mock('@rrweb/browser-client', () => sdk)
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
function consent(value: boolean) {
  localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify({ version: COOKIE_CONSENT_VERSION, analytics: value }),
  )
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
}
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
it('does not load config before consent and ignores a response arriving after withdrawal', async () => {
  let resolve!: (value: Response) => void
  vi.mocked(fetch).mockReturnValue(
    new Promise<Response>((done) => {
      resolve = done
    }),
  )
  render(<OfficialReplayController />)
  expect(fetch).not.toHaveBeenCalled()
  act(() => consent(true))
  expect(fetch).toHaveBeenCalledTimes(1)
  act(() => consent(false))
  await act(async () =>
    resolve(Response.json({ enabled: true, publicKey: 'public_key_rr_test', scope: 'test' })),
  )
  expect(sdk.start).not.toHaveBeenCalled()
})
it('does not start after unmount while config is pending', async () => {
  let resolve!: (value: Response) => void
  vi.mocked(fetch).mockReturnValue(
    new Promise<Response>((done) => {
      resolve = done
    }),
  )
  consent(true)
  const view = render(<OfficialReplayController />)
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  view.unmount()
  await act(async () =>
    resolve(Response.json({ enabled: true, publicKey: 'public_key_rr_test', scope: 'test' })),
  )
  expect(sdk.start).not.toHaveBeenCalled()
})
