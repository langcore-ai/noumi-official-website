import { expect, test } from '@playwright/test'

test('homepage hero uses the optimized static image without loading a video', async ({ page }) => {
  await page.goto('/')
  const image = page.locator('.redesign-hero__image')
  await expect(image).toHaveAttribute('src', /hero-static\.[a-f0-9]+\.webp$/)
  await expect(image).toBeVisible()
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0)
  await expect(page.locator('.redesign-hero__media video')).toHaveCount(0)
})

test('client navigation keeps the homepage and shared chrome visible', async ({ page }) => {
  await page.goto('/')
  await page.locator('.site-nav__about').click()
  await expect(page).toHaveURL(/\/about$/)
  await page.locator('.site-header .brand').click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.redesign-hero__content')).toHaveCSS('opacity', '1')
  await expect(page.locator('.redesign-final-cta h2')).toHaveCSS('opacity', '1')
  await expect(page.locator('.site-nav__about .prototype-button-content')).toHaveCount(0)
})

test('reduced motion and disabled JavaScript never hide homepage content', async ({
  browser,
  baseURL,
}) => {
  for (const options of [{ reducedMotion: 'reduce' as const }, { javaScriptEnabled: false }]) {
    const context = await browser.newContext(options)
    const page = await context.newPage()
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' })
    for (const selector of [
      '.redesign-hero__content',
      '.redesign-section-heading',
      '.redesign-final-cta h2',
    ]) {
      await expect(page.locator(`${selector}:visible`)).toHaveCSS('opacity', '1')
      await expect(page.locator(`${selector}:visible`)).toHaveCSS('transform', 'none')
    }
    await expect(page.locator('.redesign-hero__image:visible')).toHaveAttribute('src', /\.webp$/)
    await context.close()
  }
})
