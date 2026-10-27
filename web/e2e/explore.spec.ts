import { test, expect } from '@playwright/test'

test.describe('Explore page', () => {
  test('loads search and at least one published activity card', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'networkidle' })
    await expect(page.locator('input[type="search"], input[name="q"]').first()).toBeVisible()

    const cards = page.locator('a[href^="/businesses/"]')
    await expect(cards.first()).toBeVisible()
    await expect(cards.first().locator('h3')).toBeVisible()
    await expect(cards.first()).toHaveAttribute('aria-label', /عرض تفاصيل نشاط/)
    await expect(cards.first().getByText(/مفتوح الآن|مغلق الآن/)).toBeVisible()
  })

  test('offers supermarket as a filter type', async ({ page }) => {
    await page.goto('/explore?filters=1', { waitUntil: 'networkidle' })

    const supermarketFilter = page.getByRole('button', { name: /ماركت/ })
    await expect(supermarketFilter).toBeVisible()
    await supermarketFilter.click()

    await expect(page).toHaveURL(/type=supermarket/)
  })

  test('opens the activity detail page from its card', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'networkidle' })

    const card = page.locator('a[href^="/businesses/"]').first()
    await expect(card).toBeVisible()
    await card.click()

    await expect(page).toHaveURL(/\/businesses\/[^/]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'معلومات' })).toBeVisible()
  })
})
