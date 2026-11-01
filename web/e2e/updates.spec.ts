import { test, expect } from '@playwright/test'

test.describe('Public version badge', () => {
  test('shows the current application version in the public footer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('footer').getByText('v1.0.0', { exact: true })).toBeVisible()
  })
})
