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
    phone: phoneSchema,
    whatsapp: phoneSchema,
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
  })

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
    phone: String(formData.get('phone') ?? '').trim(),
    whatsapp: String(formData.get('whatsapp') ?? '').trim(),
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
  if (d.accepts_whatsapp_orders && !hasUsableWhatsAppDestination(d.whatsapp)) {
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
      (hasUsableWhatsAppDestination(d.whatsapp) || hasActiveBranchWhatsApp),
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

  // RLS intentionally exposes contact methods for reading but does not let a
  // merchant insert/update them directly. Verify ownership first, then scope each
  // service-role operation to this business and these two editable contact kinds.
  const contactMethods = [
    { method_type: 'phone', value: d.phone, is_primary: true },
    { method_type: 'whatsapp', value: d.whatsapp, is_primary: false },
  ] as const

  for (const contact of contactMethods) {
    const { data: existingRows, error: contactLookupError } = await admin
      .from('business_contact_methods')
      .select('id')
      .eq('business_id', ctx.biz.id)
      .eq('method_type', contact.method_type)

    if (contactLookupError) {
      invalidateBusiness(ctx.biz.slug)
      return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر قراءة أرقام التواصل' }
    }

    if (!contact.value) {
      const { error } = await admin
        .from('business_contact_methods')
        .delete()
        .eq('business_id', ctx.biz.id)
        .eq('method_type', contact.method_type)

      if (error) {
        invalidateBusiness(ctx.biz.slug)
        return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر حذف رقم التواصل الفارغ' }
      }
      continue
    }

    const [existing, ...duplicates] = existingRows ?? []
    if (existing) {
      const { error } = await admin
        .from('business_contact_methods')
        .update({
          value: contact.value,
          is_public: true,
          is_primary: contact.is_primary,
        })
        .eq('id', existing.id)
        .eq('business_id', ctx.biz.id)

      if (error) {
        invalidateBusiness(ctx.biz.slug)
        return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر حفظ رقم التواصل' }
      }

      if (duplicates.length > 0) {
        const { error: cleanupError } = await admin
          .from('business_contact_methods')
          .delete()
          .in(
            'id',
            duplicates.map((item) => item.id),
          )
        if (cleanupError) {
          invalidateBusiness(ctx.biz.slug)
          return { ok: false, error: 'رقم التواصل اتحفظ، لكن تعذر تنظيف السجلات المكررة' }
        }
      }
    } else {
      const { error } = await admin.from('business_contact_methods').insert({
        business_id: ctx.biz.id,
        method_type: contact.method_type,
        value: contact.value,
        is_public: true,
        is_primary: contact.is_primary,
      })

      if (error) {
        invalidateBusiness(ctx.biz.slug)
        return { ok: false, error: 'اتحفظت البيانات الأساسية، لكن تعذر إضافة رقم التواصل' }
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
