import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SecurityContents } from '@/app/(frontend)/security/SecurityContents'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('tracks the visible topic and its parent when scrolling down and back up', () => {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(0), 16),
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  let offset = 0
  const positions: Record<string, number> = {
    infrastructure: 500,
    architecture: 560,
    data: 1100,
    isolation: 1160,
  }
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const top = (positions[this.id] ?? 0) - offset
    return {
      top,
      bottom: top + 30,
      height: 30,
      left: 0,
      right: 220,
      width: 220,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }
  })
  render(
    <>
      <h2 id="infrastructure">First section</h2>
      <h3 id="architecture">First topic</h3>
      <h2 id="data">Second section</h2>
      <h3 id="isolation">Second topic</h3>
      <SecurityContents
        groups={[
          {
            id: 'infrastructure',
            title: 'Infrastructure',
            items: [{ id: 'architecture', title: 'Architecture' }],
          },
          { id: 'data', title: 'Data', items: [{ id: 'isolation', title: 'Isolation' }] },
        ]}
      />
    </>,
  )
  act(() => vi.advanceTimersByTime(20))
  expect(document.querySelector('[aria-current="location"]')).toBeNull()
  const scroll = (value: number) => {
    offset = value
    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(20))
  }
  scroll(400)
  expect(screen.getByRole('link', { name: 'Architecture' }).getAttribute('aria-current')).toBe(
    'location',
  )
  scroll(1000)
  expect(screen.getByRole('link', { name: 'Isolation' }).getAttribute('aria-current')).toBe(
    'location',
  )
  expect(screen.getByRole('link', { name: 'Data' }).getAttribute('data-active-group')).toBe('true')
  expect(screen.getByRole('link', { name: 'Architecture' }).hasAttribute('aria-current')).toBe(
    false,
  )
  scroll(400)
  expect(screen.getByRole('link', { name: 'Architecture' }).getAttribute('aria-current')).toBe(
    'location',
  )
  expect(screen.getByRole('link', { name: 'Data' }).hasAttribute('data-active-group')).toBe(false)
})
