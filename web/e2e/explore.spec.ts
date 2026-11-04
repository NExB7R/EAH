import { test, expect } from './fixtures'

test.describe('Explore page', () => {
  test('loads with search and businesses', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="search"], input[name="q"]').first()).toBeVisible()
    // لازم يكون فيه على الأقل كارت واحد
    const links = page.locator('a[href^="/businesses/"]')
    expect(await links.count()).toBeGreaterThan(0)
  })
})
