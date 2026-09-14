import { act, fireEvent, render, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import { OfficialUseCasesShowcase } from '@/components/site/official/OfficialUseCasesShowcase'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('resizes the gallery in both directions and reconnects after iframe reload', () => {
  const observers: { notify: () => void; disconnect: ReturnType<typeof vi.fn> }[] = []
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn()
      observe = vi.fn()
      constructor(notify: () => void) {
        observers.push({ notify, disconnect: this.disconnect })
      }
    },
  )
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())

  const { container, unmount } = render(<OfficialUseCasesShowcase />)
  const frame = container.querySelector('iframe')!
  const doc = document.implementation.createHTMLDocument()
  doc.body.innerHTML = '<div class="page"></div>'
  Object.defineProperty(frame, 'contentDocument', { value: doc })
  let height = 1450.5
  const content = doc.querySelector<HTMLElement>('.page')!
  vi.spyOn(content, 'getBoundingClientRect').mockImplementation(() => ({ height }) as DOMRect)

  fireEvent.load(frame)
  expect(frame.style.height).toBe('1451px')
  expect(doc.documentElement.classList.contains('embedded-gallery')).toBe(true)
  height = 620
  act(() => observers.at(-1)!.notify())
  expect(frame.style.height).toBe('620px')
  height = 1900
  act(() => observers.at(-1)!.notify())
  expect(frame.style.height).toBe('1900px')

  fireEvent.load(frame)
  expect(observers[0].disconnect).toHaveBeenCalled()
  unmount()
  expect(observers.at(-1)!.disconnect).toHaveBeenCalled()
})
