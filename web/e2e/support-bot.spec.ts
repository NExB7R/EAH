import { test, expect } from '@playwright/test'

test.describe('Support Bot', () => {
  test('rejects empty message', async ({ request }) => {
    const res = await request.post('/api/ai/support', { data: { message: '' } })
    expect(res.status()).toBe(400)
  })

  test('rejects oversized message', async ({ request }) => {
    const res = await request.post('/api/ai/support', {
      data: { message: 'x'.repeat(600) },
    })
    expect(res.status()).toBe(400)
  })

  test('appears on /help page', async ({ page }) => {
    await page.goto('/help')
    await expect(
      page.getByRole('heading', { name: 'محتاج مساعدة فورية؟', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'مساعد الدعم الفني', exact: true }),
    ).toBeVisible()
  })

  test('shows 4 suggestions', async ({ page }) => {
    await page.goto('/help')
    await expect(page.getByRole('button', { name: /إزاي أفعّل الإشعارات/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /نسيت كلمة السر/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /إيه فرق الباقات/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /إزاي أكسب نقاط/ })).toBeVisible()
  })

  test('has input field', async ({ page }) => {
    await page.goto('/help')
    const supportSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'محتاج مساعدة فورية؟', exact: true }) })
    await expect(supportSection.locator('textarea[placeholder="اكتب سؤالك…"]')).toBeVisible()
  })
})
