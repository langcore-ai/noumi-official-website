import { expect, test } from '@playwright/test'

test('shared footer uses the dark brand panel, social icons and copy-email contact', async ({
  page,
}) => {
  await page.goto('/about')
  const footer = page.locator('#footer')
  await footer.scrollIntoViewIfNeeded()
  await expect(footer).toHaveCSS('background-color', 'rgb(20, 20, 19)')
  await expect(footer.locator('.footer-note')).toHaveText(
    /The trustworthy AI teammate for presales\s*&\s*solution consultants\./,
  )
  await expect(footer.locator('.footer-heading')).toHaveText(['Product', 'Resources', 'Company'])

  const social = footer.getByRole('navigation', { name: 'Social media' })
  const links = social.locator('a.footer-social-icon')
  await expect(links).toHaveCount(3)
  for (const [index, pattern] of [/youtube\.com/, /linkedin\.com/, /x\.com/].entries()) {
    await expect(links.nth(index)).toHaveAttribute('href', pattern)
  }
  for (const link of await links.all()) {
    await expect
      .poll(() =>
        link
          .locator('img')
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true)
  }

  // The Company email is a button for clipboard copying, backed by a real mailto link
  // so the address stays reachable without JavaScript.
  await expect(footer.getByRole('button', { name: 'Copy official@noumi.ai' })).toBeVisible()
  await expect(footer.locator('a[href="mailto:official@noumi.ai"]')).toHaveCount(1)

  await page.setViewportSize({ width: 390, height: 844 })
  await footer.scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await expect(footer.getByRole('button', { name: 'Copy official@noumi.ai' })).toBeVisible()
})
