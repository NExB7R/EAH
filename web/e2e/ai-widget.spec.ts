import { test, expect } from './fixtures'

test.describe('AI Widget', () => {
  test('floating button is visible', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByRole('button', { name: /مساعد/i })
    await expect(fab).toBeVisible()
  })

  test('widget opens and shows suggestions', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /مساعد/i }).click()
    await expect(page.getByText(/مساعد EAH/)).toBeVisible()
    await expect(page.getByText(/اسألني أي حاجة/)).toBeVisible()
  })

  test('API rejects empty message', async ({ request }) => {
    const res = await request.post('/api/ai/chat', {
      data: { message: '' },
    })
    expect(res.status()).toBe(400)
  })
})
