import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads and shows hook', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText('شبيك لبيك')
  })

  test('has no React #418', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => {
      if (e.message.includes('#418')) errors.push(e.message)
    })
    await page.goto('/', { waitUntil: 'networkidle' })
    expect(errors).toEqual([])
  })
})
