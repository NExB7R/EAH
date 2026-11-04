import { test, expect } from './fixtures'
import appPackage from '../package.json'

test.describe('Public version badge', () => {
  test('shows the current application version in the public footer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const versionBadge = page.locator('footer').getByText(`v${appPackage.version}`, { exact: true })
    await expect(versionBadge).toBeVisible()
    await expect(versionBadge).toHaveAttribute('aria-label', `إصدار المنصة v${appPackage.version}`)
  })
})
