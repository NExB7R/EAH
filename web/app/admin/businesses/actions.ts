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
      rejected_reason: null,
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
      rejected_reason: null,
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

// ═══════════════════════════════════════════════════════════
// التجربة المجانية (Admin) — start_business_trial RPC
// ═══════════════════════════════════════════════════════════

export async function adminStartTrial(businessId: string, days = 30): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return { ok: false, error: 'عدد أيام غير صالح (1-365)' }
  }

  const { createServiceClient } = await import('@/lib/supabase/service')
  const admin = createServiceClient()

  const { data, error } = await admin.rpc('start_business_trial', {
    p_business_id: businessId,
    p_days: days,
    p_actor_user_id: ctx.userId,
  })

  if (error) {
    console.error('[adminStartTrial]', error.message)
    return { ok: false, error: 'حصلت مشكلة — جرب تاني' }
  }

  const result = data as { ok: boolean; error?: string } | null
  if (!result?.ok) return { ok: false, error: result?.error ?? 'فشل بدء التجربة' }

  // إشعار لصاحب النشاط (لو موجود)
  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('name, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()

  if (biz?.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'admin',
      title: '🎉 بدأنا لك تجربة مجانية',
      body: `${days} يوم على الباقة المميزة — استفد من كل المزايا`,
      deepLink: '/merchant/subscription',
    })
  }

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════
// ربط نشاط بحساب مستخدم (Admin)
// ═══════════════════════════════════════════════════════════

const phoneLookupSchema = z.string().regex(/^01[0-9]{9}$/, 'رقم غير صحيح')

export type UserLookup =
  | {
      ok: true
      user: {
        id: string
        displayName: string
        phone: string
        role: string
        businessesCount: number
      }
    }
  | { ok: false; error: string }

export async function findUserByPhone(phone: string): Promise<UserLookup> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = phoneLookupSchema.safeParse(phone.trim())
  if (!parsed.success) return { ok: false, error: 'رقم غير صحيح (11 رقم يبدأ بـ 01)' }

  const { createServiceClient } = await import('@/lib/supabase/service')
  const admin = createServiceClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('id, display_name, phone')
    .eq('phone', parsed.data)
    .maybeSingle()

  if (!profile) return { ok: false, error: 'مفيش مستخدم مسجل بالرقم ده' }

  const [bizRes, roleRes] = await Promise.all([
    admin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('owner_profile_id', profile.id),
    admin.from('user_roles').select('role').eq('user_id', profile.id).maybeSingle(),
  ])

  return {
    ok: true,
    user: {
      id: profile.id as string,
      displayName: (profile.display_name as string) ?? '',
      phone: (profile.phone as string) ?? parsed.data,
      role: (roleRes.data?.role as string) ?? 'customer',
      businessesCount: bizRes.count ?? 0,
    },
  }
}

export async function linkBusinessToUser(businessId: string, userId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const uuidSchema = z.string().uuid()
  if (!uuidSchema.safeParse(userId).success) {
    return { ok: false, error: 'معرّف المستخدم غير صحيح' }
  }

  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) return { ok: false, error: 'المستخدم مش موجود' }

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id, source')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  if (biz.owner_profile_id === userId) {
    return { ok: false, error: 'النشاط مرتبط بالفعل بالحساب ده' }
  }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      owner_profile_id: userId,
      source: 'merchant',
      claimed_at: new Date().toISOString(),
      claimed_by_user_id: ctx.userId,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  // رفع المستخدم لـ merchant (لو مش admin/super_admin)
  const { data: currentRole } = await ctx.supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (currentRole?.role === 'customer') {
    await ctx.supabase.from('user_roles').update({ role: 'merchant' }).eq('user_id', userId)
  }

  await createNotification({
    userId,
    type: 'admin',
    title: 'تم ربط نشاط بحسابك',
    body: `نشاط "${biz.name}" بقى تحت حسابك — تقدر تديره من لوحة التحكم`,
    deepLink: '/merchant',
  })

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.link_owner',
    entityType: 'business',
    entityId: businessId,
    metadata: {
      new_owner: userId,
      old_owner: biz.owner_profile_id,
      business_name: biz.name,
    },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath('/admin/businesses')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

export async function unlinkBusinessOwner(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  if (!biz.owner_profile_id) return { ok: false, error: 'النشاط مش مربوط بأي حساب' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      owner_profile_id: null,
      source: 'admin',
      claimed_at: null,
      claimed_by_user_id: null,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.unlink_owner',
    entityType: 'business',
    entityId: businessId,
    metadata: { old_owner: biz.owner_profile_id, business_name: biz.name },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath('/admin/businesses')
  return { ok: true }
}
