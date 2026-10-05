'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Moderation Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

// ─── موافقة على تقييم ───

export async function approveReview(reviewId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('business_reviews')
    .update({
      status: 'approved',
      flagged_reason: null,
      moderated_by: ctx.userId,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'review.approve',
    entityType: 'business_review',
    entityId: reviewId,
  })

  revalidatePath('/admin/moderation')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── رفض تقييم ───

const rejectSchema = z.object({
  reason: z.string().min(3, 'السبب قصير').max(200),
})

export async function rejectReview(reviewId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = rejectSchema.safeParse({
    reason: String(formData.get('reason') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  // جيب المستخدم صاحب التقييم
  const { data: review } = await ctx.supabase
    .from('business_reviews')
    .select('user_id, business_id')
    .eq('id', reviewId)
    .maybeSingle()

  const { error } = await ctx.supabase
    .from('business_reviews')
    .update({
      status: 'rejected',
      flagged_reason: parsed.data.reason,
      moderated_by: ctx.userId,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)

  if (error) return { ok: false, error: error.message }

  // إشعار للمستخدم
  if (review?.user_id) {
    await createNotification({
      userId: review.user_id,
      type: 'admin',
      title: 'تقييمك اترفض',
      body: `السبب: ${parsed.data.reason}`,
      deepLink: '/account',
    })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'review.reject',
    entityType: 'business_review',
    entityId: reviewId,
    metadata: { reason: parsed.data.reason },
  })

  revalidatePath('/admin/moderation')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── حذف تقييم نهائياً ───

export async function deleteReview(reviewId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase.from('business_reviews').delete().eq('id', reviewId)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'review.delete',
    entityType: 'business_review',
    entityId: reviewId,
  })

  revalidatePath('/admin/moderation')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}
