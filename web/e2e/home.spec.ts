import { test, expect } from './fixtures'

test.describe('Home page', () => {
  test('loads and shows hook', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText('شبيك لبيك')
  })


  test('nearby section uses the granted visitor location', async ({ page, context }) => {
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
    const origin = new URL(baseUrl).origin
    await context.grantPermissions(['geolocation'], { origin })
    await context.setGeolocation({ latitude: 30.323, longitude: 31.241 })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const nearbySection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'قريب منك' }) })
      .first()

    await expect(nearbySection).toBeVisible()
    await expect(nearbySection.getByText('أقرب الأنشطة ليك في نطاق 5 كم')).toBeVisible()
    await expect(nearbySection.getByRole('button', { name: 'استخدم موقعي' })).toHaveCount(0)
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
