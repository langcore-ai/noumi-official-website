import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(
      /Personal AI workspace built for Business & Solutions professionals \| Noumi\.ai/,
    )

    const heading = page.locator('h1').first()

    await expect(heading).toContainText(
      /Trustworthy\s*Deliverables\s*Securely in Your Noumi Workspace\./,
    )
  })
})
