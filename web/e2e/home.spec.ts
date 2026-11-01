import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads and shows hook', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText('شبيك لبيك')
  })

  test('has no React #418', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => {
      if (e.message.includes('#418')) errors.push(e.message)
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(errors).toEqual([])
  })

  test('waits for a streamed section before scrolling to it', async ({ page }) => {
    await page.goto('/?scroll=late-test-section', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText('شبيك لبيك')
    await page.waitForTimeout(500)

    await page.evaluate(() => {
      window.setTimeout(() => {
        const section = document.createElement('section')
        section.id = 'late-test-section'
        section.style.height = '80px'
        section.style.marginTop = '1400px'
        section.textContent = 'Late section for scroll regression test'
        document.body.append(section)
      }, 250)
    })

    await expect.poll(() => page.evaluate(() => window.scrollY), {
      timeout: 3000,
      message: 'the chip scroll handler should scroll when the async section appears',
    }).toBeGreaterThan(100)
  })
})
