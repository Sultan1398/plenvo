import { chromium, type FullConfig } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const AUTH_STATE_PATH = 'tests/e2e/.auth/user.json'

export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Missing E2E credentials. Please set E2E_TEST_EMAIL and E2E_TEST_PASSWORD before running Playwright.'
    )
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000'
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Comprehensive browser-side diagnostics during auth bootstrap.
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[Browser Console Error]: ${msg.text()}`)
  })
  page.on('pageerror', (exception) => {
    console.log(`[Uncaught Exception]: ${exception}`)
  })

  try {
    // Ensure auth directory exists before writing storage state.
    await mkdir(path.dirname(AUTH_STATE_PATH), { recursive: true })

    // Login through UI to generate real auth cookies/local storage.
    await page.goto(`${baseURL}/login`)
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /تسجيل الدخول|Sign In/i }).click()

    try {
      // Flexible post-login navigation: user may land on different routes by role/profile state.
      await page.waitForURL(/.*(overview|dashboard|outflow|onboarding|hub|admin).*/, { timeout: 15_000 })
    } catch (waitErr) {
      console.error('Global setup navigation timeout. Current URL:', page.url())
      const errorLocator = page.locator('.text-red-500, [role="alert"]')
      const errorVisible = await errorLocator.isVisible()
      if (errorVisible) {
        console.error('Auth Error UI:', await errorLocator.first().innerText())
      }
      throw waitErr
    }

    await page.context().storageState({ path: AUTH_STATE_PATH })
  } finally {
    await browser.close()
  }
}

