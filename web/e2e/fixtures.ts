import { request as playwrightRequest, test as base, expect } from '@playwright/test'

const trustedToken = process.env.VERCEL_TRUSTED_OIDC_TOKEN
const targetUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const target = new URL(targetUrl)
const targetOrigin = target.origin
const trustedHeaders: Record<string, string> = trustedToken
  ? { 'x-vercel-trusted-oidc-idp-token': trustedToken }
  : {}

const productionProjectRef = 'npmpiivmdksdirrumbmt'
const allowedProjectRef = process.env.EAH_QA_ALLOWED_PROJECT_REF?.trim()
const configuredSupabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

if (!['localhost', '127.0.0.1'].includes(target.hostname)) {
  throw new Error('EAH E2E refuses remote targets. Run the app locally against the isolated QA database.')
}
if (process.env.EAH_E2E_ALLOW_NONPROD !== 'yes') {
  throw new Error('Set EAH_E2E_ALLOW_NONPROD=yes only after confirming the isolated QA environment.')
}
if (!configuredSupabaseUrl || !allowedProjectRef) {
  throw new Error('EAH E2E requires SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and EAH_QA_ALLOWED_PROJECT_REF.')
}

let configuredProjectRef = ''
try {
  const supabaseUrl = new URL(configuredSupabaseUrl)
  if (supabaseUrl.protocol !== 'https:') throw new Error('HTTPS required')
  configuredProjectRef = supabaseUrl.hostname.split('.')[0] ?? ''
} catch {
  throw new Error('EAH E2E requires a valid HTTPS Supabase project URL.')
}

if (
  !configuredProjectRef ||
  configuredProjectRef === productionProjectRef ||
  configuredProjectRef !== allowedProjectRef
) {
  throw new Error('EAH E2E blocked: Supabase project must match the explicitly approved non-production project ref.')
}

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
