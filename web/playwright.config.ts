import { defineConfig, devices } from '@playwright/test'

// ═══════════════════════════════════════════════════════════
// EAH — Playwright Config
// يستخدم Chrome المثبت على الجهاز (بدون تحميل Chromium)
// ═══════════════════════════════════════════════════════════

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const VERCEL_BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    ...(VERCEL_BYPASS_SECRET
      ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': VERCEL_BYPASS_SECRET } }
      : {}),
    // A Vercel protection bypass is a credential. Do not persist it in Playwright
    // traces or upload it as part of failure artifacts.
    trace: VERCEL_BYPASS_SECRET ? 'off' : 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],

  webServer: process.env.PLAYWRIGHT_SKIP_SERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
