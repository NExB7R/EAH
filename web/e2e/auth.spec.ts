import { test, expect } from './fixtures'

test.describe('Auth page', () => {
  test('shows login and signup tabs', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'domcontentloaded' })
    // نستخدم .first() لأن النص ممكن يظهر في أكتر من مكان
    await expect(page.getByText('دخول').first()).toBeVisible()
    await expect(page.getByText('تسجيل').first()).toBeVisible()
  })
})
