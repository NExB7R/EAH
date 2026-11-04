import { test, expect } from './fixtures'

test.describe('Published business discovery', () => {
  test('explore search returns a published business and its public page opens', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' })

    const firstBusiness = page.locator('a[href^="/businesses/"]').first()
    await expect(firstBusiness).toBeVisible()

    const href = await firstBusiness.getAttribute('href')
    if (!href) throw new Error('Published business card is missing its detail link')

    const businessName = (await firstBusiness.locator('h3').innerText()).trim()
    expect(businessName).not.toBe('')

    const search = page.getByRole('search').getByRole('searchbox', { name: 'البحث' })
    await search.fill(businessName)
    await search.press('Enter')
    await expect(page).toHaveURL(/\/explore\?q=/)

    const matchingResult = page.locator('a[href^="/businesses/"]').filter({ hasText: businessName }).first()
    await expect(matchingResult).toBeVisible()

    const resultHref = await matchingResult.getAttribute('href')
    if (!resultHref) throw new Error('Search result is missing its detail link')

    await page.goto(resultHref, { waitUntil: 'domcontentloaded' })
    const main = page.locator('main')
    await expect(main).toBeVisible()
    await expect(main.getByRole('heading', { name: businessName, exact: true }).first()).toBeVisible()
  })
})
