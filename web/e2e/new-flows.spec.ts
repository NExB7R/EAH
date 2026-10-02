import { test, expect } from '@playwright/test'

test.describe('New flows', () => {
  test('notifications preferences redirects to auth', async ({ page }) => {
    await page.goto('/account/notifications/preferences')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('account referral redirects to auth', async ({ page }) => {
    await page.goto('/account/referral')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('admin notifications redirects to auth', async ({ page }) => {
    await page.goto('/admin/notifications')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('admin featured redirects to auth', async ({ page }) => {
    await page.goto('/admin/featured')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('admin studio redirects to auth', async ({ page }) => {
    await page.goto('/admin/studio')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('merchant offers redirects to auth', async ({ page }) => {
    await page.goto('/merchant/offers')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('merchant orders redirects to auth', async ({ page }) => {
    await page.goto('/merchant/orders')
    await expect(page).toHaveURL(/\/auth/)
  })

  test('track-contact rejects unauthenticated', async ({ request }) => {
    const res = await request.post('/api/track-contact', {
      data: { businessId: '00000000-0000-0000-0000-000000000000', method: 'phone' },
    })
    expect(res.status()).toBe(401)
  })

  test('push subscribe rejects unauthenticated', async ({ request }) => {
    const res = await request.post('/api/push/subscribe', {
      data: { endpoint: 'https://test.example', keys: { p256dh: 'x', auth: 'y' } },
    })
    expect(res.status()).toBe(401)
  })
})
