import { expect, test } from '@playwright/test'

test('shared footer uses the new brand, CTA and contact styling', async ({ page }) => {
  await page.goto('/about')
  const footer = page.locator('#footer')
  await footer.scrollIntoViewIfNeeded()
  await expect(footer).toHaveCSS('background-color', 'rgb(16, 25, 29)')
  await expect(footer.locator('.footer-note')).toHaveText(
    'A personal AI workspace built for Business & Solutions professionals',
  )
  await expect(footer.locator('.footer-free-cta')).toHaveText('Try Noumi Free')
  const links = footer.locator('.footer-social-link')
  await expect(links).toHaveText(['Email', 'YouTube', 'LinkedIn', 'Twitter'])
  for (const link of await links.all()) {
    await expect(link).toHaveCSS('border-bottom-width', '0px')
    await expect
      .poll(() =>
        link
          .locator('img')
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true)
    await expect(link.locator('span')).toHaveCSS('color', 'rgb(233, 238, 239)')
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await footer.scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await expect(footer.locator('.footer-free-cta')).toBeVisible()
  expect((await footer.locator('.footer-prototype-logo').boundingBox())!.width).toBeGreaterThan(120)
})
