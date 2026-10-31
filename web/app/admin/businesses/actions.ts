'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { createNotification } from '@/lib/notifications/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'
import { hasUsableWhatsAppDestination } from '@/lib/data/contact-availability-utils'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Businesses Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; id?: string } | { ok: false; error: string }

/**
 * Server-only privileged database client for admin actions.
 * Call only after requireAdmin() succeeds; keep public/browser access under RLS.
 * This avoids a mismatch where the app accepts admin + super_admin but the
 * current businesses_admin_all policy only recognizes super_admin.
 */
function createAdminServiceClient() {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

// ─── موافقة ───

export async function approveBusiness(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: biz } = await admin
    .from('businesses')
    .select('id, name, owner_profile_id, slug, business_type_status')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }
  const { data: updated, error } = await admin
    .from('businesses')
    .update({
      is_published: true,
      rejection_reason: null,
      rejected_at: null,
      rejected_by: null,
    })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!updated)
    return { ok: false, error: 'تعذر نشر النشاط — حدّث القائمة وتأكد إن النشاط ما زال موجودًا' }

  // إشعار التاجر المرتبط لا يجب أن يحوّل عملية نشر ناجحة إلى فشل ظاهر.
  if (biz.owner_profile_id) {
    try {
      await createNotification({
        userId: biz.owner_profile_id,
        type: 'admin',
        title: 'تم قبول نشاطك ✓',
        body: `نشاط "${biz.name}" اتنشر — هيظهر للزوار خلال دقائق`,
        deepLink: `/businesses/${biz.slug}`,
      })
    } catch {
      await logAudit(admin, {
        actorUserId: ctx.userId,
        action: 'business.approve.notification_failed',
        entityType: 'business',
        entityId: businessId,
        metadata: { owner_profile_id: biz.owner_profile_id },
      })
    }
  }

  await logAudit(admin, {
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

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: biz } = await admin
    .from('businesses')
    .select('id, name, owner_profile_id, slug')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { data: updated, error } = await admin
    .from('businesses')
    .update({
      is_published: false,
      rejection_reason: parsed.data.reason,
      rejected_at: new Date().toISOString(),
      rejected_by: ctx.userId,
    })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!updated)
    return { ok: false, error: 'تعذر حفظ قرار الرفض — حدّث القائمة وتأكد إن النشاط ما زال موجودًا' }

  // إشعار التاجر المرتبط لا يجب أن يحوّل قرارًا محفوظًا إلى فشل ظاهر.
  if (biz.owner_profile_id) {
    try {
      await createNotification({
        userId: biz.owner_profile_id,
        type: 'admin',
        title: 'نشاطك محتاج تعديل',
        body: `السبب: ${parsed.data.reason}`,
        deepLink: `/merchant/business`,
      })
    } catch {
      await logAudit(admin, {
        actorUserId: ctx.userId,
        action: 'business.reject.notification_failed',
        entityType: 'business',
        entityId: businessId,
        metadata: { owner_profile_id: biz.owner_profile_id },
      })
    }
  }

  await logAudit(admin, {
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

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: archived, error } = await admin
    .from('businesses')
    .update({ is_published: false })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!archived) return { ok: false, error: 'النشاط مش موجود أو تم تحديثه بالفعل' }

  await logAudit(admin, {
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

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: biz } = await admin
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }
  const { data: republished, error } = await admin
    .from('businesses')
    .update({
      is_published: true,
      rejection_reason: null,
      rejected_at: null,
      rejected_by: null,
    })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!republished) return { ok: false, error: 'تعذر إعادة نشر النشاط — حدّث القائمة وحاول تاني' }

  await logAudit(admin, {
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

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: biz } = await admin
    .from('businesses')
    .select('name')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { data: deleted, error } = await admin
    .from('businesses')
    .delete()
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!deleted) return { ok: false, error: 'تعذر حذف النشاط — حدّث القائمة وحاول تاني' }

  await logAudit(admin, {
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
  business_type: z.enum(['restaurant', 'pharmacy', 'delivery_office', 'misc']),
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
    is_published: formData.has('is_published') ? formData.get('is_published') === 'on' : true,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data
  const contacts = d.contacts ?? []
  const primaryPhones = contacts.filter((contact) => contact.kind === 'phone' && contact.is_primary)
  const primaryCount = contacts.filter((contact) => contact.is_primary).length
  const contactValues = contacts.map((contact) => contact.value.trim())

  if (primaryPhones.length !== 1 || primaryCount !== 1) {
    return { ok: false, error: 'لازم تحدد رقم اتصال أساسي واحد فقط للنشاط' }
  }
  if (new Set(contactValues).size !== contactValues.length) {
    return { ok: false, error: 'فيه أرقام تواصل مكررة — راجعها قبل الحفظ' }
  }

  // Owner assignment controls who manages the business; it does not control public visibility.
  // user_roles RLS limits ordinary session reads to the signed-in user's own row,
  // so read the selected target only after requireAdmin() has succeeded.
  let privileged: ReturnType<typeof createServiceClient>
  try {
    privileged = createServiceClient()
  } catch {
    return { ok: false, error: 'إنشاء النشاط غير متاح مؤقتًا — تعذر تجهيز خدمة الحفظ' }
  }

  let selectedOwnerRole: 'customer' | 'merchant' | null = null
  if (d.owner_profile_id) {
    const { data: roleRow, error: roleLookupError } = await privileged
      .from('user_roles')
      .select('role')
      .eq('user_id', d.owner_profile_id)
      .maybeSingle()

    if (roleLookupError) {
      return { ok: false, error: 'تعذر التحقق من دور الحساب المرتبط بالنشاط — حاول تاني' }
    }
    if (!roleRow) {
      return { ok: false, error: 'الحساب المرتبط بالنشاط غير مهيأ داخل النظام — راجع حسابه قبل الربط' }
    }
    if (roleRow.role !== 'customer' && roleRow.role !== 'merchant') {
      return { ok: false, error: 'اختر حساب عميل أو تاجر، ولا تربط النشاط بحساب إداري' }
    }
    selectedOwnerRole = roleRow.role
  }

  const finalSlug = d.slug ?? `${slugify(d.name)}-${randomBytes(8).toString('hex')}`

  // WhatsApp gate: auto-disable orders if no whatsapp contact provided
  const hasWhatsappContact = (d.contacts ?? []).some(
    (contact) =>
      contact.kind === 'whatsapp' && hasUsableWhatsAppDestination(contact.value),
  )
  const effectiveAcceptsWhatsapp = hasWhatsappContact && d.accepts_whatsapp_orders === true

  const { data: created, error } = await privileged
    .from('businesses')
    .insert({
      name: d.name,
      slug: finalSlug,
      business_type: d.business_type,
      custom_business_type: d.custom_business_type || null,
      business_type_status:
        d.business_type === 'misc' && d.custom_business_type ? 'pending' : 'approved',
      owner_profile_id: d.owner_profile_id || null,
      source: 'admin', // Admin-created regardless of assigned owner (owner can be linked later)
      area: d.area || null,
      city: d.city || null,
      address_text: d.address_text || null,
      description: d.description || null,
      hook: d.hook || null,
      is_open: d.is_open ?? true,
      accepts_whatsapp_orders: effectiveAcceptsWhatsapp,
      // Publication is independent from owner assignment and custom-type review.
      // Unapproved custom types use the public fallback category "أخرى".
      is_published: d.is_published ?? true,
    })
    .select('id')
    .single()

  if (error || !created) {
    console.error('[admin-business-create] insert failed:', error?.message ?? 'No row returned')
    return {
      ok: false,
      error:
        error?.code === '23505'
          ? 'اسم النشاط أو رابطه مستخدم بالفعل — غيّر الرابط المختصر وحاول تاني'
          : 'تعذر إنشاء النشاط. راجع البيانات وحاول تاني',
    }
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
    const { error: contactsError } = await privileged.from('business_contact_methods').insert(rows)

    if (contactsError) {
      const { error: rollbackError } = await privileged
        .from('businesses')
        .delete()
        .eq('id', created.id)

      if (rollbackError) {
        await logAudit(privileged, {
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
          error:
            'فشل حفظ أرقام التواصل وتعذّر التراجع التلقائي. افتح قائمة الأنشطة وتحقق من السجل قبل إعادة المحاولة.',
        }
      }

      return {
        ok: false,
        error: 'فشل حفظ أرقام التواصل، وتم إلغاء إنشاء النشاط. راجع الأرقام وحاول تاني.',
      }
    }
  }

  // A newly registered owner normally starts as a customer. Promote only after
  // business + contacts are saved, and roll back the business if the role cannot be changed.
  if (d.owner_profile_id && selectedOwnerRole === 'customer') {
    const { data: promotedRole, error: promoteError } = await privileged
      .from('user_roles')
      .update({ role: 'merchant' })
      .eq('user_id', d.owner_profile_id)
      .eq('role', 'customer')
      .select('role')
      .maybeSingle()

    let ownerIsMerchant = promotedRole?.role === 'merchant'
    if (!ownerIsMerchant) {
      const { data: latestRole, error: latestRoleError } = await privileged
        .from('user_roles')
        .select('role')
        .eq('user_id', d.owner_profile_id)
        .maybeSingle()
      ownerIsMerchant = !latestRoleError && latestRole?.role === 'merchant'
    }

    if (!ownerIsMerchant) {
      const { error: contactsRollbackError } = await privileged
        .from('business_contact_methods')
        .delete()
        .eq('business_id', created.id)
      const { error: businessRollbackError } = await privileged
        .from('businesses')
        .delete()
        .eq('id', created.id)

      if (contactsRollbackError || businessRollbackError) {
        await logAudit(privileged, {
          actorUserId: ctx.userId,
          action: 'business.create_owner_role_failure',
          entityType: 'business',
          entityId: created.id,
          metadata: {
            name: d.name,
            promote_error: promoteError?.message ?? 'owner role was not promoted',
            contacts_rollback_error: contactsRollbackError?.message ?? null,
            business_rollback_error: businessRollbackError?.message ?? null,
          },
        })
        return {
          ok: false,
          error:
            'تعذّر تفعيل الحساب المرتبط بالنشاط وتعذّر إلغاء الإنشاء بالكامل. راجع النشاط في لوحة الإدارة قبل إعادة المحاولة.',
        }
      }

      return {
        ok: false,
        error:
          'تعذّر تفعيل الحساب المرتبط بالنشاط كتاجر، وتم إلغاء إنشاء النشاط. حاول مرة أخرى أو راجع صلاحيات النظام.',
      }
    }
  }

  if (d.owner_profile_id) {
    try {
      await createNotification({
        userId: d.owner_profile_id,
        type: 'admin',
        title: 'تم ربط نشاط بحسابك',
        body: `نشاط "${d.name}" اتربط بحسابك — تقدر تديره من لوحة التاجر`,
        deepLink: '/merchant',
      })
    } catch {
      await logAudit(privileged, {
        actorUserId: ctx.userId,
        action: 'business.create.owner_notification_failed',
        entityType: 'business',
        entityId: created.id,
        metadata: { owner_profile_id: d.owner_profile_id },
      })
    }
  }

  await logAudit(privileged, {
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

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

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

  const { data: updated, error } = await admin
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
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  if (!updated) return { ok: false, error: 'تعذر حفظ النشاط — حدّث الصفحة وحاول تاني' }

  await logAudit(admin, {
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

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات الإدارة غير متاحة مؤقتًا — حاول تاني' }

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
  const { data: biz } = await admin
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

  let admin: ReturnType<typeof createServiceClient>
  try {
    admin = createServiceClient()
  } catch {
    return { ok: false, error: 'البحث عن الحساب المرتبط بالنشاط غير متاح مؤقتًا — حاول تاني' }
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, display_name, phone')
    .eq('phone', parsed.data)
    .maybeSingle()

  if (profileError) return { ok: false, error: 'تعذر البحث عن الحساب — حاول تاني' }
  if (!profile) return { ok: false, error: 'مفيش مستخدم مسجل بالرقم ده' }

  const [bizRes, roleRes] = await Promise.all([
    admin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('owner_profile_id', profile.id),
    admin.from('user_roles').select('role').eq('user_id', profile.id).maybeSingle(),
  ])

  if (bizRes.error || roleRes.error) {
    return { ok: false, error: 'تعذر تحميل بيانات الحساب المرتبط بالنشاط — حاول تاني' }
  }
  if (!roleRes.data || (roleRes.data.role !== 'customer' && roleRes.data.role !== 'merchant')) {
    return { ok: false, error: 'حساب المستخدم غير مهيأ لدور عميل أو تاجر' }
  }

  return {
    ok: true,
    user: {
      id: profile.id as string,
      displayName: (profile.display_name as string) ?? '',
      phone: (profile.phone as string) ?? parsed.data,
      role: roleRes.data.role,
      businessesCount: bizRes.count ?? 0,
    },
  }
}

export async function linkBusinessToUser(businessId: string, userId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const uuidSchema = z.string().uuid()
  if (!uuidSchema.safeParse(userId).success || !uuidSchema.safeParse(businessId).success) {
    return { ok: false, error: 'معرّف النشاط أو المستخدم غير صحيح' }
  }

  let privileged: ReturnType<typeof createServiceClient>
  try {
    // The service client is used only after requireAdmin() succeeds; the target
    // role and activity metadata are not fully readable under self/public RLS.
    privileged = createServiceClient()
  } catch {
    return { ok: false, error: 'تعذر تجهيز خدمة ربط التاجر المرتبط — حاول تاني' }
  }

  const { data: profile, error: profileError } = await privileged
    .from('profiles')
    .select('id, display_name')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) return { ok: false, error: 'تعذر التحقق من بيانات المستخدم' }
  if (!profile) return { ok: false, error: 'المستخدم مش موجود' }

  const { data: biz, error: businessError } = await privileged
    .from('businesses')
    .select('id, name, slug, owner_profile_id, source, claimed_at, claimed_by_user_id')
    .eq('id', businessId)
    .maybeSingle()

  if (businessError) return { ok: false, error: 'تعذر التحقق من بيانات النشاط' }
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { data: currentRole, error: roleLookupError } = await privileged
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (roleLookupError || !currentRole) {
    return { ok: false, error: 'حساب المستخدم غير مهيأ لدور داخل النظام — راجع الحساب قبل الربط' }
  }
  if (currentRole.role !== 'customer' && currentRole.role !== 'merchant') {
    return { ok: false, error: 'لا يمكن ربط نشاط بحساب إداري' }
  }

  const alreadyLinked = biz.owner_profile_id === userId
  if (alreadyLinked && currentRole.role === 'merchant') {
    return { ok: true }
  }

  // Ownership changes must never carry an old order-acceptance setting to a
  // newly linked owner. Public visibility remains unchanged; only ordering is
  // disabled until the new/current seller explicitly re-enables it.
  const { error: closePublicOrdersError } = await privileged
    .from('businesses')
    .update({ accepts_orders: false })
    .eq('id', businessId)
  if (closePublicOrdersError) {
    return { ok: false, error: 'تعذر إيقاف الطلبات قبل تغيير المالك؛ لم يتغير ربط النشاط.' }
  }

  const { error: closeOrderSettingsError } = await privileged
    .from('merchant_order_settings')
    .update({
      orders_enabled: false,
      orders_disabled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)
  if (closeOrderSettingsError) {
    await logAudit(privileged, {
      actorUserId: ctx.userId,
      action: 'business.link_owner.order_reset_failed',
      entityType: 'business',
      entityId: businessId,
      metadata: { error: closeOrderSettingsError.message },
    })
    return {
      ok: false,
      error: 'تم إيقاف زر الطلب لحماية النشاط، لكن تعذر حفظ إعداداته. لم يتغير ربط التاجر المرتبط؛ راجع الإعدادات وحاول تاني.',
    }
  }

  if (!alreadyLinked) {
    const { error } = await privileged
      .from('businesses')
      .update({
        owner_profile_id: userId,
        source: 'merchant',
        claimed_at: new Date().toISOString(),
        claimed_by_user_id: ctx.userId,
      })
      .eq('id', businessId)

    if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }
  }

  // Newly registered users start as customers; promote only after the business
  // owner link is saved. If promotion fails, restore the previous owner fields.
  if (currentRole.role === 'customer') {
    const { data: promotedRole, error: promoteError } = await privileged
      .from('user_roles')
      .update({ role: 'merchant' })
      .eq('user_id', userId)
      .eq('role', 'customer')
      .select('role')
      .maybeSingle()

    let ownerIsMerchant = promotedRole?.role === 'merchant'
    if (!ownerIsMerchant) {
      const { data: latestRole, error: latestRoleError } = await privileged
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()
      ownerIsMerchant = !latestRoleError && latestRole?.role === 'merchant'
    }

    if (!ownerIsMerchant) {
      if (alreadyLinked) {
        await logAudit(privileged, {
          actorUserId: ctx.userId,
          action: 'business.link_owner_role_failure',
          entityType: 'business',
          entityId: businessId,
          metadata: {
            new_owner: userId,
            promote_error: promoteError?.message ?? 'owner role was not promoted',
            already_linked: true,
          },
        })
        return {
          ok: false,
          error: 'النشاط ما زال مربوطًا بالحساب، لكن تعذّر تفعيل دور التاجر. أوقفنا الطلبات لحماية النشاط؛ راجع الدور وإعدادات الطلب.',
        }
      }

      const { error: rollbackError } = await privileged
        .from('businesses')
        .update({
          owner_profile_id: biz.owner_profile_id,
          source: biz.source,
          claimed_at: biz.claimed_at,
          claimed_by_user_id: biz.claimed_by_user_id,
        })
        .eq('id', businessId)

      if (rollbackError) {
        await logAudit(privileged, {
          actorUserId: ctx.userId,
          action: 'business.link_owner_partial_failure',
          entityType: 'business',
          entityId: businessId,
          metadata: {
            new_owner: userId,
            old_owner: biz.owner_profile_id,
            promote_error: promoteError?.message ?? 'owner role was not promoted',
            rollback_error: rollbackError.message,
          },
        })
        return {
          ok: false,
          error: 'تعذّر تفعيل الحساب المرتبط بالنشاط وتعذّر التراجع عن الربط. راجع النشاط قبل إعادة المحاولة.',
        }
      }

      return {
        ok: false,
        error: 'تعذّر تفعيل الحساب المرتبط بالنشاط كتاجر، وتم التراجع عن الربط. حاول تاني.',
      }
    }
  }

  try {
    await createNotification({
      userId,
      type: 'admin',
      title: 'تم ربط نشاط بحسابك',
      body: `نشاط "${biz.name}" بقى تحت حسابك — تقدر تديره من لوحة التحكم`,
      deepLink: '/merchant',
    })
  } catch {
    // A notification outage must not turn a successful ownership change into an apparent failure.
    await logAudit(privileged, {
      actorUserId: ctx.userId,
      action: 'business.link_owner.notification_failed',
      entityType: 'business',
      entityId: businessId,
      metadata: { owner_profile_id: userId },
    })
  }

  await logAudit(privileged, {
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
  revalidatePath(`/businesses/${biz.slug}`)
  revalidateTag('admin-badges', 'default')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

export async function unlinkBusinessOwner(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const admin = createAdminServiceClient()
  if (!admin) return { ok: false, error: 'عمليات النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: biz } = await admin
    .from('businesses')
    .select('id, name, slug, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  if (!biz.owner_profile_id) return { ok: false, error: 'النشاط مش مربوط بأي حساب' }

  // Unlinking must close both order flags before the activity becomes ownerless.
  const { error: closePublicOrdersError } = await admin
    .from('businesses')
    .update({ accepts_orders: false })
    .eq('id', businessId)
  if (closePublicOrdersError) {
    return { ok: false, error: 'تعذر إيقاف الطلبات قبل فك ربط التاجر المرتبط؛ لم يتغير الربط.' }
  }

  const { error: closeOrderSettingsError } = await admin
    .from('merchant_order_settings')
    .update({
      orders_enabled: false,
      orders_disabled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)
  if (closeOrderSettingsError) {
    await logAudit(admin, {
      actorUserId: ctx.userId,
      action: 'business.unlink_owner.order_reset_failed',
      entityType: 'business',
      entityId: businessId,
      metadata: { error: closeOrderSettingsError.message },
    })
    return {
      ok: false,
      error: 'تم إيقاف زر الطلب لحماية النشاط، لكن تعذر حفظ إعداداته. لم يتم فك الربط؛ راجع إعدادات الطلب.',
    }
  }

  const { error } = await admin
    .from('businesses')
    .update({
      owner_profile_id: null,
      source: 'admin',
      claimed_at: null,
      claimed_by_user_id: null,
    })
    .eq('id', businessId)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await logAudit(admin, {
    actorUserId: ctx.userId,
    action: 'business.unlink_owner',
    entityType: 'business',
    entityId: businessId,
    metadata: { old_owner: biz.owner_profile_id, business_name: biz.name },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath('/admin/businesses')
  revalidatePath(`/businesses/${biz.slug}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}
