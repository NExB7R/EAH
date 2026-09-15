// Sentry client — production only
if (process.env.NODE_ENV === 'production') {
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    })
  })

  // Next.js 16 router transition hook
  void import('@sentry/nextjs').then((Sentry) => {
    // @ts-expect-error — assigned for Next.js runtime
    window.__EAH_ROUTER_HOOK__ = Sentry.captureRouterTransitionStart
  })
}

export const onRouterTransitionStart =
  process.env.NODE_ENV === 'production'
    ? async (...args: unknown[]) => {
        const Sentry = await import('@sentry/nextjs')
        return Sentry.captureRouterTransitionStart(
          ...(args as Parameters<typeof Sentry.captureRouterTransitionStart>)
        )
      }
    : undefined
