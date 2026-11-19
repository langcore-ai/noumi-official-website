import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: process.stdin.isTTY && !process.env.CI ? 'on-failure' : 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox'],
          executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        },
      },
    },
  ],
  webServer: {
    command: 'bun run dev',
    // E2E 需要本地 D1 环境（env.local 的库）；顶层生产库在本地是空的。
    env: {
      CLOUDFLARE_ENV: 'local',
      NEXT_DEV_WRANGLER_ENV: 'local',
      OPEN_NEXT_LOCAL_BINDINGS: 'true',
      CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
    },
    reuseExistingServer: true,
    url: 'http://localhost:3000',
  },
})
