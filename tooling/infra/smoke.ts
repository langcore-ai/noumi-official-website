import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { localInfraDir, readManagedPort } from './shared'

const target = process.argv[2]
if (!['local', 'preview', 'staging'].includes(target))
  throw new Error('Specify local, preview or staging')
const origin =
  target === 'staging'
    ? 'https://staging.noumi.ai'
    : `http://localhost:${readManagedPort(target, target === 'local' ? 3000 : 8787)}`
const credentialTarget = target === 'staging' ? 'staging' : 'local'
const credentials = JSON.parse(
  readFileSync(join(localInfraDir, `${credentialTarget}.admin.json`), 'utf8'),
) as { email: string; password: string }
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
})
const context = await browser.newContext()
const page = await context.newPage()
let mediaId: number | undefined
let articleId: number | undefined
try {
  const response = await page.goto(origin, { waitUntil: 'networkidle', timeout: 60_000 })
  if (response.status() !== 200) throw new Error('Homepage failed')
  await page.screenshot({ path: join(localInfraDir, `${target}-homepage.png`), fullPage: false })
  if (await page.locator('script[src*="googletagmanager.com"]').count())
    throw new Error('Google Analytics must not load in test environments')
  const robots = await context.request.get(`${origin}/robots.txt`)
  if (!robots.ok() || !(await robots.text()).includes('Disallow: /'))
    throw new Error('Test robots must disallow indexing')
  await page.goto(`${origin}/admin/login`, { waitUntil: 'networkidle' })
  await page.locator('input[name="email"]').fill(credentials.email)
  await page.locator('input[name="password"]').fill(credentials.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname === '/admin', { timeout: 60_000 })
  console.log(`✓ ${target} browser homepage and CMS login`)
  const api = context.request
  const upload = await api.post(`${origin}/api/media?locale=en`, {
    multipart: {
      _payload: JSON.stringify({ alt: 'Environment smoke test' }),
      file: {
        name: `environment-smoke-${Date.now()}.png`,
        mimeType: 'image/png',
        buffer: readFileSync('public/favicon-96x96.png'),
      },
    },
  })
  if (!upload.ok()) throw new Error(`Upload failed ${upload.status()}: ${await upload.text()}`)
  const uploaded = await upload.json()
  mediaId = uploaded.doc.id
  const file = await api.get(new URL(uploaded.doc.url, origin).href)
  if (!file.ok()) throw new Error(`Uploaded file unavailable: ${file.status()}`)
  console.log(`✓ ${target} media upload and read`)
  const slug = `environment-smoke-${Date.now()}`
  const create = await api.post(`${origin}/api/blog-posts?locale=en`, {
    data: {
      slug,
      renderMode: 'markdown',
      markdownContent: '# Environment test\n\nTest-only content.',
      _status: 'published',
    },
  })
  if (!create.ok()) throw new Error(`Publish failed ${create.status()}: ${await create.text()}`)
  articleId = (await create.json()).doc.id
  const article = await api.get(`${origin}/blog/${slug}`)
  if (!article.ok() || !(await article.text()).includes('Test-only content'))
    throw new Error('Published article unavailable')
  const analytics = await api.get(`${origin}/api/site/analytics/config`)
  if ((await analytics.json()).enabled !== false) throw new Error('Analytics must be disabled')
  console.log(`✓ ${target} published article and analytics isolation`)
} finally {
  if (articleId) await context.request.delete(`${origin}/api/blog-posts/${articleId}`)
  if (mediaId) await context.request.delete(`${origin}/api/media/${mediaId}`)
  await browser.close()
}
