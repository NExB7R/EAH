'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'
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

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }

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

// ═══ 1. الأساسيات ═══
export async function saveBasics(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

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

  const { error } = await ctx.supabase.from('businesses').update(parsed.data).eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update.basics',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 2. التواصل ═══
export async function saveContacts(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = contactsSchema.safeParse({
    phone: fd(formData, 'phone'),
    whatsapp: fd(formData, 'whatsapp'),
    facebook: fd(formData, 'facebook'),
    instagram: fd(formData, 'instagram'),
    website: fd(formData, 'website'),
  })
  if (!parsed.success) return parseError(parsed)

  const extendedTypes = ['complaints', 'manager', 'shift_morning', 'shift_evening'] as const
  const extendedValues: Record<string, string> = {}
  for (const type of extendedTypes) {
    const value = fd(formData, type)
    if (value && !/^0\d{9,12}$/.test(value)) {
      return { ok: false, error: 'رقم غير صحيح — لازم يبدأ بـ 0 ويكون 10-13 رقم' }
    }
    extendedValues[type] = value
  }

  const MANAGED_TYPES = [
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

  // Delete only managed types (preserve 'additional' and any future types)
  const { error: delError } = await ctx.supabase
    .from('business_contact_methods')
    .delete()
    .eq('business_id', businessId)
    .in('method_type', MANAGED_TYPES)
  if (delError) return { ok: false, error: delError.message }

  const rows: { business_id: string; method_type: string; value: string; is_primary: boolean }[] =
    []
  if (parsed.data.phone) {
    rows.push({
      business_id: businessId,
      method_type: 'phone',
      value: parsed.data.phone,
      is_primary: true,
    })
  }
  if (parsed.data.whatsapp) {
    rows.push({
      business_id: businessId,
      method_type: 'whatsapp',
      value: parsed.data.whatsapp,
      is_primary: false,
    })
  }
  if (parsed.data.facebook) {
    rows.push({
      business_id: businessId,
      method_type: 'facebook',
      value: parsed.data.facebook,
      is_primary: false,
    })
  }
  if (parsed.data.instagram) {
    rows.push({
      business_id: businessId,
      method_type: 'instagram',
      value: parsed.data.instagram,
      is_primary: false,
    })
  }
  if (parsed.data.website) {
    rows.push({
      business_id: businessId,
      method_type: 'website',
      value: parsed.data.website,
      is_primary: false,
    })
  }
  for (const type of extendedTypes) {
    const value = extendedValues[type]
    if (value) {
      rows.push({ business_id: businessId, method_type: type, value, is_primary: false })
    }
  }

  if (rows.length > 0) {
    const { error } = await ctx.supabase.from('business_contact_methods').insert(rows)
    if (error) return { ok: false, error: error.message }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update.contacts',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  return { ok: true }
}

// ═══ 3. الموقع ═══
export async function saveLocation(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

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

  // حذف الموقع الأساسي القديم
  await ctx.supabase
    .from('business_locations')
    .delete()
    .eq('business_id', businessId)
    .eq('is_primary', true)

  // إضافة موقع جديد
  if (hasLat && hasLng) {
    const { error } = await ctx.supabase.from('business_locations').insert({
      business_id: businessId,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address_text: parsed.data.address_text ?? null,
      is_primary: true,
    })
    if (error) return { ok: false, error: error.message }
  }

  // تحديث address_text و map_url على business
  await ctx.supabase
    .from('businesses')
    .update({
      address_text: parsed.data.address_text ?? null,
      map_url: parsed.data.map_url ?? null,
    })
    .eq('id', businessId)

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update.location',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 4. أوقات العمل ═══
export async function saveHours(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
  const raw: Record<string, { open: string; close: string } | null> = {}
  for (const day of days) {
    const open = fd(formData, `${day}_open`)
    const close = fd(formData, `${day}_close`)
    raw[day] = open && close ? { open, close } : null
  }

  const parsed = hoursSchema.safeParse(raw)
  if (!parsed.success) return parseError(parsed)

  const { error } = await ctx.supabase
    .from('businesses')
    .update({ working_hours: parsed.data })
    .eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
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

  const parsed = settingsSchema.safeParse({
    is_published: fdBool(formData, 'is_published'),
    is_open: fdBool(formData, 'is_open'),
    accepts_whatsapp_orders: fdBool(formData, 'accepts_whatsapp_orders'),
    is_featured: fdBool(formData, 'is_featured'),
    featured_order: fd(formData, 'featured_order') || '0',
    featured_pin: fdBool(formData, 'featured_pin'),
    featured_until: fd(formData, 'featured_until'),
    is_new_project: fdBool(formData, 'is_new_project'),
    new_until: fd(formData, 'new_until'),
  })
  if (!parsed.success) return parseError(parsed)

  // WhatsApp gate: لا يمكن تفعيل استلام الأوردرات بدون رقم واتساب
  if (parsed.data.accepts_whatsapp_orders) {
    const { data: wa } = await ctx.supabase
      .from('business_contact_methods')
      .select('value')
      .eq('business_id', businessId)
      .eq('method_type', 'whatsapp')
      .limit(1)
    if (!wa || wa.length === 0) {
      return {
        ok: false,
        error:
          'مينفعش تفعّل استلام أوردرات واتساب قبل إضافة رقم واتساب. ضيف الرقم من قسم التواصل الأول.',
      }
    }
  }

  const { error } = await ctx.supabase.from('businesses').update(parsed.data).eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update.settings',
    entityType: 'business',
    entityId: businessId,
    metadata: parsed.data as Record<string, unknown>,
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

  const parsed = branchSchema.safeParse({
    name: fd(formData, 'name'),
    area: fd(formData, 'area'),
    address_text: fd(formData, 'address_text'),
    latitude: fd(formData, 'latitude') || null,
    longitude: fd(formData, 'longitude') || null,
    phone: fd(formData, 'phone'),
    whatsapp: fd(formData, 'whatsapp'),
    is_primary: fdBool(formData, 'is_primary'),
    is_active: fdBool(formData, 'is_active') || true,
    sort_order: fd(formData, 'sort_order') || '0',
  })
  if (!parsed.success) return parseError(parsed)

  const hasLat = parsed.data.latitude !== null && parsed.data.latitude !== undefined
  const hasLng = parsed.data.longitude !== null && parsed.data.longitude !== undefined
  if (hasLat !== hasLng) return { ok: false, error: 'لازم الإحداثيين مع بعض أو الاتنين فاضيين' }

  // لو is_primary=true، نشيل الأساسي من الباقي
  if (parsed.data.is_primary) {
    await ctx.supabase
      .from('business_branches')
      .update({ is_primary: false })
      .eq('business_id', businessId)
  }

  if (branchId) {
    const { error } = await ctx.supabase
      .from('business_branches')
      .update(parsed.data)
      .eq('id', branchId)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await ctx.supabase
      .from('business_branches')
      .insert({ ...parsed.data, business_id: businessId })
    if (error) return { ok: false, error: error.message }
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: branchId ? 'branch.update' : 'branch.create',
    entityType: 'business_branch',
    entityId: branchId ?? businessId,
    metadata: { business_id: businessId },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 7. حذف فرع ═══
export async function deleteBranch(branchId: string, businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase.from('business_branches').delete().eq('id', branchId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'branch.delete',
    entityType: 'business_branch',
    entityId: branchId,
    metadata: { business_id: businessId },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 8. ربط المالك ═══
export async function saveOwner(businessId: string, ownerProfileId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!ownerProfileId) return { ok: false, error: 'اختر صاحب النشاط' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({ owner_profile_id: ownerProfileId })
    .eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  // تأكد من role=merchant
  const { data: existing } = await ctx.supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', ownerProfileId)
    .maybeSingle()

  if (!existing) {
    await ctx.supabase.from('user_roles').insert({ user_id: ownerProfileId, role: 'merchant' })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update.owner',
    entityType: 'business',
    entityId: businessId,
    metadata: { owner_profile_id: ownerProfileId },
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  return { ok: true }
}

// ═══ 9. ملحوظة هامة ═══
export async function saveNotice(businessId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const notice = fd(formData, 'important_notice')
  const expiresAt = fd(formData, 'notice_expires_at')
  const severity = fd(formData, 'notice_severity') || 'info'

  if (notice.length > 500) return { ok: false, error: 'النص طويل (500 حرف كحد أقصى)' }
  if (!['info', 'warning', 'critical'].includes(severity)) {
    return { ok: false, error: 'مستوى التنبيه غير صحيح' }
  }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      important_notice: notice || null,
      notice_expires_at: expiresAt || null,
      notice_severity: severity,
    })
    .eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business.update.notice',
    entityType: 'business',
    entityId: businessId,
  })
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')
  return { ok: true }
}

// ═══ 10. حالة الفتح (auto/open/closed) ═══
export async function saveOpenOverride(
  businessId: string,
  override: 'auto' | 'open' | 'closed',
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const value = override === 'auto' ? null : override === 'open'

  const { error } = await ctx.supabase
    .from('businesses')
    .update({ open_now_override: value })
    .eq('id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
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

// ═══ 11. عرض (add/update) ═══
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

  const startsAt = parsed.data.starts_at ? new Date(parsed.data.starts_at).toISOString() : null
  const endsAt = parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
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
    const { error } = await ctx.supabase
      .from('offers')
      .update(payload)
      .eq('id', offerId)
      .eq('business_id', businessId)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await ctx.supabase
      .from('offers')
      .insert({ ...payload, business_id: businessId })
    if (error) return { ok: false, error: error.message }
  }

  await logAudit(ctx.supabase, {
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

// ═══ 12. حذف عرض ═══
export async function deleteOffer(offerId: string, businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('offers')
    .delete()
    .eq('id', offerId)
    .eq('business_id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
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

// ═══ 13. نشر/إخفاء عرض ═══
export async function toggleOfferPublished(
  offerId: string,
  businessId: string,
  next: boolean,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('offers')
    .update({ is_published: next })
    .eq('id', offerId)
    .eq('business_id', businessId)
  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
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
