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
    .regex(/^[a-z0-9-]+$/, 'الحروف الصغيرة والأرقام والشرطة فقط')
    .optional(),
  business_type: z.enum(['restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc']),
  custom_business_type: z.string().max(50).or(z.literal('')).optional(),
  owner_profile_id: z.string().uuid().optional().or(z.literal('')),
  area: z.string().max(60).or(z.literal('')).optional(),
  city: z.string().max(60).or(z.literal('')).optional(),
  address_text: z.string().max(200).or(z.literal('')).optional(),
  description: z.string().max(1000).or(z.literal('')).optional(),
  hook: z.string().max(120).or(z.literal('')).optional(),
  contacts: z
    .array(
      z.object({
        kind: z.enum([
          'phone',
          'whatsapp',
          'complaints',
          'manager',
          'shift_morning',
          'shift_evening',
          'additional',
        ]),
        value: z.string().regex(/^0\d{9,12}$/),
        is_primary: z.boolean().optional().default(false),
      }),
    )
    .max(15)
    .optional(),
  is_open: z.boolean().optional(),
  accepts_whatsapp_orders: z.boolean().optional(),
  is_published: z.boolean().optional(),
})

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || `biz-${Date.now().toString(36)}`
  )
}

export async function createBusiness(formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = createSchema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    slug:
      String(formData.get('slug') ?? '')
        .trim()
        .toLowerCase() || undefined,
    business_type: String(formData.get('business_type') ?? ''),
    custom_business_type: String(formData.get('custom_business_type') ?? '').trim(),
    owner_profile_id:
      String(formData.get('owner_profile_id') ?? '').trim() ||
      String(formData.get('owner_user_id') ?? '').trim() ||
      '',
    area: String(formData.get('area') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    address_text: String(formData.get('address_text') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    hook: String(formData.get('hook') ?? '').trim(),
    contacts: (() => {
      try {
        const raw = String(formData.get('contacts_json') ?? '[]')
        const arr = JSON.parse(raw) as unknown
        return Array.isArray(arr) ? arr : []
      } catch {
        return []
      }
    })(),
    is_open: formData.get('is_open') === 'on',
    accepts_whatsapp_orders: formData.get('accepts_whatsapp_orders') === 'on',
    is_published: formData.get('is_published') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  // Public listings must be linked to an owner before immediate publication.
  // An unassigned activity can be saved as a private draft and linked later.
  if (d.is_published && !d.owner_profile_id) {
    return { ok: false, error: 'اربط النشاط بحساب مالكه قبل النشر المباشر' }
  }

  const finalSlug = d.slug ?? slugify(d.name)

  // WhatsApp gate: auto-disable orders if no whatsapp contact provided
  const hasWhatsappContact = (d.contacts ?? []).some(
    (c) => c.kind === 'whatsapp' && c.value.trim().length > 0,
  )
  const effectiveAcceptsWhatsapp = hasWhatsappContact ? (d.accepts_whatsapp_orders ?? true) : false

  const { data: created, error } = await ctx.supabase
    .from('businesses')
    .insert({
      name: d.name,
      slug: finalSlug,
      business_type: d.business_type,
      custom_business_type: d.custom_business_type || null,
      business_type_status:
        d.business_type === 'misc' && d.custom_business_type ? 'pending' : 'approved',
      owner_profile_id: d.owner_profile_id || null,
      source: d.owner_profile_id ? 'merchant' : 'admin',
      area: d.area || null,
      city: d.city || null,
      address_text: d.address_text || null,
      description: d.description || null,
      hook: d.hook || null,
      is_open: d.is_open ?? true,
      accepts_whatsapp_orders: effectiveAcceptsWhatsapp,
      is_published:
        d.business_type === 'misc' && d.custom_business_type ? false : (d.is_published ?? true),
    })
    .select('id')
    .single()

  if (error || !created) {
    return { ok: false, error: error?.message ?? 'فشل الإنشاء' }
  }

  // حفظ جهات الاتصال
  if (d.contacts && d.contacts.length > 0) {
    const rows = d.contacts.map((c, idx) => ({
      business_id: created.id,
      method_type: c.kind,
      value: c.value,
      is_public: true,
      is_primary: c.is_primary ?? false,
      sort_order: idx,
    }))
    const { error: contactsError } = await ctx.supabase
      .from('business_contact_methods')
      .insert(rows)

    if (contactsError) {
      const { error: rollbackError } = await ctx.supabase
        .from('businesses')
        .delete()
        .eq('id', created.id)

      if (rollbackError) {
        await logAudit(ctx.supabase, {
          actorUserId: ctx.userId,
          action: 'business.create_partial_failure',
          entityType: 'business',
          entityId: created.id,
          metadata: {
            name: d.name,
            contact_error: contactsError.message,
            rollback_error: rollbackError.message,
          },
        })
        return {
          ok: false,
          error: 'فشل حفظ أرقام التواصل وتعذّر التراجع التلقائي. افتح قائمة الأنشطة وتحقق من السجل قبل إعادة المحاولة.',
        }
      }

      return {
        ok: false,
        error: 'فشل حفظ أرقام التواصل، وتم إلغاء إنشاء النشاط. راجع الأرقام وحاول تاني.',
      }
    }
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
    admin.from('user_roles').select('role').eq('user_id', profile.id).limit(1).maybeSingle(),
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
