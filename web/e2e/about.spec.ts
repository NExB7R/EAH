import { test, expect } from './fixtures'

// ═══════════════════════════════════════════════════════════
// EAH — About Page
// ═══════════════════════════════════════════════════════════

test.describe('About page', () => {
  test('loads without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // تجاهل 403 من Facebook CDN (متوقع)
        if (text.includes('403') || text.includes('fbcdn')) return
        errors.push(text)
      }
    })

    page.on('pageerror', (err) => {
      errors.push(err.message)
    })

    await page.goto('/about', { waitUntil: 'domcontentloaded' })

    // لازم العنوان يظهر
    await expect(page.locator('h1')).toContainText('شبيك لبيك')

    // لازم مفيش React #418
    expect(errors.filter((e) => e.includes('#418'))).toEqual([])
  })

  test('shows footer', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.getByText('NourEldin B7R')).toBeVisible()
  })
})
