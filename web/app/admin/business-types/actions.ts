'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Types Approval
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

const idSchema = z.string().uuid()

export async function approveBusinessType(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idSchema.safeParse(businessId)
  if (!parsed.success) return { ok: false, error: 'معرّف غير صالح' }

  const { data: business, error } = await ctx.supabase
    .from('businesses')
    .update({
      business_type_status: 'approved',
      business_type_approved_at: new Date().toISOString(),
    })
    .eq('id', parsed.data)
    .eq('business_type_status', 'pending')
    .select('id, name, slug, owner_profile_id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!business)
    return { ok: false, error: 'الطلب لم يعد بانتظار الموافقة، حدّث القائمة وحاول تاني' }

  if (business.owner_profile_id) {
    try {
      await createNotification({
        userId: business.owner_profile_id,
        type: 'admin',
        title: 'تمت الموافقة على نوع نشاطك ✓',
        body: `نوع النشاط المخصص لنشاط "${business.name}" اتوافق عليه. حالة نشر النشاط نفسها لم تتغير.`,
        deepLink: `/businesses/${business.slug}`,
      })
    } catch {
      // Notification delivery must not turn a successful approval into a failed action.
    }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business_type.approve',
    entityType: 'business',
    entityId: parsed.data,
    metadata: { business_type_status: 'approved' },
  })

  revalidatePath('/admin/business-types')
  revalidatePath('/admin/businesses')
  revalidatePath('/explore')
  revalidateTag('businesses', 'default')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

export async function rejectBusinessType(businessId: string, reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idSchema.safeParse(businessId)
  if (!parsed.success) return { ok: false, error: 'معرّف غير صالح' }

  const cleanReason = reason.trim().slice(0, 300)

  const { data: business, error } = await ctx.supabase
    .from('businesses')
    .update({
      business_type_status: 'rejected',
      business_type_approved_at: null,
    })
    .eq('id', parsed.data)
    .eq('business_type_status', 'pending')
    .select('id, name, owner_profile_id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!business)
    return { ok: false, error: 'الطلب لم يعد بانتظار الموافقة، حدّث القائمة وحاول تاني' }

  if (business.owner_profile_id) {
    try {
      await createNotification({
        userId: business.owner_profile_id,
        type: 'admin',
        title: 'نوع النشاط محتاج تعديل',
        body: `نوع النشاط المخصص لم يتم اعتماده: ${cleanReason || 'راجع الإدارة لتعديله'}. سيظل النشاط منشورًا تحت فئة «أخرى» حتى لو تم رفض اسمه المخصص.`,
        deepLink: '/merchant/business',
      })
    } catch {
      // Notification delivery must not turn a successful rejection into a failed action.
    }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business_type.reject',
    entityType: 'business',
    entityId: parsed.data,
    metadata: { reason: cleanReason },
  })

  revalidatePath('/admin/business-types')
  revalidatePath('/admin/businesses')
  revalidateTag('businesses', 'default')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}
