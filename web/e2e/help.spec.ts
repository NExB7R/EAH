import { test, expect } from '@playwright/test'

test.describe('Help page', () => {
  test('loads with sections and FAQs', async ({ page }) => {
    await page.goto('/help')
    const h2s = await page.locator('h2').allTextContents()
    expect(h2s.length).toBeGreaterThan(0)
    const details = await page.locator('details').count()
    expect(details).toBeGreaterThan(0)
  })
})
