import { request as playwrightRequest, test as base, expect } from '@playwright/test'

const trustedToken = process.env.VERCEL_TRUSTED_OIDC_TOKEN
const targetUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const targetOrigin = new URL(targetUrl).origin
const trustedHeaders: Record<string, string> = trustedToken
  ? { 'x-vercel-trusted-oidc-idp-token': trustedToken }
  : {}

export const test = base.extend({
  page: async ({ page, context }, applyFixture) => {
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
            ...trustedHeaders,
          },
        })
      })
    }

    await applyFixture(page)
  },

  request: async ({}, applyFixture) => {
    const apiContext = await playwrightRequest.newContext({
      baseURL: targetOrigin,
      extraHTTPHeaders: trustedHeaders,
      // Never forward the trusted token to another origin through a redirect.
      maxRedirects: 0,
    })

    try {
      await applyFixture(apiContext)
    } finally {
      await apiContext.dispose()
    }
  },
})

export { expect }
