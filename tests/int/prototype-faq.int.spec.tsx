import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PrototypeEffects } from '@/components/site/prototype/PrototypeEffects'
vi.mock('@/lib/site/prototype-motion', () => ({
  HOME_MOTION: [],
  installPrototypeMotion: () => () => {},
}))
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})
afterEach(() => vi.unstubAllGlobals())
function mount(allowMultipleFaqs: boolean) {
  return render(
    <main data-prototype-source="faq.html">
      <details data-prototype-faq="">
        <summary>First question</summary>
        <p>First answer</p>
      </details>
      <details data-prototype-faq="">
        <summary>Second question</summary>
        <p>Second answer</p>
      </details>
      <PrototypeEffects motion={{ events: [], lists: {} }} allowMultipleFaqs={allowMultipleFaqs} />
    </main>,
  )
}
it('keeps multiple FAQ answers open and closes only the clicked question', async () => {
  const { container, unmount } = mount(true)
  try {
    const [first, second] = container.querySelectorAll('details')
    fireEvent.click(first.querySelector('summary')!)
    fireEvent.click(second.querySelector('summary')!)
    expect(first.open).toBe(true)
    expect(second.open).toBe(true)
    fireEvent.click(first.querySelector('summary')!)
    await waitFor(() => expect(first.open).toBe(false))
    expect(second.open).toBe(true)
  } finally {
    unmount()
  }
})
it('preserves exclusive FAQ behavior on pages that do not opt in', () => {
  const { container, unmount } = mount(false)
  try {
    const [first, second] = container.querySelectorAll('details')
    fireEvent.click(first.querySelector('summary')!)
    fireEvent.click(second.querySelector('summary')!)
    expect(first.open).toBe(false)
    expect(second.open).toBe(true)
  } finally {
    unmount()
  }
})
