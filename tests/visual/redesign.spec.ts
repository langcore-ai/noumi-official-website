import { expect, test } from '@playwright/test'

test('homepage palette, geometry and continuous scroll activation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.redesign-hero__content')).toHaveCSS('opacity', '1')
  await expect(page.locator('.redesign-home')).toHaveCSS('background-color', 'rgb(245, 243, 238)')
  await expect(page.locator('.redesign-hero__media')).toHaveCSS('width', '1200px')
  await expect(page.locator('.redesign-hero__media')).toHaveCSS('height', '472px')
  await expect(page.locator('.site-header')).toHaveCSS('position', 'relative')
  const cards = page.locator('.redesign-feature')
  await expect(cards.nth(0)).toHaveCSS('top', '70px')
  await expect(cards.nth(1)).toHaveCSS('top', '80px')
  await expect(cards.nth(2)).toHaveCSS('top', '90px')
  for (const [progress, active] of [
    [30, 0],
    [50, 1],
    [70, 2],
  ] as const) {
    await page.locator('.redesign-feature-stack').evaluate((area, value) => {
      const rect = area.getBoundingClientRect()
      const top = rect.top + scrollY
      window.scrollTo({
        top: top - innerHeight + (value / 100) * (innerHeight + rect.height * 0.5),
        behavior: 'instant',
      })
    }, progress)
    await expect(cards.nth(active)).toHaveClass(/is-active/)
    await expect(cards.nth(active).locator('h3')).toHaveCSS('color', 'rgb(77, 114, 194)')
  }
})

test('all gallery cases, local images, English copy and accessible lightbox', async ({ page }) => {
  await page.goto('/assets/usecases-gallery/index.html')
  await expect(page.locator('.pill')).toHaveCount(5)
  let count = 0
  for (let cat = 0; cat < 5; cat++) {
    await page.locator('.pill').nth(cat).click()
    const total = await page.locator('.case-item').count()
    for (let index = 0; index < total; index++) {
      await page.locator(`.case-item[data-index="${index}"]`).click()
      await expect(page.locator(`.case-item[data-index="${index}"]`)).toHaveAttribute(
        'aria-selected',
        'true',
      )
      await expect(page.locator('.case-fade')).toHaveClass(/in/)
      await expect(page.locator('.msg-user')).not.toBeEmpty()
      await expect
        .poll(() =>
          page
            .locator('.media-block img')
            .evaluateAll((images) =>
              images.every(
                (image) =>
                  (image as HTMLImageElement).complete &&
                  (image as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBe(true)
      count++
    }
  }
  expect(count).toBe(16)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('#langSwitch')).toHaveCount(0)
  await page.locator('.media-block').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('.media-block').first()).toBeFocused()
})

for (const width of [390, 768, 1440]) {
  test(`public pages at ${width}px; no runtime errors or overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const route of [
      '/',
      '/features',
      '/use-cases',
      '/pricing',
      '/about',
      '/blog',
      '/contact',
      '/faqs',
      '/privacy',
      '/terms',
      '/links',
    ]) {
      const response = await page.goto(route)
      expect(response?.status(), route).toBe(200)
      if (route === '/terms' || route === '/privacy') {
        // The legal prototype uses tab labels, not an invented heading above the document.
        await expect(
          page.getByRole('tab', {
            name: route === '/privacy' ? 'Privacy' : 'Terms of Service',
            exact: true,
          }),
        ).toHaveAttribute('aria-selected', 'true')
      } else await expect(page.locator('h1').first()).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBe(width)
      if (route === '/') {
        const title = page.locator('.redesign-hero__title-main')
        expect(await title.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
      }
    }
    expect(errors).toEqual([])
  })
}

test('reduced motion leaves hero copy visible and still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.redesign-hero__content')).toHaveCSS('opacity', '1')
  await expect(page.locator('.redesign-hero__content')).toHaveCSS('animation-name', 'none')
})

test('mobile menu closes on navigation and About copy has contrast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  await page.locator('.mobile-nav__summary').click()
  await expect(page.locator('.mobile-nav__toggle')).toBeChecked()
  await page.locator('.mobile-nav__panel').getByRole('link', { name: 'About', exact: true }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('.mobile-nav__toggle')).not.toBeChecked()
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(59, 63, 67)')
})

test('gallery ignores stored language and cancels obsolete transitions', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('noumi-cookie-consent', JSON.stringify({ version: 3, locale: true }))
    localStorage.setItem('noumi-usecases-lang', 'zh')
  })
  await page.goto('/assets/usecases-gallery/index.html')
  await expect(page.locator('.pill')).toHaveCount(5)
  await expect(page.locator('#heroTitle')).toHaveText('What you can deliver with Noumi')
  await expect(page.locator('#langSwitch')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.locator('.case-item[data-index="1"]').click()
  await page.locator('.pill').last().click()
  await expect(page.locator('.case-fade')).toHaveClass(/in/)
  await expect(page.locator('.msg-user')).toContainText('FRD')
})
