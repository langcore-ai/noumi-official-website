import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('noumi-cookie-consent', JSON.stringify({ version: 3, analytics: false }))
  })
})

test('deliverable previews load on selection; full images load only on expansion', async ({
  page,
}) => {
  const images: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'image') images.push(request.url())
  })
  await page.goto('/')
  const tabs = page.getByRole('tablist', { name: 'Deliverable types' })
  await tabs.scrollIntoViewIfNeeded()
  await expect(tabs.getByRole('tab')).toHaveCount(8)
  const preview = page.locator('.deliverable-screenshot > img')
  await expect
    .poll(() => preview.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true)
  expect(images.some((url) => /-full\./.test(url))).toBe(false)
  expect(images.some((url) => /excel-(preview|mobile)\./.test(url))).toBe(false)
  for (const tab of await tabs.getByRole('tab').all()) {
    const label = (await tab.textContent())!.trim()
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(preview).toHaveAttribute('alt', `${label} example in the Noumi workspace`)
    await expect
      .poll(() => preview.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true)
  }
  await tabs.getByRole('tab', { name: 'Excel', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.getByRole('tab', { name: 'Prototype', exact: true })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(tabs.getByRole('tab', { name: 'Swimlane', exact: true })).toBeFocused()
  const expand = page.getByRole('button', { name: 'Enlarge Swimlane screenshot' })
  await expand.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect.poll(() => images.some((url) => /swimlane-full\./.test(url))).toBe(true)
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(expand).toBeFocused()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

for (const width of [390, 768, 1440]) {
  test(`shared chrome including use-case detail at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/features', '/use-cases/solutions-engineer', '/about', '/pricing']) {
      await page.goto(route)
      await expect(page.locator('header.site-header--home')).toHaveCount(1)
      await expect(page.locator('header.site-header--use-case')).toHaveCount(0)
      await expect(page.locator('.brand__wordmark')).toHaveText('Noumi.ai')
      await expect(page.locator('#footer')).toHaveCount(1)
      await expect(page.locator('#footer')).toHaveCSS('background-color', 'rgb(16, 25, 29)')
      await expect(page.locator('.footer-free-cta')).toHaveAttribute(
        'data-analytics-placement',
        'footer',
      )
      if (route.includes('/use-cases/') && width > 900) {
        await expect(
          page
            .getByRole('navigation', { name: 'Primary', exact: true })
            .getByRole('link', { name: 'Use Cases' }),
        ).toHaveAttribute('aria-current', 'page')
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        route,
      ).toBeLessThanOrEqual(width)
    }
  })
}

test('gallery can resize while its content request is still pending', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  let release!: () => void
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/assets/content/manifest.json', async (route) => {
    await ready
    await route.continue()
  })
  await page.goto('/assets/usecases-gallery/index.html', { waitUntil: 'domcontentloaded' })
  await page.setViewportSize({ width: 390, height: 900 })
  // Let the gallery's 150ms resize debounce fire before resolving its data.
  await page.waitForTimeout(250)
  release()
  await expect(page.locator('.pill')).toHaveCount(5)
  expect(errors).toEqual([])
})
