import { test, expect } from './fixtures'
import appPackage from '../package.json'

test.describe('Public version badge', () => {
  test('shows the current application version in the public footer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('footer').getByText(`v${appPackage.version}`, { exact: true })).toBeVisible()
  })
})
