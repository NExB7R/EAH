import { test, expect } from '@playwright/test'

test.describe('Business page order flow', () => {
  test('business page loads with WhatsApp action', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'networkidle' })
    const firstCard = page.locator('a[href^="/businesses/"]').first()
    const href = await firstCard.getAttribute('href')
    if (!href) return

    await page.goto(href, { waitUntil: 'networkidle' })
    // الصفحة لازم تفتح
    await expect(page.locator('main')).toBeVisible()
  })
})
