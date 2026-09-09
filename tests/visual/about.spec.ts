import { expect, test } from '@playwright/test'
const names = [
  'Abel zhai',
  'Billy Chi',
  'Arnold Hu',
  'Tao Yang',
  'Chunk Liao',
  'Grit Zhao',
  'Yoyo Wu',
  'Kun Jiang',
  'Ruini Zhang',
  'Huiling Pan',
]
const roles = [
  'CEO',
  'CTO',
  'COO',
  'Product Lead',
  'User Expert',
  'Product Hunt',
  'Product Manager',
  'Product Manager',
  'Product Lead',
  'Growth Lead',
]

test('About matches prototype content, all ten portraits and seven FAQ answers', async ({
  page,
}) => {
  await page.goto('/about.html')
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('[data-about-motion="hero"]:visible')).toHaveAttribute(
    'data-motion-state',
    'done',
  )
  await expect(page.locator('[data-about-prototype]')).toHaveCount(1)
  await expect(page.locator('[data-about-motion="hero"] .redesign-kicker__mark--left')).toHaveCSS(
    'width',
    '9px',
  )
  await expect(page.locator('h1')).toHaveText('We build tools for the people who know their Craft')
  expect(
    (await page.locator('[data-about-motion="hero"] .redesign-kicker__mark--left').boundingBox())
      ?.width,
  ).toBe(9)
  await expect(page.locator('[data-about-team] article')).toHaveCount(10)
  await expect(page.locator('[data-about-team] h3')).toHaveText(names)
  await expect(page.locator('[data-about-team] article p')).toHaveText(roles)
  for (const portrait of await page.locator('[data-about-team] img').all()) {
    await portrait.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true)
  }
  await expect(page.locator('main')).not.toContainText('The problem no one was solving')
  await expect(page.locator('[data-about-faq]')).toHaveCount(7)
  for (let index = 0; index < 7; index++) {
    const faq = page.locator(`[data-about-faq="${index}"]`)
    await faq.locator('summary').click()
    await expect(faq).toHaveAttribute('open', '')
    await expect(faq.locator('[data-answer]')).toBeVisible()
    await faq.locator('summary').click()
    await expect(faq).not.toHaveAttribute('open', '')
  }
})

test('About grid follows desktop and phone layouts; portrait reveal is independent', async ({
  page,
}) => {
  await page.goto('/about')
  await expect(page.locator('[data-about-motion="hero"]:visible')).toHaveAttribute(
    'data-motion-state',
    'done',
  )
  await expect(page.locator('[data-about-prototype]')).toHaveCount(1)
  const grid = page.locator('[data-about-team]')
  await expect(page.locator('h1')).toHaveCSS('font-size', '38px')
  await expect(page.locator('h1')).toHaveCSS('color', 'rgb(59, 63, 67)')
  expect(Math.abs((await page.locator('h1').boundingBox())!.y - 282.8)).toBeLessThan(2)
  expect(
    await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
  ).toBe(5)
  await expect(page.locator('[data-about-motion="hero"]')).toHaveAttribute(
    'data-motion-state',
    'done',
  )
  await grid.scrollIntoViewIfNeeded()
  const portrait = page.locator('[data-about-motion="portrait"]').first()
  await expect(portrait).toHaveAttribute('data-motion-state', 'done')
  await expect(portrait).toHaveCSS('transform', 'none')
  await page.setViewportSize({ width: 390, height: 900 })
  expect(
    await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
  ).toBe(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})

test('About FAQ supports keyboard and its native markup works without JavaScript', async ({
  browser,
  page,
}) => {
  await page.goto('/about')
  await expect(page.locator('[data-about-motion="hero"]:visible')).toHaveAttribute(
    'data-motion-state',
    'done',
  )
  await expect(page.locator('[data-about-prototype]')).toHaveCount(1)
  const first = page.locator('[data-about-faq="0"]')
  await first.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(first).toHaveAttribute('open', '')
  await page.keyboard.press('Enter')
  await expect(first).not.toHaveAttribute('open', '')
  const context = await browser.newContext({ javaScriptEnabled: false })
  const plain = await context.newPage()
  // Isolate the native disclosure fallback from Next's JS-dependent streaming shell.
  await plain.setContent(await first.evaluate((el) => el.outerHTML))
  await plain.locator('[data-about-faq="0"] summary').click()
  await expect(plain.locator('[data-about-faq="0"] [data-answer]')).toBeVisible()
  await context.close()
})
