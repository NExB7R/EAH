'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { randomBytes } from 'crypto'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { applySchema, resolveWhatsappNumber } from '@/lib/validations/merchant'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Application Action
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true; slug: string } | { ok: false; error: string }

function makeSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
  const suffix = randomBytes(8).toString('hex')
  return `${base}-${suffix}`
}

async function rollbackMerchantApplication(businessId: string): Promise<boolean> {
  try {
    const service = createServiceClient()
    const [subscriptions, contacts] = await Promise.all([
      service.from('business_subscriptions').delete().eq('business_id', businessId),
      service.from('business_contact_methods').delete().eq('business_id', businessId),
    ])
    const business = await service.from('businesses').delete().eq('id', businessId)

    const ok = !subscriptions.error && !contacts.error && !business.error
    if (!ok) {
      console.error('[merchant-apply] rollback incomplete', {
        businessId,
        subscriptions: subscriptions.error?.message,
        contacts: contacts.error?.message,
        business: business.error?.message,
      })
    }
    return ok
  } catch (error) {
    console.error('[merchant-apply] rollback unavailable', {
      businessId,
      error: (error as Error).message,
    })
    return false
  }
}

export async function submitMerchantApplication(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'لازم تسجل دخول الأول' }
  }

  const rateLimit = await checkRateLimit(strictLimiter, `merchant-apply:${user.id}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    return { ok: false, error: rateLimit.error }
  }

  const { data: currentRole, error: roleLookupError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleLookupError || !currentRole) {
    return { ok: false, error: 'تعذر التحقق من صلاحيات الحساب — حاول تاني' }
  }
  if (currentRole.role === 'admin' || currentRole.role === 'super_admin') {
    return { ok: false, error: 'الحسابات الإدارية تنشئ الأنشطة من لوحة الإدارة' }
  }
  if (currentRole.role !== 'customer' && currentRole.role !== 'merchant') {
    return { ok: false, error: 'الحساب غير مؤهل لتقديم طلب نشاط' }
  }

  // 2. فحص إنه مش عنده نشاط بالفعل
  const { data: existing, error: existingLookupError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existingLookupError) {
    return { ok: false, error: 'تعذر التحقق من الأنشطة المرتبطة بحسابك — حاول تاني' }
  }
  if (existing) {
    return { ok: false, error: 'عندك نشاط مسجّل بالفعل' }
  }

  // 3. استخرج البيانات
  const lat = formData.get('latitude')
  const lng = formData.get('longitude')

  const raw = {
    name: formData.get('name')?.toString() ?? '',
    business_type: formData.get('business_type')?.toString() ?? '',
    custom_business_type: formData.get('custom_business_type')?.toString() ?? '',
    area: formData.get('area')?.toString() ?? '',
    city: formData.get('city')?.toString() || 'شبين القناطر',
    description: formData.get('description')?.toString() ?? '',
    hook: formData.get('hook')?.toString() || null,
    phone: formData.get('phone')?.toString() ?? '',
    whatsapp: formData.get('whatsapp')?.toString() || null,
    facebook: formData.get('facebook')?.toString() || null,
    instagram: formData.get('instagram')?.toString() || null,
    address_text: formData.get('address_text')?.toString() ?? '',
    latitude: lat && lat !== '' ? Number(lat) : null,
    longitude: lng && lng !== '' ? Number(lng) : null,
    agree_terms: formData.get('agree_terms') === 'true',
  }

  const parsed = applySchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? 'بيانات غلط' }
  }

  const data = parsed.data

  // Check the required free plan before creating any records, otherwise the
  // application could return success without the subscription it promises.
  const { data: basicPlan, error: basicPlanError } = await supabase
    .from('subscription_plans')
    .select('id, duration_days')
    .eq('code', 'basic')
    .maybeSingle()

  if (basicPlanError || !basicPlan) {
    return { ok: false, error: 'التسجيل غير متاح مؤقتًا — تعذر تجهيز الباقة الأساسية' }
  }

  // RLS intentionally keeps contacts/subscription writes and role changes out
  // of ordinary sessions. Use the service client only after authenticating the
  // applicant and limiting later writes to this exact user and new business.
  let privileged: ReturnType<typeof createServiceClient>
  try {
    privileged = createServiceClient()
  } catch {
    return { ok: false, error: 'التسجيل غير متاح مؤقتًا — تعذر تجهيز خدمة الحفظ الآمنة' }
  }

  // 4. أنشئ النشاط
  const slug = makeSlug(data.name)

  const { data: created, error: bizErr } = await privileged
    .from('businesses')
    .insert({
      name: data.name,
      slug,
      business_type: data.business_type,
      custom_business_type:
        data.business_type === 'misc' ? data.custom_business_type?.trim() || null : null,
      business_type_status: data.business_type === 'misc' ? 'pending' : 'approved',
      area: data.area,
      city: data.city,
      description: data.description,
      hook: data.hook ?? null,
      address_text: data.address_text,
      owner_profile_id: user.id,
      source: 'merchant',
      is_published: false,
      is_open: true,
      accepts_whatsapp_orders: !!data.whatsapp || !!data.phone,
    })
    .select('id')
    .single()

  if (bizErr || !created) {
    console.error('[merchant-apply] business insert failed:', bizErr?.message ?? 'No row returned')
    return { ok: false, error: 'تعذر إنشاء طلب النشاط. راجع البيانات وحاول تاني' }
  }

  const businessId = created.id

  // The public detail/search queries use business_locations as the canonical
  // geolocation source. Do not only populate legacy latitude/longitude columns.
  if (data.latitude != null && data.longitude != null) {
    const { error: locationError } = await privileged.from('business_locations').insert({
      business_id: businessId,
      address_text: data.address_text,
      latitude: data.latitude,
      longitude: data.longitude,
      is_primary: true,
    })

    if (locationError) {
      const rolledBack = await rollbackMerchantApplication(businessId)
      return {
        ok: false,
        error: rolledBack
          ? 'تعذر حفظ موقع النشاط؛ تم إلغاء الطلب غير المكتمل'
          : 'تعذر حفظ موقع النشاط والتراجع عنه تلقائيًا. تواصل مع الدعم قبل إعادة المحاولة',
      }
    }
  }

  // 5. أضف طرق التواصل
  const contacts: Array<{ method_type: string; value: string; is_primary: boolean }> = []
  if (data.phone) contacts.push({ method_type: 'phone', value: data.phone, is_primary: true })
  const whatsappNumber = resolveWhatsappNumber(data.phone, data.whatsapp)
  if (whatsappNumber) {
    contacts.push({ method_type: 'whatsapp', value: whatsappNumber, is_primary: false })
  }
  if (data.facebook)
    contacts.push({ method_type: 'facebook', value: data.facebook, is_primary: false })
  if (data.instagram)
    contacts.push({ method_type: 'instagram', value: data.instagram, is_primary: false })

  if (contacts.length === 0) {
    const rolledBack = await rollbackMerchantApplication(businessId)
    return {
      ok: false,
      error: rolledBack
        ? 'لازم رقم تواصل صحيح للنشاط؛ تم إلغاء الطلب غير المكتمل'
        : 'تعذر إكمال الطلب أو التراجع عنه تلقائيًا. تواصل مع الدعم قبل إعادة المحاولة',
    }
  }

  const { error: contactsError } = await privileged.from('business_contact_methods').insert(
    contacts.map((c) => ({
      business_id: businessId,
      method_type: c.method_type,
      value: c.value,
      is_primary: c.is_primary,
      is_public: true,
    })),
  )

  if (contactsError) {
    const rolledBack = await rollbackMerchantApplication(businessId)
    return {
      ok: false,
      error: rolledBack
        ? 'تعذر حفظ بيانات التواصل؛ تم إلغاء الطلب. راجع الأرقام وحاول تاني'
        : 'تعذر حفظ بيانات التواصل والتراجع التلقائي. تواصل مع الدعم قبل إعادة المحاولة',
    }
  }

  // 6. أنشئ اشتراك أساسي مجاني (بدون تجربة — مجاني للأبد)
  const startsAt = new Date()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (basicPlan.duration_days ?? 3650))

  const { error: subscriptionError } = await privileged.from('business_subscriptions').insert({
    business_id: businessId,
    plan_id: basicPlan.id,
    status: 'active',
    is_trial: false,
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  })

  if (subscriptionError) {
    const rolledBack = await rollbackMerchantApplication(businessId)
    return {
      ok: false,
      error: rolledBack
        ? 'تعذر تفعيل الباقة الأساسية؛ تم إلغاء الطلب. حاول تاني بعد قليل'
        : 'تعذر تفعيل الباقة الأساسية والتراجع التلقائي. تواصل مع الدعم قبل إعادة المحاولة',
    }
  }

  // The table has one row per user_id, so update the existing customer role
  // rather than upserting on a non-existent (user_id, role) unique key.
  if (currentRole.role === 'customer') {
    const { data: promoted, error: promoteError } = await privileged
      .from('user_roles')
      .update({ role: 'merchant' })
      .eq('user_id', user.id)
      .eq('role', 'customer')
      .select('user_id')
      .maybeSingle()

    let promotionSucceeded = !promoteError && !!promoted
    if (!promotionSucceeded) {
      const { data: verifiedRole, error: verifyError } = await privileged
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
      promotionSucceeded = !verifyError && verifiedRole?.role === 'merchant'
    }

    if (!promotionSucceeded) {
      const rolledBack = await rollbackMerchantApplication(businessId)
      // If the write may have succeeded but its response was lost, restore the
      // prior role when the application records have been rolled back.
      if (rolledBack) {
        const { error: roleRollbackError } = await privileged
          .from('user_roles')
          .update({ role: 'customer' })
          .eq('user_id', user.id)
          .eq('role', 'merchant')
        if (roleRollbackError) {
          console.error('[merchant-apply] role rollback incomplete', {
            userId: user.id,
            error: roleRollbackError.message,
          })
        }
      }

      return {
        ok: false,
        error: rolledBack
          ? 'تعذر تفعيل حساب البايع؛ تم إلغاء الطلب. حاول تاني'
          : 'تعذر تفعيل حساب البايع والتراجع التلقائي. تواصل مع الدعم قبل إعادة المحاولة',
      }
    }
  }

  return { ok: true, slug }
}
