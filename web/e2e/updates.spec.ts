import { test, expect } from '@playwright/test'

test.describe('Updates page', () => {
  test('shows version badge and releases', async ({ page }) => {
    await page.goto('/updates', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('v1.0.0').first()).toBeVisible()
    await expect(page.getByText('v2.4.0').first()).toBeVisible()
  })
})
