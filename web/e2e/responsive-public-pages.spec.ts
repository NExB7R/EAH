import { test, expect } from '@playwright/test'

const WIDTHS = [320, 360, 375, 390, 414, 430] as const
const PAGES = [
  { path: '/contact', label: 'contact' },
  { path: '/explore', label: 'explore' },
] as const

test.describe('Mobile-first public surfaces', () => {
  for (const pageCase of PAGES) {
    for (const width of WIDTHS) {
      test(`${pageCase.label} has no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(pageCase.path, { waitUntil: 'domcontentloaded' })
        await expect(page.locator('main')).toBeVisible()

        const dimensions = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth
          const selectors = [
            'main',
            '[class*="capsule"] [class*="inner"]',
            'main [class*="container"]',
            'main [class*="grid"]',
          ]

          return selectors.flatMap((selector) =>
            Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => ({
              selector,
              viewport,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              left: element.getBoundingClientRect().left,
              right: element.getBoundingClientRect().right,
            })),
          )
        })

        for (const item of dimensions) {
          expect(
            item.scrollWidth,
            `${pageCase.path} ${item.selector} scrollWidth at ${width}px`,
          ).toBeLessThanOrEqual(item.clientWidth + 1)
          expect(
            item.left,
            `${pageCase.path} ${item.selector} left edge at ${width}px`,
          ).toBeGreaterThanOrEqual(-1)
          expect(
            item.right,
            `${pageCase.path} ${item.selector} right edge at ${width}px`,
          ).toBeLessThanOrEqual(item.viewport + 1)
        }
      })
    }
  }

  test('official contact cards only link to approved HTTPS providers', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/contact', { waitUntil: 'domcontentloaded' })

    const hrefs = await page.locator('main a[target="_blank"]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    )

    for (const href of hrefs) {
      const url = new URL(href)
      expect(url.protocol).toBe('https:')
      expect(
        ['wa.me', 'whatsapp.com', 'facebook.com', 'fb.com'].some(
          (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
        ),
        `unexpected official contact URL host: ${url.hostname}`,
      ).toBe(true)
    }
  })
})
