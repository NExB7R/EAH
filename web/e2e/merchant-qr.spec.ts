import { test, expect } from './fixtures'

test.describe('Merchant QR page', () => {
  test('redirects to auth if not logged in', async ({ page }) => {
    await page.goto('/merchant/qr', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/auth/)
  })
})
