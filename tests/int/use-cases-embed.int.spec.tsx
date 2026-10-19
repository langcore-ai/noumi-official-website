import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { OfficialUseCasesEmbed } from '@/components/site/official/OfficialUseCasesEmbed'

const origin = 'https://noumi-twelve-use-cases.himihiroti.chatgpt.site'
let notify: (entries: { contentRect: { width: number } }[]) => void
const disconnect = vi.fn()
beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      disconnect = disconnect
      constructor(callback: typeof notify) {
        notify = callback
      }
    },
  )
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function send(
  frame: HTMLIFrameElement,
  height: unknown,
  sender = origin,
  source: MessageEventSource | null = frame.contentWindow,
) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: sender,
        source,
        data: { type: 'noumi:embed-height', height },
      }),
    )
  })
}

it('keeps scrolling until a trusted valid height, supports shrinking and resets on reload', () => {
  const { container } = render(<OfficialUseCasesEmbed />)
  const frame = container.querySelector('iframe')!
  expect(frame.getAttribute('scrolling')).toBe('auto')
  send(frame, 1200, 'https://untrusted.test')
  send(frame, 1200, origin, window)
  for (const invalid of ['1200', NaN, Infinity, -1, 0, 100001, null]) send(frame, invalid)
  expect(frame.dataset.embedStatus).toBe('waiting')
  send(frame, 1200.2)
  expect(frame.style.height).toBe('1201px')
  expect(frame.getAttribute('scrolling')).toBe('no')
  send(frame, 650)
  expect(frame.style.height).toBe('650px')
  fireEvent.load(frame)
  expect(frame.dataset.embedStatus).toBe('waiting')
  expect(frame.getAttribute('scrolling')).toBe('auto')
})

it('bounds retries, accepts late replies, requests only for width changes and cleans up', () => {
  const { container, unmount } = render(<OfficialUseCasesEmbed />)
  const frame = container.querySelector('iframe')!
  const post = vi.spyOn(frame.contentWindow!, 'postMessage')
  fireEvent.load(frame)
  act(() => vi.advanceTimersByTime(10000))
  expect(post).toHaveBeenCalledTimes(6)
  expect(post).toHaveBeenLastCalledWith({ type: 'noumi:embed-measure' }, origin)
  send(frame, 950)
  expect(frame.dataset.embedStatus).toBe('ready')
  act(() => {
    notify([{ contentRect: { width: 500 } }])
    notify([{ contentRect: { width: 500 } }])
  })
  expect(post).toHaveBeenCalledTimes(7)
  fireEvent.load(frame)
  const beforeUnmount = post.mock.calls.length
  unmount()
  expect(disconnect).toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(10000))
  expect(post).toHaveBeenCalledTimes(beforeUnmount)
})
