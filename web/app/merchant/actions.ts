'use server'

import { createClient } from '@/lib/supabase/server'
import { applySchema } from '@/lib/validations/merchant'

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
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`
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

  // 2. فحص إنه مش عنده نشاط بالفعل
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return { ok: false, error: 'عندك نشاط مسجّل بالفعل' }
  }

  // 3. استخرج البيانات
  const lat = formData.get('latitude')
  const lng = formData.get('longitude')

  const raw = {
    name: formData.get('name')?.toString() ?? '',
    business_type: formData.get('business_type')?.toString() ?? '',
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

  // 4. أنشئ النشاط
  const slug = makeSlug(data.name)

  const { data: created, error: bizErr } = await supabase
    .from('businesses')
    .insert({
      name: data.name,
      slug,
      business_type: data.business_type,
      area: data.area,
      city: data.city,
      description: data.description,
      hook: data.hook ?? null,
      address_text: data.address_text,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      owner_profile_id: user.id,
      is_published: false,
      is_open: true,
      accepts_whatsapp_orders: !!data.whatsapp || !!data.phone,
    })
    .select('id')
    .single()

  if (bizErr || !created) {
    return { ok: false, error: bizErr?.message ?? 'حصل خطأ' }
  }

  const businessId = created.id

  // 5. أضف طرق التواصل
  const contacts: Array<{ method_type: string; value: string; is_primary: boolean }> = []
  if (data.phone) contacts.push({ method_type: 'phone', value: data.phone, is_primary: true })
  if (data.whatsapp)
    contacts.push({ method_type: 'whatsapp', value: data.whatsapp, is_primary: false })
  if (data.facebook)
    contacts.push({ method_type: 'facebook', value: data.facebook, is_primary: false })
  if (data.instagram)
    contacts.push({ method_type: 'instagram', value: data.instagram, is_primary: false })

  if (contacts.length > 0) {
    await supabase.from('business_contact_methods').insert(
      contacts.map((c) => ({
        business_id: businessId,
        method_type: c.method_type,
        value: c.value,
        is_primary: c.is_primary,
        is_public: true,
      })),
    )
  }

  // 6. رقّيه لـ merchant
  await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'merchant' }, { onConflict: 'user_id,role' })

  // 7. أنشئ اشتراك أساسي مجاني (بدون تجربة — مجاني للأبد)
  const { data: basicPlan } = await supabase
    .from('subscription_plans')
    .select('id, duration_days')
    .eq('code', 'basic')
    .single()

  if (basicPlan) {
    const startsAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (basicPlan.duration_days ?? 3650))

    await supabase.from('business_subscriptions').insert({
      business_id: businessId,
      plan_id: basicPlan.id,
      status: 'active',
      is_trial: false,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
  }

  return { ok: true, slug }
}
