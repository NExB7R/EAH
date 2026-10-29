'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit'
import { parseCairoLocalDateTime } from '@/lib/utils/timezone'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Ads Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; id?: string } | { ok: false; error: string }

const idSchema = z.string().uuid('معرّف الإعلان غير صحيح')
const optionalLocalDate = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || parseCairoLocalDateTime(value) !== null, {
    message: 'صيغة التاريخ غير صحيحة',
  })

const approveSchema = z
  .object({
    startsAt: optionalLocalDate,
    endsAt: optionalLocalDate,
  })
  .refine(
    ({ startsAt, endsAt }) => {
      if (!endsAt) return true
      const end = parseCairoLocalDateTime(endsAt)?.getTime()
      const start = startsAt
        ? parseCairoLocalDateTime(startsAt)?.getTime()
        : Date.now()
      return end !== undefined && start !== undefined && end > start
    },
    { message: 'موعد الانتهاء لازم يكون بعد بداية الإعلان' },
  )

async function getModerationContext() {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const limit = await checkRateLimit(apiLimiter, `admin-ads:${ctx.userId}`, {
    failClosed: true,
  })
  if (!limit.ok) return { ok: false as const, error: limit.error }

  return { ok: true as const, ctx }
}

function invalidTransition(): Result {
  return {
    ok: false,
    error: 'حالة الإعلان اتغيرت أو الإعلان مش موجود. حدّث القائمة وحاول تاني.',
  }
}

async function finishModeration(id: string, action: string, metadata?: Record<string, unknown>) {
  const ctx = await requireAdmin()
  if (!ctx.ok) return

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action,
    entityType: 'advertisement',
    entityId: id,
    metadata,
  })
}

export async function approveAd(id: string, formData: FormData): Promise<Result> {
  const auth = await getModerationContext()
  if (!auth.ok) return { ok: false, error: auth.error }

  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإعلان غير صحيح' }

  const parsed = approveSchema.safeParse({
    startsAt: String(formData.get('startsAt') ?? '').trim(),
    endsAt: String(formData.get('endsAt') ?? '').trim(),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }

  const now = new Date()
  const start = parsed.data.startsAt
    ? parseCairoLocalDateTime(parsed.data.startsAt)
    : now
  const end = parsed.data.endsAt ? parseCairoLocalDateTime(parsed.data.endsAt) : null
  if (!start || (parsed.data.endsAt && !end) || (end && end <= start)) {
    return { ok: false, error: 'تأكد من صحة موعد بداية الإعلان ونهايته' }
  }

  const { data: updated, error } = await auth.ctx.supabase
    .from('ads')
    .update({
      status: 'active',
      starts_at: start.toISOString(),
      ends_at: end?.toISOString() ?? null,
      rejected_reason: null,
    })
    .eq('id', parsedId.data)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر حفظ الموافقة. راجع الصلاحيات وحاول تاني.' }
  if (!updated) return invalidTransition()

  await finishModeration(updated.id, 'ad.approve', {
    starts_at: start.toISOString(),
    ends_at: end?.toISOString() ?? null,
  })

  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id: updated.id }
}

export async function rejectAd(id: string, reason: string): Promise<Result> {
  const auth = await getModerationContext()
  if (!auth.ok) return { ok: false, error: auth.error }

  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإعلان غير صحيح' }
  const parsedReason = z.string().trim().max(300, 'سبب الرفض طويل').safeParse(reason)
  if (!parsedReason.success) return { ok: false, error: parsedReason.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  const cleanReason = parsedReason.data || 'بدون سبب محدد'

  const { data: updated, error } = await auth.ctx.supabase
    .from('ads')
    .update({ status: 'rejected', rejected_reason: cleanReason })
    .eq('id', parsedId.data)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر حفظ الرفض. راجع الصلاحيات وحاول تاني.' }
  if (!updated) return invalidTransition()

  await finishModeration(updated.id, 'ad.reject', { reason: cleanReason })
  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id: updated.id }
}

export async function pauseAd(id: string): Promise<Result> {
  const auth = await getModerationContext()
  if (!auth.ok) return { ok: false, error: auth.error }
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإعلان غير صحيح' }

  const { data: updated, error } = await auth.ctx.supabase
    .from('ads')
    .update({ status: 'paused' })
    .eq('id', parsedId.data)
    .eq('status', 'active')
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر إيقاف الإعلان. حاول تاني.' }
  if (!updated) return invalidTransition()
  await finishModeration(updated.id, 'ad.pause')
  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id: updated.id }
}

export async function resumeAd(id: string): Promise<Result> {
  const auth = await getModerationContext()
  if (!auth.ok) return { ok: false, error: auth.error }
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإعلان غير صحيح' }

  const { data: updated, error } = await auth.ctx.supabase
    .from('ads')
    .update({ status: 'active' })
    .eq('id', parsedId.data)
    .eq('status', 'paused')
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر استئناف الإعلان. حاول تاني.' }
  if (!updated) return invalidTransition()
  await finishModeration(updated.id, 'ad.resume')
  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id: updated.id }
}

export async function deleteAd(id: string): Promise<Result> {
  const auth = await getModerationContext()
  if (!auth.ok) return { ok: false, error: auth.error }
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإعلان غير صحيح' }

  const { data: deleted, error } = await auth.ctx.supabase
    .from('ads')
    .delete()
    .eq('id', parsedId.data)
    .in('status', ['rejected', 'expired'])
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر حذف الإعلان. حاول تاني.' }
  if (!deleted) return invalidTransition()
  await finishModeration(deleted.id, 'ad.delete')
  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id: deleted.id }
}
