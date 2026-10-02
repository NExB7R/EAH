import { test, expect } from '@playwright/test'

test.describe('Roadmap page', () => {
  test('loads with timeline', async ({ page }) => {
    await page.goto('/roadmap')
    await expect(page.locator('h1')).toBeVisible()
    const h2s = await page.locator('h2').allTextContents()
    expect(h2s.length).toBeGreaterThan(0)
  })
})
