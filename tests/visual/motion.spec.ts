import { expect, test } from '@playwright/test'

test('reduced motion avoids downloading the hero video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const videos: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.mp4')) videos.push(request.url())
  })
  await page.goto('/')
  await expect(page.locator('.redesign-hero__video')).not.toHaveAttribute('src')
  await expect(page.locator('.noumi-eyes .pu').first()).toHaveCSS('animation-name', 'none')
  expect(videos).toEqual([])
})

test('client navigation keeps the homepage and shared chrome visible', async ({ page }) => {
  await page.goto('/')
  await page.locator('.site-nav__about').click()
  await expect(page).toHaveURL(/\/about$/)
  await page.locator('.site-header .brand').click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.redesign-hero__content')).toHaveCSS('opacity', '1')
  await expect(page.locator('.redesign-final-cta h2')).toHaveCSS('opacity', '1')
  await expect(page.locator('.site-nav__about .prototype-button-content')).toHaveCount(0)
})

test('reduced motion and disabled JavaScript never hide homepage content', async ({
  browser,
  baseURL,
}) => {
  for (const options of [{ reducedMotion: 'reduce' as const }, { javaScriptEnabled: false }]) {
    const context = await browser.newContext(options)
    const page = await context.newPage()
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' })
    for (const selector of [
      '.redesign-hero__content',
      '.redesign-section-heading',
      '.redesign-final-cta h2',
    ]) {
      await expect(page.locator(`${selector}:visible`)).toHaveCSS('opacity', '1')
      await expect(page.locator(`${selector}:visible`)).toHaveCSS('transform', 'none')
    }
    await expect(page.locator('.redesign-hero__video:visible')).toHaveAttribute('poster', /\.webp$/)
    await context.close()
  }
})

test('hero video can be started explicitly with reduced motion and hides its fallback button', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const video = page.locator('.redesign-hero__video:visible')
  await expect(video).not.toHaveAttribute('src')
  await page.getByRole('button', { name: 'Play background video' }).click()
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0),
    )
    .toBe(true)
  await expect(page.getByRole('button', { name: 'Play background video' })).toHaveCount(0)
})

test('hero automatically plays muted without a visible playback button', async ({ page }) => {
  await page.goto('/')
  const video = page.locator('.redesign-hero__video:visible')
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) => element.muted && !element.paused && element.currentTime > 0,
      ),
    )
    .toBe(true)
  await expect(page.locator('.hero-video-toggle')).toHaveCount(0)
})

test('hero can recover from an autoplay denial and hides the fallback after playback', async ({
  page,
}) => {
  const video = page.locator('.redesign-hero__video:visible')
  await page.addInitScript(() => {
    // Gate playback on an actual control click; automation can mark the page activated.
    let manuallyStarted = false
    document.addEventListener(
      'click',
      (event) => {
        if (event.target instanceof Element && event.target.closest('.hero-video-toggle')) {
          manuallyStarted = true
        }
      },
      true,
    )
    document.addEventListener(
      'play',
      (event) => {
        if (!manuallyStarted && event.target instanceof HTMLMediaElement) {
          event.target.pause()
        }
      },
      true,
    )
    const originalPlay = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      this.autoplay = false
      if (!manuallyStarted)
        return Promise.reject(new DOMException('Autoplay denied', 'NotAllowedError'))
      return originalPlay.call(this)
    }
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'Play background video' })).toBeVisible()
  await page.getByRole('button', { name: 'Play background video' }).click()
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0),
    )
    .toBe(true)
  await expect(page.locator('.hero-video-toggle')).toHaveCount(0)
})
