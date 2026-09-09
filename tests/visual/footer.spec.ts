import { expect, test } from '@playwright/test'

test('footer Contact preserves prototype icons, separators and hover movement', async ({
  page,
}) => {
  await page.goto('/about')
  await expect(page.locator('[data-about-motion="hero"]:visible')).toHaveAttribute(
    'data-motion-state',
    'done',
  )
  await expect(page.locator('[data-about-prototype]')).toHaveCount(1)
  const links = page.locator('.footer-social-link')
  await links.first().scrollIntoViewIfNeeded()
  await expect(links).toHaveCount(4)
  await expect(links).toHaveText(['Email', 'YouTube', 'LinkedIn', 'Twitter'])
  for (const link of await links.all()) {
    const icon = link.locator('img')
    await expect
      .poll(() => icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true)
    const bounds = await icon.boundingBox()
    expect(bounds?.width).toBeGreaterThan(19)
    expect(bounds?.width).toBeLessThan(35)
    await link.hover()
    await expect(icon).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)')
    await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)')
  }
  await expect(links.first()).toHaveCSS('border-bottom-width', '1px')
  await expect(links.last()).toHaveCSS('border-bottom-width', '0px')
  await page.mouse.move(0, 0)
  await expect(links.last().locator('img')).toHaveCSS('transform', 'none')
  await links.first().focus()
  await expect(links.first().locator('img')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 5, 0)')
  await page.setViewportSize({ width: 390, height: 844 })
  await links.first().scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  for (const link of await links.all()) await expect(link.locator('img')).toBeVisible()
})
