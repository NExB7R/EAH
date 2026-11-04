import { test as base, expect } from '@playwright/test'

const trustedToken = process.env.VERCEL_TRUSTED_OIDC_TOKEN
const targetUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const targetOrigin = new URL(targetUrl).origin

export const test = base.extend({
  page: async ({ page, context }, use) => {
    if (trustedToken) {
      await context.route('**/*', async (route) => {
        let requestOrigin: string

        try {
          requestOrigin = new URL(route.request().url()).origin
        } catch {
          await route.continue()
          return
        }

        if (requestOrigin !== targetOrigin) {
          await route.continue()
          return
        }

        const headers = await route.request().allHeaders()
        await route.continue({
          headers: {
            ...headers,
            'x-vercel-trusted-oidc-idp-token': trustedToken,
          },
        })
      })
    }

    await use(page)
  },
})

export { expect }
