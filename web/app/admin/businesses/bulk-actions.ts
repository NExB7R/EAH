'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Business Bulk Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; affected: number } | { ok: false; error: string }

const idsSchema = z.array(z.string().uuid()).min(1).max(100)

// ─── موافقة جماعية ───
export async function bulkApproveBusinesses(ids: string[]): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'قائمة غير صالحة' }

  const { data: businesses, error: lookupError } = await ctx.supabase
    .from('businesses')
    .select('id, name, slug, owner_profile_id, business_type_status')
    .in('id', parsed.data)

  if (lookupError) return { ok: false, error: 'تعذر تحميل الأنشطة المحددة — حاول تاني' }
  const selectedBusinesses = businesses ?? []
  if (selectedBusinesses.length !== parsed.data.length) {
    return { ok: false, error: 'بعض الأنشطة المحددة غير موجود أو غير متاح للمراجعة' }
  }
  const blockedType = selectedBusinesses.find(
    (business) => business.business_type_status === 'pending' || business.business_type_status === 'rejected',
  )
  if (blockedType) {
    return {
      ok: false,
      error: 'فيه نشاط نوعه المخصص لسه محتاج قرار. راجع «أنواع الأنشطة الجديدة» الأول، وبعد الموافقة انشره.',
    }
  }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      is_published: true,
      rejection_reason: null,
      rejected_at: null,
      rejected_by: null,
    })
    .in('id', parsed.data)

  if (error) return { ok: false, error: error.message }

  // إشعارات أصحاب الأنشطة
  for (const biz of businesses ?? []) {
    if (biz.owner_profile_id) {
      await createNotification({
        userId: biz.owner_profile_id,
        type: 'admin',
        title: 'تم قبول نشاطك ✓',
        body: `نشاط "${biz.name}" اتنشر`,
        deepLink: `/businesses/${biz.slug}`,
      })
    }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.bulk_approve',
    entityType: 'business',
    metadata: { ids: parsed.data, count: parsed.data.length },
  })

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true, affected: businesses?.length ?? 0 }
}

// ─── رفض جماعي ───
const bulkRejectSchema = z.object({
  ids: idsSchema,
  reason: z.string().min(5, 'السبب قصير').max(300),
})

export async function bulkRejectBusinesses(ids: string[], reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = bulkRejectSchema.safeParse({ ids, reason: reason.trim() })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const { data: businesses } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id')
    .in('id', parsed.data.ids)

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      is_published: false,
      rejection_reason: parsed.data.reason,
      rejected_at: new Date().toISOString(),
      rejected_by: ctx.userId,
    })
    .in('id', parsed.data.ids)

  if (error) return { ok: false, error: error.message }

  for (const biz of businesses ?? []) {
    if (biz.owner_profile_id) {
      await createNotification({
        userId: biz.owner_profile_id,
        type: 'admin',
        title: 'نشاطك محتاج تعديل',
        body: `السبب: ${parsed.data.reason}`,
        deepLink: '/merchant/business',
      })
    }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.bulk_reject',
    entityType: 'business',
    metadata: { ids: parsed.data.ids, reason: parsed.data.reason },
  })

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  return { ok: true, affected: businesses?.length ?? 0 }
}

// ─── أرشفة جماعية ───
export async function bulkArchiveBusinesses(ids: string[]): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'قائمة غير صالحة' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({ is_published: false })
    .in('id', parsed.data)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.bulk_archive',
    entityType: 'business',
    metadata: { ids: parsed.data, count: parsed.data.length },
  })

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true, affected: parsed.data.length }
}
