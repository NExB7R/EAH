'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Businesses Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; id?: string } | { ok: false; error: string }

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

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.approve',
    entityType: 'business',
    entityId: businessId,
    metadata: { name: biz.name },
  })

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

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.reject',
    entityType: 'business',
    entityId: businessId,
    metadata: { name: biz.name, reason: parsed.data.reason },
  })

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

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.archive',
    entityType: 'business',
    entityId: businessId,
  })

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

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.republish',
    entityType: 'business',
    entityId: businessId,
  })

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ─── حذف نهائي ───

export async function deleteBusiness(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('name')
    .eq('id', businessId)
    .maybeSingle()

  const { error } = await ctx.supabase.from('businesses').delete().eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.delete',
    entityType: 'business',
    entityId: businessId,
    metadata: { name: biz?.name ?? null },
  })

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════
// إنشاء نشاط جديد (يدوي)
// ═══════════════════════════════════════════════════════════

const createSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'الحروف الصغيرة والأرقام والشرطة فقط'),
  business_type: z.enum(['restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc']),
  owner_profile_id: z.string().uuid('اختر صاحب نشاط'),
  area: z.string().max(60).or(z.literal('')),
  city: z.string().max(60).or(z.literal('')),
  address_text: z.string().max(200).or(z.literal('')),
  description: z.string().max(1000).or(z.literal('')),
  hook: z.string().max(120).or(z.literal('')),
  is_published: z.boolean(),
})

export async function createBusiness(formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = createSchema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    slug: String(formData.get('slug') ?? '')
      .trim()
      .toLowerCase(),
    business_type: String(formData.get('business_type') ?? ''),
    owner_profile_id: String(formData.get('owner_profile_id') ?? ''),
    area: String(formData.get('area') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    address_text: String(formData.get('address_text') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    hook: String(formData.get('hook') ?? '').trim(),
    is_published: formData.get('is_published') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data
  const { data: created, error } = await ctx.supabase
    .from('businesses')
    .insert({
      name: d.name,
      slug: d.slug,
      business_type: d.business_type,
      owner_profile_id: d.owner_profile_id,
      area: d.area || null,
      city: d.city || null,
      address_text: d.address_text || null,
      description: d.description || null,
      hook: d.hook || null,
      is_published: d.is_published,
    })
    .select('id')
    .single()

  if (error || !created) {
    return { ok: false, error: error?.message ?? 'فشل الإنشاء' }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.create',
    entityType: 'business',
    entityId: created.id,
    metadata: { name: d.name, business_type: d.business_type },
  })

  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true, id: created.id }
}

// ═══════════════════════════════════════════════════════════
// تحديث نشاط
// ═══════════════════════════════════════════════════════════

const updateSchema = createSchema.omit({ owner_profile_id: true })

export async function updateBusiness(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = updateSchema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    slug: String(formData.get('slug') ?? '')
      .trim()
      .toLowerCase(),
    business_type: String(formData.get('business_type') ?? ''),
    area: String(formData.get('area') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    address_text: String(formData.get('address_text') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    hook: String(formData.get('hook') ?? '').trim(),
    is_published: formData.get('is_published') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data
  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      name: d.name,
      slug: d.slug,
      business_type: d.business_type,
      area: d.area || null,
      city: d.city || null,
      address_text: d.address_text || null,
      description: d.description || null,
      hook: d.hook || null,
      is_published: d.is_published,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update',
    entityType: 'business',
    entityId: businessId,
    metadata: { name: d.name },
  })

  revalidatePath('/admin/businesses')
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}
