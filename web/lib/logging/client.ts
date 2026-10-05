// ═══════════════════════════════════════════════════════════
// EAH — Client-side error reporter
//   • fire-and-forget (مش بيعطّل الـ UI)
//   • يستخدم fetch مع keepalive
// ═══════════════════════════════════════════════════════════

type ReportInput = {
  message: string
  stack?: string
  path?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export function reportError(input: ReportInput): void {
  if (typeof window === 'undefined') return
  try {
    const body = JSON.stringify({
      message: input.message,
      stack: input.stack,
      path: input.path ?? window.location.pathname,
      severity: input.severity ?? 'medium',
    })
    void fetch('/api/log-error', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // فشل الإرسال — مش مشكلة
    })
  } catch {
    // ignore
  }
}
