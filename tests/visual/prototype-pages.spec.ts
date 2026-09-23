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
      // '/'、'/about' 是原生重建页；'/blog' 已接回 CMS 列表，三者都不再由 PrototypePage 渲染。
      if (route === '/' || route === '/about' || route === '/blog') continue
      await page.goto(route)
      const main = page.locator(`[data-prototype-source="${source.file}"]:visible`)
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
  // Next may briefly retain a hidden streamed copy; inspect the visitor-visible page.
  const main = page.locator('.prototype-page:visible')
  await expect(main).toHaveCSS('background-color', 'rgb(245, 243, 238)')
  await expect(main.locator('.faq-area')).toHaveCSS('width', '1000px')
  await expect(main.locator('.features-icon-area').first()).toHaveCSS(
    'background-color',
    'rgb(77, 114, 194)',
  )
  const card = main.locator('.features-card').first()
  await card.scrollIntoViewIfNeeded()
  await card.hover()
  await expect(card.locator('.process-link-wrap')).toHaveCSS('opacity', '1')
  const faq = main.locator('details').first()
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
  const slider = main.locator('.w-slider')
  await slider.getByRole('button', { name: 'Next testimonial' }).click()
  await expect(slider.locator('.w-slide').nth(1)).toHaveAttribute('aria-hidden', 'false')
})

test('HTML aliases map to canonical pages; unknown routes use the native not-found boundary', async ({
  page,
}) => {
  await page.goto('/specialist-level-expertise.html')
  test.setTimeout(120000)
  const routes = JSON.parse(readFileSync('src/lib/site/prototype/routes.json', 'utf8')) as Record<
    string,
    string
  >
  for (const [html, route] of Object.entries(routes)) {
    await page.goto('/' + html)
    expect(new URL(page.url()).pathname, html).toBe(route)
  }
  await page.goto('/specialist-level-expertise.html')
  await expect(page).toHaveURL(/\/features\/specialist-level-expertise$/)
  await expect(page.locator('h1')).toHaveText('Specialist Level Expertise')
  await page.goto('/this-route-does-not-exist')
  // The shared loading boundary streams before Next can set a 404 HTTP status.
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0)
  await expect(page.locator('[data-prototype-source="404.html"]:visible')).toBeVisible()
})

test('prototype content and FAQ remain usable without JavaScript', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  await page.goto((process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3017') + '/features')
  await expect(page.locator('h1')).toBeVisible()
  const faq = page.locator('details[data-prototype-faq]').first()
  await faq.locator('summary').click()
  await expect(faq).toHaveAttribute('open', '')
  await expect(faq.locator('.faq-answer')).toBeVisible()
  await page.close()
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
