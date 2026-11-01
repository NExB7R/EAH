'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/logging/audit'
import { hasUsableWhatsAppDestination } from '@/lib/data/contact-availability-utils'

type Result = { ok: true } | { ok: false; error: string }

const phoneSchema = z
  .string()
  .max(20)
  .refine(
    (value) => value === '' || /^0\d{9,12}$/.test(value),
    'رقم الهاتف لازم يبدأ بـ 0 ويكون من 10 إلى 13 رقم',
  )

const schema = z
  .object({
    name: z.string().min(2, 'الاسم قصير').max(80),
    area: z.string().max(50),
    description: z.string().max(500),
    hook: z.string().max(120),
    address_text: z.string().max(200),
    phoneNumbers: z.array(phoneSchema).max(10),
    whatsappNumbers: z.array(phoneSchema).max(10),
    is_open: z.boolean(),
    accepts_whatsapp_orders: z.boolean(),
    business_type: z.enum(['restaurant', 'pharmacy', 'delivery_office', 'misc']),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .superRefine((data, ctx) => {
    const hasLatitude = data.latitude !== null
    const hasLongitude = data.longitude !== null
    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitude'],
        message: 'لازم تدخل خط العرض وخط الطول مع بعض، أو تسيب الاتنين فاضيين',
      })
    }
    const allNumbers = [...data.phoneNumbers, ...data.whatsappNumbers]
    if (allNumbers.length > 15) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phoneNumbers'],
        message: 'الحد الأقصى 15 رقم تواصل للنشاط',
      })
    }
    if (new Set(allNumbers).size !== allNumbers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phoneNumbers'],
        message: 'فيه رقم مكرر بين الهاتف والواتساب',
      })
    }
  })

function readContactNumbers(formData: FormData, listKey: string, legacyKey: string): unknown[] {
  const submitted = formData.getAll(listKey)
  const values = submitted.length > 0 ? submitted : [formData.get(legacyKey)]
  return values
    .filter((value) => value !== null)
    .map((value) => (typeof value === 'string' ? value.trim() : value))
    .filter((value) => value !== '')
}

async function myBiz() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false as const, error: 'لازم تسجل بحساب مسجل الأول' }

  const { data: biz, error } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) return { ok: false as const, error: 'تعذر تحميل نشاطك دلوقتي — حاول تاني' }
  if (!biz) return { ok: false as const, error: 'مفيش نشاط مرتبط بحسابك' }
  return { ok: true as const, supabase, userId: user.id, biz }
}

function invalidateBusiness(slug: string) {
  revalidatePath('/merchant')
  revalidatePath('/merchant/business')
  revalidatePath('/explore')
  revalidatePath(`/businesses/${slug}`)
  revalidateTag('businesses', 'default')
}

export async function updateMyBusiness(formData: FormData): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parseCoord = (raw: string): number | null => {
    const value = raw.trim()
    if (!value) return null
    return Number(value)
  }

  const parsed = schema.safeParse({
    name: String(formData.get('name') ?? '').trim(),
    area: String(formData.get('area') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    hook: String(formData.get('hook') ?? '').trim(),
    address_text: String(formData.get('address_text') ?? '').trim(),
    phoneNumbers: readContactNumbers(formData, 'phone_numbers', 'phone'),
    whatsappNumbers: readContactNumbers(formData, 'whatsapp_numbers', 'whatsapp'),
    is_open: formData.get('is_open') === 'on',
    accepts_whatsapp_orders: formData.get('accepts_whatsapp_orders') === 'on',
    business_type: String(formData.get('business_type') ?? '').trim(),
    latitude: parseCoord(String(formData.get('latitude') ?? '')),
    longitude: parseCoord(String(formData.get('longitude') ?? '')),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  let admin: ReturnType<typeof createServiceClient>
  try {
    // Privileged writes are scoped to the business discovered from the authenticated
    // user's own owner_profile_id above. The form cannot choose a business ID or owner.
    admin = createServiceClient()
  } catch {
    return { ok: false, error: 'حفظ التعديلات غير متاح مؤقتًا — حاول تاني بعد شوية' }
  }

  const d = parsed.data
  let hasActiveBranchWhatsApp = false
  if (d.accepts_whatsapp_orders && !d.whatsappNumbers.some(hasUsableWhatsAppDestination)) {
    const { data: activeBranches, error: branchLookupError } = await admin
      .from('business_branches')
      .select('whatsapp')
      .eq('business_id', ctx.biz.id)
      .eq('is_active', true)

    if (branchLookupError) {
      return { ok: false, error: 'تعذر التحقق من أرقام واتساب للفروع — لم يتم حفظ التعديلات' }
    }
    hasActiveBranchWhatsApp = (activeBranches ?? []).some((branch) =>
      hasUsableWhatsAppDestination(branch.whatsapp),
    )
  }

  const patch = {
    name: d.name,
    business_type: d.business_type,
    area: d.area || null,
    description: d.description || null,
    hook: d.hook || null,
    address_text: d.address_text || null,
    is_open: d.is_open,
    accepts_whatsapp_orders:
      d.accepts_whatsapp_orders &&
      (d.whatsappNumbers.some(hasUsableWhatsAppDestination) || hasActiveBranchWhatsApp),
  }

  // businesses currently has an owner SELECT policy but no owner UPDATE policy.
  // Use the service client only after identity and ownership were verified above.
  const { data: updatedBusiness, error: updateError } = await admin
    .from('businesses')
    .update(patch)
    .eq('id', ctx.biz.id)
    .eq('owner_profile_id', ctx.userId)
    .select('id')
    .limit(1)
    .maybeSingle()

  if (updateError) return { ok: false, error: 'تعذر حفظ بيانات النشاط — راجع البيانات وحاول تاني' }
  if (!updatedBusiness)
    return { ok: false, error: 'مقدرناش نثبت ملكيتك للنشاط وقت الحفظ. حدّث الصفحة وحاول تاني' }

  // Keep the canonical geolocation in business_locations, which powers maps,
  // distance badges, and the "nearby" filter. Never write latitude/longitude
  // columns onto businesses.
  const { data: primaryLocations, error: locationLookupError } = await admin
    .from('business_locations')
    .select('id')
    .eq('business_id', ctx.biz.id)
    .eq('is_primary', true)
    .order('created_at', { ascending: true })
    .limit(10)

  if (locationLookupError) {
    invalidateBusiness(ctx.biz.slug)
    return {
      ok: false,
      error: 'اتحفظت البيانات الأساسية، لكن تعذر قراءة موقع النشاط. حاول حفظ الموقع مرة تانية',
    }
  }

  const existingLocation = primaryLocations?.[0]
  if (d.latitude !== null && d.longitude !== null) {
    if (existingLocation) {
      const { error } = await admin
        .from('business_locations')
        .update({
          latitude: d.latitude,
          longitude: d.longitude,
          address_text: d.address_text || null,
          is_primary: true,
        })
        .eq('id', existingLocation.id)
        .eq('business_id', ctx.biz.id)

      if (error) {
        invalidateBusiness(ctx.biz.slug)
        return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر حفظ موقع النشاط. حاول تاني' }
      }
    } else {
      const { error } = await admin.from('business_locations').insert({
        business_id: ctx.biz.id,
        latitude: d.latitude,
        longitude: d.longitude,
        address_text: d.address_text || null,
        is_primary: true,
      })

      if (error) {
        invalidateBusiness(ctx.biz.slug)
        return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر حفظ موقع النشاط. حاول تاني' }
      }
    }

    const duplicateIds = (primaryLocations ?? [])
      .slice(existingLocation ? 1 : 0)
      .map((item) => item.id)
    if (duplicateIds.length > 0) {
      const { error } = await admin.from('business_locations').delete().in('id', duplicateIds)
      if (error) {
        invalidateBusiness(ctx.biz.slug)
        return {
          ok: false,
          error: 'الموقع اتحفظ، لكن تعذر تنظيف المواقع المكررة. راجع الإدارة لو تكررت المشكلة',
        }
      }
    }
  } else if ((primaryLocations ?? []).length > 0) {
    const { error } = await admin
      .from('business_locations')
      .delete()
      .eq('business_id', ctx.biz.id)
      .eq('is_primary', true)

    if (error) {
      invalidateBusiness(ctx.biz.slug)
      return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر مسح الموقع القديم' }
    }
  }

  // RLS keeps contact writes out of ordinary sessions. Ownership was verified
  // by myBiz() above; scope the privileged replacement to this exact business.
  const { data: previousContacts, error: contactsLookupError } = await admin
    .from('business_contact_methods')
    .select('id, business_id, method_type, value, is_primary, is_public, label, sort_order')
    .eq('business_id', ctx.biz.id)
    .in('method_type', ['phone', 'whatsapp'])

  if (contactsLookupError) {
    invalidateBusiness(ctx.biz.slug)
    return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر قراءة أرقام التواصل' }
  }

  const previousByKey = new Map(
    (previousContacts ?? []).map((contact) => [`${contact.method_type}:${contact.value}`, contact]),
  )
  const previousPhones = (previousContacts ?? [])
    .filter((contact) => contact.method_type === 'phone')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const previousWhatsapps = (previousContacts ?? [])
    .filter((contact) => contact.method_type === 'whatsapp')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const nextContacts = [
    ...d.phoneNumbers.map((value, index) => {
      const previous = previousByKey.get(`phone:${value}`) ?? previousPhones[index]
      return {
        business_id: ctx.biz.id,
        method_type: 'phone',
        value,
        is_primary: index === 0,
        is_public: previous?.is_public ?? true,
        label: previous?.label ?? null,
        sort_order: previous?.sort_order ?? index,
      }
    }),
    ...d.whatsappNumbers.map((value, index) => {
      const previous = previousByKey.get(`whatsapp:${value}`) ?? previousWhatsapps[index]
      return {
        business_id: ctx.biz.id,
        method_type: 'whatsapp',
        value,
        is_primary: false,
        is_public: previous?.is_public ?? true,
        label: previous?.label ?? null,
        sort_order: previous?.sort_order ?? index,
      }
    }),
  ]

  const { error: clearContactsError } = await admin
    .from('business_contact_methods')
    .delete()
    .eq('business_id', ctx.biz.id)
    .in('method_type', ['phone', 'whatsapp'])

  if (clearContactsError) {
    invalidateBusiness(ctx.biz.slug)
    return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر تجهيز أرقام التواصل للحفظ' }
  }

  if (nextContacts.length > 0) {
    const { error: saveContactsError } = await admin
      .from('business_contact_methods')
      .insert(nextContacts)

    if (saveContactsError) {
      const { error: clearPartialError } = await admin
        .from('business_contact_methods')
        .delete()
        .eq('business_id', ctx.biz.id)
        .in('method_type', ['phone', 'whatsapp'])
      const { error: restoreContactsError } =
        previousContacts && previousContacts.length > 0
          ? await admin.from('business_contact_methods').insert(previousContacts)
          : { error: null }

      invalidateBusiness(ctx.biz.slug)
      return {
        ok: false,
        error:
          clearPartialError || restoreContactsError
            ? 'تعذر حفظ أرقام التواصل ولم يكتمل الاسترجاع التلقائي. راجع النشاط قبل إعادة المحاولة'
            : 'تعذر حفظ أرقام التواصل، وتمت استعادة الأرقام السابقة. تأكد أن الرقم غير مستخدم في نشاط آخر',
      }
    }
  }

  await logAudit(admin, {
    actorUserId: ctx.userId,
    action: 'business.update.merchant',
    entityType: 'business',
    entityId: ctx.biz.id,
    metadata: { fields: ['name', 'business_type', 'location', 'contacts', 'is_open'] },
  })

  invalidateBusiness(ctx.biz.slug)
  return { ok: true }
}
