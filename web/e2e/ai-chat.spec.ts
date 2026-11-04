import { test, expect } from './fixtures'

test.describe('AI Chat API', () => {
  test('rejects invalid body', async ({ request }) => {
    const res = await request.post('/api/ai/chat', { data: { message: '' } })
    expect(res.status()).toBe(400)
  })

  test('rejects oversized message', async ({ request }) => {
    const res = await request.post('/api/ai/chat', {
      data: { message: 'x'.repeat(600) },
    })
    expect(res.status()).toBe(400)
  })

  test('widget button appears', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /مساعد/i })).toBeVisible()
  })

  test('widget opens and shows welcome', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /مساعد/i }).click()
    await expect(page.getByText(/مساعد EAH/)).toBeVisible()
    await expect(page.getByText(/اسألني/)).toBeVisible()
  })

  test('suggestion click inserts message', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /مساعد/i }).click()
    await page.getByRole('button', { name: /مطعم بيتزا/ }).click()
    // الرسالة تظهر في المحادثة
    await expect(page.getByText('عايز مطعم بيتزا')).toBeVisible()
  })

  test('close button closes panel', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /مساعد/i }).click()
    await page.getByRole('button', { name: /إغلاق/i }).click()
    await expect(page.getByText(/اسألني/)).not.toBeVisible()
  })
})
