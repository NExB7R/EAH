import { test, expect } from './fixtures'

test.describe('Account loyalty page', () => {
  test('redirects to auth if not logged in', async ({ page }) => {
    await page.goto('/account/loyalty', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/auth/)
  })
})
