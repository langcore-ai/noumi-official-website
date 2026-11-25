import { expect, test } from '@playwright/test'
const names = [
  'Abel Zhai',
  'Billy Chi',
  'Arnold Hu',
  'Tao Yang',
  'Chuck Liao',
  'Grit Zhao',
  'Kun Jiang',
  'Ruini Zhang',
  'Huiling Pan',
]
const roles = [
  'CEO',
  'CTO',
  'COO',
  'Product Lead',
  'Principal Solutions Advisor',
  'Head of User Strategy',
  'Product Manager',
  'Product Manager',
  'Growth Lead',
]

test('About displays all nine team profiles and seven FAQ answers', async ({ page }) => {
  await page.goto('/about.html')
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('[data-about-prototype]')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText('We build tools for the people who know their Craft')
  const team = page.getByRole('region', { name: 'Meet the team' })
  await expect(team.getByRole('heading', { name: 'Meet the team', level: 2 })).toBeVisible()
  await expect(page.locator('[data-about-team] article')).toHaveCount(9)
  await expect(page.locator('[data-about-team] h3')).toHaveText(names)
  await expect(page.locator('[data-about-team] article p')).toHaveText(roles)
  const chuck = team.getByRole('article').filter({ hasText: 'Chuck Liao' })
  await expect(chuck.getByRole('link')).toHaveAttribute('href', /linkedin\.com\/in\/chuck-liao-/)
  const grit = team.getByRole('article').filter({ hasText: 'Grit Zhao' })
  await expect(grit.getByRole('link')).toHaveCount(0)
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

test('About team anchor and grid work on desktop and phone', async ({ page }) => {
  await page.goto('/about#team')
  await expect(page.locator('[data-about-prototype]')).toHaveCount(1)
  const heading = page.getByRole('heading', { name: 'Meet the team' })
  await expect(heading).toBeInViewport()
  const grid = page.locator('[data-about-team]')
  expect(
    await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
  ).toBe(4)
  const portrait = grid.getByRole('img').first()
  const desktop = await portrait.boundingBox()
  expect(desktop!.width / desktop!.height).toBeCloseTo(4 / 3)
  await page.setViewportSize({ width: 390, height: 900 })
  expect(
    await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length),
  ).toBe(2)
  const phone = await portrait.boundingBox()
  expect(phone!.width / phone!.height).toBeCloseTo(4 / 3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})

test('About FAQ supports keyboard and its native markup works without JavaScript', async ({
  browser,
  page,
}) => {
  await page.goto('/about')
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
