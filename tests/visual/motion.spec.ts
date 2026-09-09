import { expect, test } from '@playwright/test'

test('prototype entrance bindings retain exact timing and keyframes', async ({ page }) => {
  await page.goto('/')
  const heading = page.locator('.redesign-final-cta h2')
  await expect(heading).toHaveAttribute('data-motion-state', 'pending')
  const motion = await heading.evaluate((element) => {
    const effect = element.getAnimations()[0].effect as KeyframeEffect
    return { timing: effect.getTiming(), frames: effect.getKeyframes() }
  })
  expect(motion.timing.duration).toBe(1000)
  expect(motion.timing.delay).toBe(450)
  expect(motion.frames[0].transform).toBe('translateY(100px)')
  expect(motion.frames[0].opacity).toBe('0')
  await page.locator('.redesign-final-cta').scrollIntoViewIfNeeded()
  await expect(heading).toHaveAttribute('data-motion-state', 'done')
  await expect(heading).toHaveCSS('opacity', '1')
  await page.evaluate(() => scrollTo(0, 0))
  await page.locator('.redesign-final-cta').scrollIntoViewIfNeeded()
  await expect(heading).toHaveAttribute('data-motion-state', 'done')
  expect(await heading.evaluate((element) => element.getAnimations().length)).toBe(0)
})

test('subtitle arrows expand from the center; footer enters with staggered delays', async ({
  page,
}) => {
  await page.goto('/')
  const marker = page.locator('.redesign-use-cases .redesign-kicker__mark--left')
  await expect(marker).toHaveAttribute('data-motion-state', 'pending')
  expect(
    await marker.evaluate((el) => {
      const effect = el.getAnimations()[0].effect as KeyframeEffect
      return {
        delay: effect.getTiming().delay,
        duration: effect.getTiming().duration,
        from: effect.getKeyframes()[0].transform,
      }
    }),
  ).toEqual({ delay: 500, duration: 600, from: 'translateX(30px)' })
  const columns = page.locator('.site-footer .footer-grid > div')
  await expect(columns.first()).toHaveAttribute('data-motion-state', 'pending')
  expect(
    await columns.evaluateAll((elements) =>
      elements.map((el) => el.getAnimations()[0].effect?.getTiming().delay),
    ),
  ).toEqual([350, 450, 550, 650])
  await page.locator('.redesign-use-cases__header').scrollIntoViewIfNeeded()
  await expect(marker).toHaveAttribute('data-motion-state', 'done')
  await expect(marker).toHaveCSS('transform', 'none')
})

test('button swaps arrows horizontally and keyboard focus also activates it', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('.site-nav__about')
  const label = button.locator('.prototype-button-label')
  expect(
    await button.locator('.prototype-button-content').evaluate((el) => {
      const arrow = el.querySelector('.prototype-button-arrow')!.getBoundingClientRect()
      return arrow.right <= el.getBoundingClientRect().right
    }),
  ).toBe(true)
  await button.hover()
  await expect(label).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 40, 0)')
  await page.mouse.move(0, 0)
  await expect(label).toHaveCSS('transform', 'none')
  await page.keyboard.press('Tab')
  await button.focus()
  await expect(label).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 40, 0)')
})

test('client navigation cleans up and reinitializes homepage motion', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.redesign-hero__content')).toHaveAttribute('data-motion-state', 'done')
  await page.locator('.site-nav__about').click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('[data-motion-event]')).toHaveCount(0)
  await page.locator('.site-header .brand').click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.redesign-hero__content')).toHaveAttribute('data-motion-state', 'done')
  await expect(page.locator('.redesign-final-cta h2')).toHaveAttribute(
    'data-motion-state',
    'pending',
  )
})

test('reduced motion and disabled JavaScript never hide homepage content', async ({ browser }) => {
  for (const options of [{ reducedMotion: 'reduce' as const }, { javaScriptEnabled: false }]) {
    const context = await browser.newContext(options)
    const page = await context.newPage()
    await page.goto(test.info().project.use.baseURL as string)
    for (const selector of [
      '.redesign-hero__content',
      '.redesign-section-heading',
      '.redesign-final-cta h2',
    ]) {
      await expect(page.locator(selector)).toHaveCSS('opacity', '1')
      await expect(page.locator(selector)).toHaveCSS('transform', 'none')
    }
    await context.close()
  }
})
