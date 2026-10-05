'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Businesses Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'غير مصرح' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return { ok: false as const, error: 'غير مصرح' }
  }
  return { ok: true as const, supabase, userId: user.id }
}

// ─── موافقة ───

export async function approveBusiness(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id, slug')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      is_published: true,
      rejection_reason: null,
      rejected_at: null,
      rejected_by: null,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  // إشعار لصاحب النشاط
  if (biz.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'admin',
      title: 'تم قبول نشاطك ✓',
      body: `نشاط "${biz.name}" اتنشر — هيظهر للزوار خلال دقائق`,
      deepLink: `/businesses/${biz.slug}`,
    })
  }

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ─── رفض ───

const rejectSchema = z.object({
  reason: z.string().min(5, 'السبب قصير').max(300),
})

export async function rejectBusiness(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = rejectSchema.safeParse({
    reason: String(formData.get('reason') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id, slug')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      is_published: false,
      rejection_reason: parsed.data.reason,
      rejected_at: new Date().toISOString(),
      rejected_by: ctx.userId,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  // إشعار لصاحب النشاط
  if (biz.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'admin',
      title: 'نشاطك محتاج تعديل',
      body: `السبب: ${parsed.data.reason}`,
      deepLink: `/merchant/business`,
    })
  }

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── أرشفة (إخفاء مؤقت) ───

export async function archiveBusiness(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('businesses')
    .update({ is_published: false })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ─── إعادة نشر ───

export async function republishBusiness(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      is_published: true,
      rejection_reason: null,
      rejected_at: null,
      rejected_by: null,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ─── حذف نهائي ───

export async function deleteBusiness(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase.from('businesses').delete().eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}
