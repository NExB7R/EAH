'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Health Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; affected: number } | { ok: false; error: string }

const idSchema = z.string().uuid()

export async function resolveError(id: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: 'معرّف غير صالح' }

  let svc: ReturnType<typeof createServiceClient>
  try {
    svc = createServiceClient()
  } catch {
    return { ok: false, error: 'خدمة سجل الأخطاء غير متاحة مؤقتًا' }
  }
  const { data, error } = await svc
    .from('system_errors')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', parsed.data)
    .is('resolved_at', null)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    return { ok: false, error: 'تعذر تحديث حالة الخطأ — حدّث الصفحة وحاول تاني' }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'health.resolve_error',
    entityType: 'system_error',
    metadata: { id: parsed.data },
  })

  revalidatePath('/admin/health')
  return { ok: true, affected: 1 }
}

export async function unresolveError(id: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: 'معرّف غير صالح' }

  let svc: ReturnType<typeof createServiceClient>
  try {
    svc = createServiceClient()
  } catch {
    return { ok: false, error: 'خدمة سجل الأخطاء غير متاحة مؤقتًا' }
  }
  const { data, error } = await svc
    .from('system_errors')
    .update({ resolved_at: null })
    .eq('id', parsed.data)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    return { ok: false, error: 'تعذر إعادة فتح الخطأ — حدّث الصفحة وحاول تاني' }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'health.unresolve_error',
    entityType: 'system_error',
    metadata: { id: parsed.data },
  })

  revalidatePath('/admin/health')
  return { ok: true, affected: 1 }
}

export async function resolveAllBySeverity(severity: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const valid = ['low', 'medium', 'high', 'critical']
  if (!valid.includes(severity)) return { ok: false, error: 'خطورة غير صالحة' }

  let svc: ReturnType<typeof createServiceClient>
  try {
    svc = createServiceClient()
  } catch {
    return { ok: false, error: 'خدمة سجل الأخطاء غير متاحة مؤقتًا' }
  }
  const { error, count } = await svc
    .from('system_errors')
    .update({ resolved_at: new Date().toISOString() }, { count: 'exact' })
    .eq('severity', severity)
    .is('resolved_at', null)

  if (error) return { ok: false, error: 'تعذر تحديث مجموعة الأخطاء — حاول تاني' }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'health.resolve_all_by_severity',
    entityType: 'system_error',
    metadata: { severity, count: count ?? 0 },
  })

  revalidatePath('/admin/health')
  return { ok: true, affected: count ?? 0 }
}
