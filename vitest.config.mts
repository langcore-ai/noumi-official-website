import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  resolve: {
    alias: [
      // The worker entry is generated after this test gate in Cloudflare Builds.
      {
        find: /^.*\/\.open-next\/worker\.js$/,
        replacement: new URL('./tests/fixtures/open-next-worker.ts', import.meta.url).pathname,
      },
      {
        find: 'server-only',
        replacement: new URL(
          './node_modules/next/dist/compiled/server-only/empty.js',
          import.meta.url,
        ).pathname,
      },
    ],
  },
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'https://noumi.test' } },
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'tests/int/**/*.int.spec.tsx'],
  },
})
