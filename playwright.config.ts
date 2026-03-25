import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// تحميل متغيرات البيئة من .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
    },
  ],
})
