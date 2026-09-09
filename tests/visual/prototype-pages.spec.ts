import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
const pages = JSON.parse(readFileSync('src/lib/site/prototype/pages.json', 'utf8')) as Record<
  string,
  { file: string; headings: string[]; html: string }
>

for (const width of [390, 768, 1440]) {
  test(`every exported child HTML has a working reconstruction at ${width}px`, async ({ page }) => {
    test.setTimeout(240000)
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const [route, source] of Object.entries(pages)) {
      if (route === '/' || route === '/about') continue
      await page.goto(route)
      const main = page.locator(`[data-prototype-source="${source.file}"]`)
      await expect(main).toHaveCount(1)
      await expect(main.locator('h1,h2,h3').filter({ hasText: /\S/ })).toHaveText(source.headings)
      await expect(main).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        route,
      ).toBeLessThanOrEqual(width + 1)
      expect(errors, route).toEqual([])
    }
  })
}

test('prototype FAQ, price tabs, feature hover and testimonial navigation work', async ({
  page,
}) => {
  await page.goto('/features')
  const card = page.locator('.prototype-page .features-card').first()
  await card.scrollIntoViewIfNeeded()
  await card.hover()
  await expect(card.locator('.process-link-wrap')).toHaveCSS('opacity', '1')
  const faq = page.locator('.prototype-page details').first()
  await faq.locator('summary').click()
  await expect(faq).toHaveAttribute('open', '')
  await expect(faq.locator('.faq-answer')).toBeVisible()
  await faq.locator('summary').press('Enter')
  await expect(faq).not.toHaveAttribute('open', '')
  await page.goto('/pricing')
  await page.getByRole('tab', { name: 'Yearly', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Yearly', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('.w-tab-pane:visible')).toHaveAttribute('data-w-tab', 'Yearly')
  await page.getByRole('tab', { name: 'Yearly', exact: true }).press('Home')
  await expect(page.locator('.w-tab-pane:visible')).toHaveAttribute('data-w-tab', 'One Month')
  await page.goto('/use-cases/solutions-engineer')
  const slider = page.locator('.prototype-page .w-slider')
  await slider.getByRole('button', { name: 'Next testimonial' }).click()
  await expect(slider.locator('.w-slide').nth(1)).toHaveAttribute('aria-hidden', 'false')
})

test('HTML aliases map to canonical pages; unknown routes use the native not-found boundary', async ({
  page,
}) => {
  await page.goto('/specialist-level-expertise.html')
  await expect(page).toHaveURL(/\/features\/specialist-level-expertise$/)
  await expect(page.locator('h1')).toHaveText('Specialist Level Expertise')
  await page.goto('/this-route-does-not-exist')
  // The shared loading boundary streams before Next can set a 404 HTTP status.
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
  await expect(page.locator('[data-prototype-source="404.html"]')).toBeVisible()
})

test('all local prototype assets exist', async ({ request }) => {
  test.setTimeout(120000)
  const assets = new Set(
    Object.values(pages).flatMap((page) =>
      [...page.html.matchAll(/(?:src|poster)="(\/assets\/prototype\/[^" ]+)"/g)].map(
        (match) => match[1],
      ),
    ),
  )
  for (const asset of assets) expect((await request.get(asset)).ok(), asset).toBe(true)
})
