import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — System Error Logging
//   • server-side فقط (يستخدم service role)
//   • fire-and-forget — مينفعش يكسر التطبيق
//   • بيقصّ stack لـ 4000 حرف
// ═══════════════════════════════════════════════════════════

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorSource = 'server' | 'api' | 'cron' | 'client'

export type LogErrorInput = {
  severity: ErrorSeverity
  source: ErrorSource
  message: string
  path?: string
  stack?: string
  userId?: string
  metadata?: Record<string, unknown>
}

const MAX_STACK = 4000
const MAX_MESSAGE = 1000

export async function logError(input: LogErrorInput): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('system_errors').insert({
      severity: input.severity,
      source: input.source,
      message: input.message.slice(0, MAX_MESSAGE),
      path: input.path?.slice(0, 500) ?? null,
      stack: input.stack?.slice(0, MAX_STACK) ?? null,
      user_id: input.userId ?? null,
      metadata: input.metadata ?? {},
    })
  } catch {
    // فشل التسجيل مينفعش يكسر الطلب الأصلي
  }
}

// wrapper يلتقط الخطأ تلقائياً
export async function captureException(
  err: unknown,
  ctx: Omit<LogErrorInput, 'message' | 'stack'>,
): Promise<void> {
  const e = err instanceof Error ? err : new Error(String(err))
  await logError({
    ...ctx,
    message: e.message,
    stack: e.stack,
  })
}
