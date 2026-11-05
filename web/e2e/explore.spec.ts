import { test, expect } from './fixtures'

test.describe('Explore page', () => {
  test('loads its discovery controls without assuming preloaded business data', async ({ page }) => {
    const response = await page.goto('/explore', { waitUntil: 'domcontentloaded' })

    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('input[type="search"], input[name="q"]').first()).toBeVisible()
  })
})
