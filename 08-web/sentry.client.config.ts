import * as Sentry from '@sentry/nextjs'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Failed to fetch',
      'NetworkError',
      'Load failed',
      'The operation was aborted',
    ],
    beforeSend(event) {
      // تجاهل أخطاء الـ CSP
      if (event.message?.includes('Content Security Policy')) return null
      return event
    },
  })
}
