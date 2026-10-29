'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'
import { getWhatsAppDestinationBusinessIds } from '@/lib/data/contact-availability'
import {
  basicsSchema,
  contactsSchema,
  locationSchema,
  hoursSchema,
  branchSchema,
  settingsSchema,
} from '@/lib/validations/admin-business'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Edit Actions
// حفظ لكل قسم — بدون reload للصفحة
// ═══════════════════════════════════════════════════════════

type Result =
  { ok: true; id?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }


/**
 * Privileged DB access for admin-only edit actions.
 * Every exported action below must pass requireAdmin() before calling this helper.
 * Never import/use this client from browser components.
 */
function createAdminDb() {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

function parseError(parsed: z.ZodSafeParseError<unknown>): Result {
  const fieldErrors: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.') || '_'
    if (!fieldErrors[key]) fieldErrors[key] = issue.message
  }
  const first = parsed.error.issues[0]
  return { ok: false, error: first?.message ?? 'بيانات غير صحيحة', fieldErrors }
}

function fd(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function fdBool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on' || formData.get(key) === 'true' || formData.get(key) === '1'
}

/** Convert an optional date input to ISO without throwing on malformed user input. */
function toOptionalIsoDate(value: string | undefined): string | null | undefined {
  if (!value?.trim()) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined
  return date.toISOString()
}

// ═══ 1. الأساسيات ═══
export async function saveBasics(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const parsed = basicsSchema.safeParse({
    name: fd(formData, 'name'),
    slug: fd(formData, 'slug'),
    business_type: fd(formData, 'business_type'),
    subcategory: fd(formData, 'subcategory'),
    area: fd(formData, 'area'),
    city: fd(formData, 'city'),
    address_text: fd(formData, 'address_text'),
    hook: fd(formData, 'hook'),
    description: fd(formData, 'description'),
  })
  if (!parsed.success) return parseError(parsed)

  // Switching to a built-in type resolves a previously pending/rejected custom
  // type request, so the business can be republished after the admin saves.
  const updateData =
    parsed.data.business_type === 'misc'
      ? parsed.data
      : {
          ...parsed.data,
          custom_business_type: null,
          business_type_status: 'approved' as const,
          business_type_approved_at: null,
        }

  const { data: updated, error } = await adminDb
    .from('businesses')
    .update(updateData)
    .eq('id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (!updated) return { ok: false, error: 'تعذر حفظ بيانات النشاط — حدّث الصفحة وحاول تاني' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.basics',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 1b. تصحيح اسم النوع المخصص وإعادة إرساله للمراجعة ═══
export async function saveCustomBusinessType(
  businessId: string,
  customBusinessType: string,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  if (!z.string().uuid().safeParse(businessId).success) {
    return { ok: false, error: 'معرّف النشاط غير صحيح' }
  }

  const cleanType = customBusinessType.trim()
  if (cleanType.length < 2 || cleanType.length > 50) {
    return { ok: false, error: 'اسم النوع لازم يكون من حرفين إلى 50 حرفًا' }
  }

  const { data: business, error: lookupError } = await adminDb
    .from('businesses')
    .select('id, business_type')
    .eq('id', businessId)
    .maybeSingle()
  if (lookupError) return { ok: false, error: 'تعذر التحقق من النشاط' }
  if (!business) return { ok: false, error: 'النشاط مش موجود' }
  if (business.business_type !== 'misc') {
    return { ok: false, error: 'اختار «أخرى» كنوع أساسي قبل تعديل الاسم المخصص' }
  }

  const { data: updated, error } = await adminDb
    .from('businesses')
    .update({
      custom_business_type: cleanType,
      business_type_status: 'pending',
      business_type_approved_at: null,
    })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر حفظ النوع المخصص لإعادة المراجعة' }
  if (!updated) return { ok: false, error: 'النشاط مش موجود أو لم يتم تحديثه' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business_type.resubmit',
    entityType: 'business',
    entityId: businessId,
    metadata: { business_type_status: 'pending' },
  })

  revalidatePath('/admin/business-types')
  revalidatePath('/admin/businesses')
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ═══ 2. التواصل ═══
export async function saveContacts(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const parsed = contactsSchema.safeParse({
    phone: fd(formData, 'phone'),
    whatsapp: fd(formData, 'whatsapp'),
    facebook: fd(formData, 'facebook'),
    instagram: fd(formData, 'instagram'),
    website: fd(formData, 'website'),
  })
  if (!parsed.success) return parseError(parsed)

  const { data: business } = await adminDb
    .from('businesses')
    .select('id, slug')
    .eq('id', businessId)
    .maybeSingle()
  if (!business) return { ok: false, error: 'النشاط مش موجود' }


  const extendedTypes = ['complaints', 'manager', 'shift_morning', 'shift_evening'] as const
  const extendedValues: Record<string, string> = {}
  for (const type of extendedTypes) {
    const value = fd(formData, type)
    if (value && !/^0\d{9,12}$/.test(value)) {
      return { ok: false, error: 'رقم غير صحيح — لازم يبدأ بـ 0 ويكون 10-13 رقم' }
    }
    extendedValues[type] = value
  }

  const managedTypes = [
    'phone',
    'whatsapp',
    'complaints',
    'facebook',
    'instagram',
    'website',
    'manager',
    'shift_morning',
    'shift_evening',
  ]

  // Snapshot current values first, so failed writes can restore the public contacts.
  const { data: previousRows, error: previousError } = await adminDb
    .from('business_contact_methods')
    .select('business_id, method_type, value, is_primary, is_public, label, sort_order')
    .eq('business_id', businessId)
    .in('method_type', managedTypes)
  if (previousError) return { ok: false, error: 'تعذر قراءة جهات الاتصال الحالية' }

  // Keep "additional" and future contact types untouched.
  const { error: deleteError } = await adminDb
    .from('business_contact_methods')
    .delete()
    .eq('business_id', businessId)
    .in('method_type', managedTypes)
  if (deleteError) return { ok: false, error: 'تعذر حذف جهات الاتصال القديمة' }

  const rows: {
    business_id: string
    method_type: string
    value: string
    is_primary: boolean
    is_public: boolean
  }[] = []
  if (parsed.data.phone) {
    rows.push({
      business_id: businessId,
      method_type: 'phone',
      value: parsed.data.phone,
      is_primary: true,
      is_public: true,
    })
  }
  if (parsed.data.whatsapp) {
    rows.push({
      business_id: businessId,
      method_type: 'whatsapp',
      value: parsed.data.whatsapp,
      is_primary: false,
      is_public: true,
    })
  }
  if (parsed.data.facebook) {
    rows.push({
      business_id: businessId,
      method_type: 'facebook',
      value: parsed.data.facebook,
      is_primary: false,
      is_public: true,
    })
  }
  if (parsed.data.instagram) {
    rows.push({
      business_id: businessId,
      method_type: 'instagram',
      value: parsed.data.instagram,
      is_primary: false,
      is_public: true,
    })
  }
  if (parsed.data.website) {
    rows.push({
      business_id: businessId,
      method_type: 'website',
      value: parsed.data.website,
      is_primary: false,
      is_public: true,
    })
  }
  for (const type of extendedTypes) {
    const value = extendedValues[type]
    if (value)
      rows.push({
        business_id: businessId,
        method_type: type,
        value,
        is_primary: false,
        is_public: true,
      })
  }

  if (rows.length > 0) {
    const { error } = await adminDb.from('business_contact_methods').insert(rows)
    if (error) {
      const { error: clearError } = await adminDb
        .from('business_contact_methods')
        .delete()
        .eq('business_id', businessId)
        .in('method_type', managedTypes)
      const { error: restoreError } =
        previousRows && previousRows.length > 0
          ? await adminDb.from('business_contact_methods').insert(previousRows)
          : { error: null }

      if (clearError || restoreError) {
        return {
          ok: false,
          error:
            'تعذر حفظ جهات الاتصال ولم يكتمل الاسترجاع التلقائي. راجع النشاط قبل إعادة المحاولة',
        }
      }
      return { ok: false, error: 'تعذر حفظ جهات الاتصال، وتمت استعادة الأرقام السابقة' }
    }
  }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.contacts',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath(`/businesses/${business.slug}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 3. الموقع ═══
export async function saveLocation(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const latRaw = fd(formData, 'latitude')
  const lngRaw = fd(formData, 'longitude')

  const parsed = locationSchema.safeParse({
    latitude: latRaw === '' ? null : latRaw,
    longitude: lngRaw === '' ? null : lngRaw,
    address_text: fd(formData, 'address_text'),
    map_url: fd(formData, 'map_url'),
  })
  if (!parsed.success) return parseError(parsed)

  const hasLat = parsed.data.latitude !== null && parsed.data.latitude !== undefined
  const hasLng = parsed.data.longitude !== null && parsed.data.longitude !== undefined
  if (hasLat !== hasLng) return { ok: false, error: 'لازم الإحداثيين مع بعض أو الاتنين فاضيين' }

  const { data: business } = await adminDb
    .from('businesses')
    .select('id, slug')
    .eq('id', businessId)
    .maybeSingle()
  if (!business) return { ok: false, error: 'النشاط مش موجود' }


  const { data: currentLocations, error: lookupError } = await adminDb
    .from('business_locations')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_primary', true)
    .order('created_at', { ascending: true })
    .limit(10)
  if (lookupError) return { ok: false, error: 'تعذر قراءة الموقع الحالي' }

  if (hasLat && hasLng) {
    const existing = currentLocations?.[0]
    if (existing) {
      const { error } = await adminDb
        .from('business_locations')
        .update({
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          address_text: parsed.data.address_text ?? null,
          is_primary: true,
        })
        .eq('id', existing.id)
        .eq('business_id', businessId)
      if (error) return { ok: false, error: 'تعذر تحديث موقع النشاط' }
    } else {
      const { error } = await adminDb.from('business_locations').insert({
        business_id: businessId,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        address_text: parsed.data.address_text ?? null,
        is_primary: true,
      })
      if (error) return { ok: false, error: 'تعذر إضافة موقع النشاط' }
    }

    const duplicates = (currentLocations ?? []).slice(existing ? 1 : 0).map((item) => item.id)
    if (duplicates.length > 0) {
      const { error } = await adminDb.from('business_locations').delete().in('id', duplicates)
      if (error) return { ok: false, error: 'الموقع اتحفظ لكن تعذر تنظيف المواقع المكررة' }
    }
  } else if ((currentLocations ?? []).length > 0) {
    const { error } = await adminDb
      .from('business_locations')
      .delete()
      .eq('business_id', businessId)
      .eq('is_primary', true)
    if (error) return { ok: false, error: 'تعذر مسح الموقع القديم' }
  }

  const { error: addressError } = await adminDb
    .from('businesses')
    .update({
      address_text: parsed.data.address_text ?? null,
      map_url: parsed.data.map_url ?? null,
    })
    .eq('id', businessId)
  if (addressError) return { ok: false, error: 'الموقع اتحفظ لكن تعذر حفظ العنوان أو رابط الخريطة' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.location',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath(`/businesses/${business.slug}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 4. أوقات العمل ═══
export async function saveHours(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
  const raw: Record<string, { open: string; close: string } | null> = {}
  for (const day of days) {
    const open = fd(formData, `${day}_open`)
    const close = fd(formData, `${day}_close`)
    raw[day] = open && close ? { open, close } : null
  }

  const parsed = hoursSchema.safeParse(raw)
  if (!parsed.success) return parseError(parsed)

  const { error } = await adminDb
    .from('businesses')
    .update({ working_hours: parsed.data })
    .eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.hours',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  return { ok: true }
}

// ═══ 5. الإعدادات ═══
export async function saveSettings(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const parsed = settingsSchema.safeParse({
    is_published: fdBool(formData, 'is_published'),
    is_open: fdBool(formData, 'is_open'),
    accepts_whatsapp_orders: fdBool(formData, 'accepts_whatsapp_orders'),
    is_featured: fdBool(formData, 'is_featured'),
    is_verified: fdBool(formData, 'is_verified'),
    featured_order: fd(formData, 'featured_order') || '0',
    featured_pin: fdBool(formData, 'featured_pin'),
    featured_until: fd(formData, 'featured_until'),
    is_new_project: fdBool(formData, 'is_new_project'),
    new_until: fd(formData, 'new_until'),
  })
  if (!parsed.success) return parseError(parsed)

  const featuredUntil = toOptionalIsoDate(parsed.data.featured_until ?? undefined)
  const newUntil = toOptionalIsoDate(parsed.data.new_until ?? undefined)
  if (featuredUntil === undefined || newUntil === undefined) {
    return { ok: false, error: 'تاريخ انتهاء التمييز أو علامة «جديد» غير صحيح' }
  }

  // WhatsApp gate: accept a valid public contact-method number or a valid active-branch number.
  if (parsed.data.accepts_whatsapp_orders) {
    const configuredWhatsAppIds = await getWhatsAppDestinationBusinessIds(adminDb, [businessId])
    if (!configuredWhatsAppIds.has(businessId)) {
      return {
        ok: false,
        error:
          'مينفعش تفعّل استقبال واتساب قبل إضافة رقم واتساب صالح في قسم التواصل أو أحد الفروع النشطة.',
      }
    }
  }

  // Publication is controlled by the admin's explicit visibility setting.
  // Custom-type approval affects the label only, never whether a business can be listed.
  // ═══ Verification change tracking ═══
  const { data: currentRow } = await adminDb
    .from('businesses')
    .select('is_verified')
    .eq('id', businessId)
    .maybeSingle()
  const wasVerified = !!currentRow?.is_verified
  const nowVerified = parsed.data.is_verified ?? false
  const verificationChange = wasVerified !== nowVerified

  const settings = {
    ...parsed.data,
    featured_until: featuredUntil,
    new_until: newUntil,
    ...(verificationChange
      ? {
          is_verified: nowVerified,
          verified_at: nowVerified ? new Date().toISOString() : null,
          verified_by: nowVerified ? ctx.userId : null,
        }
      : {}),
  }

  const { data: updated, error } = await adminDb
    .from('businesses')
    .update(settings)
    .eq('id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (!updated) return { ok: false, error: 'تعذر حفظ الإعدادات — حدّث الصفحة وحاول تاني' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.settings',
    entityType: 'business',
    entityId: businessId,
    metadata: settings as Record<string, unknown>,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ═══ 6. فرع (add/update) ═══
export async function saveBranch(
  businessId: string,
  formData: FormData,
  branchId?: string,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const uuidSchema = z.string().uuid()
  if (
    !uuidSchema.safeParse(businessId).success ||
    (branchId && !uuidSchema.safeParse(branchId).success)
  ) {
    return { ok: false, error: 'معرّف النشاط أو الفرع غير صحيح' }
  }

  const parsed = branchSchema.safeParse({
    name: fd(formData, 'name'),
    area: fd(formData, 'area'),
    address_text: fd(formData, 'address_text'),
    latitude: fd(formData, 'latitude') || null,
    longitude: fd(formData, 'longitude') || null,
    phone: fd(formData, 'phone'),
    whatsapp: fd(formData, 'whatsapp'),
    is_primary: fdBool(formData, 'is_primary'),
    // An unchecked checkbox must stay false; "|| true" re-enabled every branch.
    is_active: fdBool(formData, 'is_active'),
    sort_order: fd(formData, 'sort_order') || '0',
  })
  if (!parsed.success) return parseError(parsed)

  const hasLat = parsed.data.latitude !== null && parsed.data.latitude !== undefined
  const hasLng = parsed.data.longitude !== null && parsed.data.longitude !== undefined
  if (hasLat !== hasLng) return { ok: false, error: 'لازم الإحداثيين مع بعض أو الاتنين فاضيين' }
  if (parsed.data.is_primary && !parsed.data.is_active) {
    return { ok: false, error: 'لا يمكن تعيين فرع غير نشط كفرع أساسي' }
  }

  const { data: business, error: businessLookupError } = await adminDb
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .maybeSingle()
  if (businessLookupError) return { ok: false, error: 'تعذر التحقق من النشاط' }
  if (!business) return { ok: false, error: 'النشاط مش موجود' }

  let existingBranchWasPrimary = false
  if (branchId) {
    const { data: existingBranch, error: branchLookupError } = await adminDb
      .from('business_branches')
      .select('id, is_primary')
      .eq('id', branchId)
      .eq('business_id', businessId)
      .maybeSingle()
    if (branchLookupError) return { ok: false, error: 'تعذر التحقق من الفرع' }
    if (!existingBranch) return { ok: false, error: 'الفرع غير تابع للنشاط المحدد' }
    existingBranchWasPrimary = existingBranch.is_primary
  }

  // Save the current primary state so a failed branch write does not leave the
  // activity without its previous primary branch.
  const { data: previousBranches, error: previousError } =
    parsed.data.is_primary || !!branchId
      ? await adminDb
          .from('business_branches')
          .select('id, is_primary')
          .eq('business_id', businessId)
      : { data: [], error: null }

  if (previousError) return { ok: false, error: 'تعذر قراءة حالة الفروع الحالية' }

  const restorePreviousPrimary = async (): Promise<boolean> => {
    const { error: resetError } = await adminDb
      .from('business_branches')
      .update({ is_primary: false })
      .eq('business_id', businessId)
    if (resetError) return false

    for (const oldBranch of previousBranches ?? []) {
      if (!oldBranch.is_primary) continue
      const { error } = await adminDb
        .from('business_branches')
        .update({ is_primary: true })
        .eq('id', oldBranch.id)
        .eq('business_id', businessId)
      if (error) return false
    }
    return true
  }

  // If the new branch is to become primary, do not continue when the reset fails.
  if (parsed.data.is_primary) {
    const { error: clearPrimaryError } = await adminDb
      .from('business_branches')
      .update({ is_primary: false })
      .eq('business_id', businessId)
    if (clearPrimaryError) {
      return { ok: false, error: 'تعذر تحديث الفرع الأساسي — لم يتم حفظ التعديلات' }
    }
  }

  let savedBranchId = branchId
  let saveError: { message: string } | null = null

  if (branchId) {
    const { data, error } = await adminDb
      .from('business_branches')
      .update(parsed.data)
      .eq('id', branchId)
      .eq('business_id', businessId)
      .select('id')
      .maybeSingle()
    saveError = error
    if (!error && !data) saveError = { message: 'الفرع غير موجود أو لم يتم تحديثه' }
  } else {
    const { data, error } = await adminDb
      .from('business_branches')
      .insert({ ...parsed.data, business_id: businessId })
      .select('id')
      .single()
    saveError = error
    if (!error && !data) saveError = { message: 'لم يتم إنشاء الفرع' }
    if (data) savedBranchId = data.id
  }

  if (saveError) {
    if (parsed.data.is_primary) {
      const restored = await restorePreviousPrimary()
      if (!restored) {
        await logAudit(adminDb, {
          actorUserId: ctx.userId,
          action: 'branch.save_primary_partial_failure',
          entityType: 'business',
          entityId: businessId,
          metadata: {
            branch_id: branchId ?? null,
            save_error: saveError.message,
            restore_failed: true,
          },
        })
        return {
          ok: false,
          error:
            'فشل حفظ الفرع وتعذّر استرجاع الفرع الأساسي السابق. راجع الفروع قبل المحاولة مرة أخرى.',
        }
      }
    }
    return { ok: false, error: 'تعذر حفظ بيانات الفرع — راجع البيانات وحاول تاني' }
  }

  // If the current primary branch was demoted or disabled, select another
  // active branch as primary so an activity does not silently lose its main branch.
  if (existingBranchWasPrimary && (!parsed.data.is_primary || !parsed.data.is_active)) {
    const { data: candidate, error: candidateError } = await adminDb
      .from('business_branches')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .neq('id', branchId!)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (candidateError) {
      await logAudit(adminDb, {
        actorUserId: ctx.userId,
        action: 'branch.primary_reassignment_failed',
        entityType: 'business',
        entityId: businessId,
        metadata: { branch_id: branchId, stage: 'lookup' },
      })
      return {
        ok: false,
        error: 'تم حفظ الفرع، لكن تعذر اختيار فرع أساسي بديل. راجع إعدادات الفروع.',
      }
    }

    if (candidate) {
      const { data: promoted, error: promotionError } = await adminDb
        .from('business_branches')
        .update({ is_primary: true })
        .eq('id', candidate.id)
        .eq('business_id', businessId)
        .select('id')
        .maybeSingle()

      if (promotionError || !promoted) {
        await logAudit(adminDb, {
          actorUserId: ctx.userId,
          action: 'branch.primary_reassignment_failed',
          entityType: 'business',
          entityId: businessId,
          metadata: {
            branch_id: branchId,
            candidate_branch_id: candidate.id,
            error: promotionError?.message ?? 'no row updated',
          },
        })
        return {
          ok: false,
          error: 'تم حفظ الفرع، لكن تعذر اختيار فرع أساسي بديل. راجع إعدادات الفروع.',
        }
      }
    }
  }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: branchId ? 'branch.update' : 'branch.create',
    entityType: 'business_branch',
    entityId: savedBranchId ?? businessId,
    metadata: { business_id: businessId, is_primary: parsed.data.is_primary },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true, id: savedBranchId }
}

// ═══ 7. حذف فرع ═══
export async function deleteBranch(branchId: string, businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const uuidSchema = z.string().uuid()
  if (!uuidSchema.safeParse(branchId).success || !uuidSchema.safeParse(businessId).success) {
    return { ok: false, error: 'معرّف النشاط أو الفرع غير صحيح' }
  }

  const { data: branch, error: branchLookupError } = await adminDb
    .from('business_branches')
    .select('id, is_primary')
    .eq('id', branchId)
    .eq('business_id', businessId)
    .maybeSingle()
  if (branchLookupError) return { ok: false, error: 'تعذر التحقق من الفرع' }
  if (!branch) return { ok: false, error: 'الفرع غير تابع للنشاط المحدد أو تم حذفه بالفعل' }

  const { data: deleted, error } = await adminDb
    .from('business_branches')
    .delete()
    .eq('id', branchId)
    .eq('business_id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: 'تعذر حذف الفرع — حاول تاني' }
  if (!deleted) return { ok: false, error: 'الفرع غير موجود أو لم يتم حذفه' }

  if (branch.is_primary) {
    const { data: nextPrimary, error: candidateError } = await adminDb
      .from('business_branches')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (candidateError) {
      await logAudit(adminDb, {
        actorUserId: ctx.userId,
        action: 'branch.delete.primary_reassignment_failed',
        entityType: 'business',
        entityId: businessId,
        metadata: { deleted_branch_id: branchId, stage: 'lookup' },
      })
      return {
        ok: false,
        error: 'تم حذف الفرع الأساسي، لكن تعذر اختيار فرع بديل. راجع إعدادات الفروع.',
      }
    }

    if (nextPrimary) {
      const { data: promoted, error: promoteError } = await adminDb
        .from('business_branches')
        .update({ is_primary: true })
        .eq('id', nextPrimary.id)
        .eq('business_id', businessId)
        .select('id')
        .maybeSingle()

      if (promoteError || !promoted) {
        await logAudit(adminDb, {
          actorUserId: ctx.userId,
          action: 'branch.delete.primary_reassignment_failed',
          entityType: 'business',
          entityId: businessId,
          metadata: {
            deleted_branch_id: branchId,
            candidate_branch_id: nextPrimary.id,
            error: promoteError?.message ?? 'no row updated',
          },
        })
        return {
          ok: false,
          error: 'تم حذف الفرع الأساسي، لكن تعذر تعيين فرع بديل. راجع إعدادات الفروع.',
        }
      }
    }
  }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'branch.delete',
    entityType: 'business_branch',
    entityId: branchId,
    metadata: { business_id: businessId, reassigned_primary: branch.is_primary },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 8. ملحوظة هامة ═══
export async function saveNotice(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const notice = fd(formData, 'important_notice')
  const expiresAt = fd(formData, 'notice_expires_at')
  const severity = fd(formData, 'notice_severity') || 'info'
  const expiresAtIso = toOptionalIsoDate(expiresAt)

  if (notice.length > 500) return { ok: false, error: 'النص طويل (500 حرف كحد أقصى)' }
  if (!['info', 'warning', 'critical'].includes(severity)) {
    return { ok: false, error: 'مستوى التنبيه غير صحيح' }
  }
  if (expiresAtIso === undefined) {
    return { ok: false, error: 'تاريخ انتهاء التنبيه غير صحيح' }
  }

  const { data: updated, error } = await adminDb
    .from('businesses')
    .update({
      important_notice: notice || null,
      notice_expires_at: expiresAtIso,
      notice_severity: severity,
    })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: 'تعذر حفظ التنبيه — راجع البيانات وحاول تاني' }
  if (!updated) return { ok: false, error: 'النشاط مش موجود' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.notice',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 9. حالة الفتح (auto/open/closed) ═══
export async function saveOpenOverride(
  businessId: string,
  override: 'auto' | 'open' | 'closed',
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  if (!['auto', 'open', 'closed'].includes(override)) {
    return { ok: false, error: 'حالة الفتح غير صحيحة' }
  }

  const value = override === 'auto' ? null : override === 'open'

  const { data: updated, error } = await adminDb
    .from('businesses')
    .update({ open_now_override: value })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: 'تعذر حفظ حالة الفتح' }
  if (!updated) return { ok: false, error: 'النشاط مش موجود' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'business.update.open_override',
    entityType: 'business',
    entityId: businessId,
    metadata: { override },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 10. عرض (add/update) ═══
const offerSchema = z.object({
  title: z.string().min(2, 'العنوان قصير').max(120, 'العنوان طويل'),
  description: z.string().max(500).optional().nullable(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .or(z.literal('')),
  image_url: z.string().url().max(500).optional().or(z.literal('')),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  is_published: z.boolean().optional(),
})

export async function saveOffer(
  businessId: string,
  formData: FormData,
  offerId?: string,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const parsed = offerSchema.safeParse({
    title: fd(formData, 'title'),
    description: fd(formData, 'description') || null,
    price: fd(formData, 'price') || undefined,
    image_url: fd(formData, 'image_url') || '',
    starts_at: fd(formData, 'starts_at') || undefined,
    ends_at: fd(formData, 'ends_at') || undefined,
    is_published: fdBool(formData, 'is_published'),
  })
  if (!parsed.success) return parseError(parsed)

  const startsAt = toOptionalIsoDate(parsed.data.starts_at)
  const endsAt = toOptionalIsoDate(parsed.data.ends_at)
  if (startsAt === undefined || endsAt === undefined) {
    return { ok: false, error: 'تاريخ بداية أو انتهاء العرض غير صحيح' }
  }
  if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    return { ok: false, error: 'تاريخ الانتهاء لازم يكون بعد البداية' }
  }

  const payload = {
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price ? parseFloat(parsed.data.price) : null,
    image_url: parsed.data.image_url || null,
    starts_at: startsAt,
    ends_at: endsAt,
    is_published: parsed.data.is_published ?? false,
  }

  if (offerId) {
    const { data: updated, error } = await adminDb
      .from('offers')
      .update(payload)
      .eq('id', offerId)
      .eq('business_id', businessId)
      .select('id')
      .maybeSingle()
    if (error) return { ok: false, error: 'تعذر حفظ العرض — راجع البيانات وحاول تاني' }
    if (!updated) return { ok: false, error: 'العرض مش موجود داخل النشاط المحدد' }
  } else {
    const { data: created, error } = await adminDb
      .from('offers')
      .insert({ ...payload, business_id: businessId })
      .select('id')
      .maybeSingle()
    if (error) return { ok: false, error: 'تعذر إضافة العرض — راجع البيانات وحاول تاني' }
    if (!created) return { ok: false, error: 'تعذر إضافة العرض — حاول تاني' }
  }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: offerId ? 'offer.update' : 'offer.create',
    entityType: 'offer',
    entityId: offerId ?? businessId,
    metadata: { business_id: businessId, title: payload.title },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 11. حذف عرض ═══
export async function deleteOffer(offerId: string, businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: deleted, error } = await adminDb
    .from('offers')
    .delete()
    .eq('id', offerId)
    .eq('business_id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: 'تعذر حذف العرض' }
  if (!deleted) return { ok: false, error: 'العرض مش موجود داخل النشاط المحدد' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'offer.delete',
    entityType: 'offer',
    entityId: offerId,
    metadata: { business_id: businessId },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 12. نشر/إخفاء عرض ═══
export async function toggleOfferPublished(
  offerId: string,
  businessId: string,
  next: boolean,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'عمليات تعديل النشاط غير متاحة مؤقتًا — حاول تاني' }

  const { data: updated, error } = await adminDb
    .from('offers')
    .update({ is_published: next })
    .eq('id', offerId)
    .eq('business_id', businessId)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: 'تعذر تغيير حالة العرض' }
  if (!updated) return { ok: false, error: 'العرض مش موجود داخل النشاط المحدد' }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: next ? 'offer.publish' : 'offer.unpublish',
    entityType: 'offer',
    entityId: offerId,
    metadata: { business_id: businessId },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}
