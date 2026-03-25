import { test, expect } from '@playwright/test'

/**
 * These tests are intentionally read-only:
 * - No signup/login submissions
 * - No password changes
 * - Only navigation + UI assertions
 * This keeps the suite isolated from production data mutations.
 */

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Auth Recovery Safety Net', () => {
  test('invalid callback code redirects to login with translated recovery error', async ({ page }) => {
    await page.goto('/auth/callback?next=/reset-password')

    await expect(page).toHaveURL(/\/login\?error=Invalid_recovery_code/)

    // Login page should surface a clear recovery-link error (Arabic or English)
    await expect(
      page.getByText(
        /رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية|Password recovery link is invalid or expired/i
      )
    ).toBeVisible()
  })

  test('direct reset-password access without recovery session is blocked gracefully', async ({ page }) => {
    await page.goto('/reset-password')

    // Reset page should detect missing recovery session and show translated error
    await expect(
      page.getByText(
        /الرابط غير صالح أو منتهي الصلاحية\. الرجاء طلب رابط جديد\.|The link is invalid or expired\. Please request a new one\./i
      )
    ).toBeVisible()

    // Save button must stay disabled without a valid recovery session
    const submitButton = page.getByRole('button', {
      name: /حفظ كلمة المرور الجديدة|Save new password/i,
    })
    await expect(submitButton).toBeDisabled()
  })
})
