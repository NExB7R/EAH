import { test, expect } from './fixtures'

test.describe('Published business discovery (isolated QA data)', () => {
  test('search finds the published QA activity and never returns the QA draft', async ({ page }) => {
    const publishedSlug = process.env.EAH_E2E_PUBLISHED_BUSINESS_SLUG?.trim()
    const draftName = process.env.EAH_E2E_DRAFT_BUSINESS_NAME?.trim()

    expect(publishedSlug, 'Set EAH_E2E_PUBLISHED_BUSINESS_SLUG to a published QA fixture slug.').toMatch(
      /^eah-qa-test-[a-z0-9-]+$/,
    )
    expect(draftName, 'Set EAH_E2E_DRAFT_BUSINESS_NAME to the exact name of an unpublished QA fixture.').toBeTruthy()

    await page.goto(`/businesses/${publishedSlug}`, { waitUntil: 'domcontentloaded' })
    const publishedPage = page.locator('main')
    await expect(publishedPage).toBeVisible()
    const businessName = (await publishedPage.locator('h1').first().innerText()).trim()
    expect(businessName).not.toBe('')

    await page.goto('/explore', { waitUntil: 'domcontentloaded' })
    const search = page.getByRole('search').getByRole('searchbox', { name: 'البحث' })
    await search.fill(businessName)
    await search.press('Enter')
    await expect(page).toHaveURL(/\/explore\?q=/)

    const matchingResult = page.locator(`a[href="/businesses/${publishedSlug}"]`).first()
    await expect(matchingResult).toBeVisible()

    await search.fill(draftName!)
    await search.press('Enter')
    await expect(page).toHaveURL(/\/explore\?q=/)
    await expect(page.locator('a[href^="/businesses/"]')).toHaveCount(0)
  })
})
