'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true; id?: string } | { ok: false; error: string }

function isSafeHttpUrl(value: string | undefined): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0 &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

const optionalHttpUrl = z
  .string()
  .max(500)
  .optional()
  .or(z.literal(''))
  .refine(isSafeHttpUrl, { message: 'الرابط لازم يكون رابط ويب يبدأ بـ http أو https' })

const optionalDateTime = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || Number.isFinite(Date.parse(value)), {
    message: 'صيغة التاريخ غير صحيحة',
  })

const adIdSchema = z.string().uuid('معرّف الإعلان غير صحيح')

const schema = z
  .object({
    slotId: z.string().uuid('اختر مكان الإعلان'),
    title: z.string().trim().min(2, 'العنوان قصير').max(80),
    imageUrl: optionalHttpUrl,
    linkUrl: optionalHttpUrl,
    startsAt: optionalDateTime,
    endsAt: optionalDateTime,
  })
  .refine(
    (value) => {
      const startsAt = value.startsAt ? Date.parse(value.startsAt) : Date.now()
      if (!Number.isFinite(startsAt)) return false
      if (!value.endsAt) return true
      const endsAt = Date.parse(value.endsAt)
      return Number.isFinite(endsAt) && endsAt > startsAt
    },
    { message: 'موعد الانتهاء لازم يكون بعد بداية الإعلان' },
  )

async function recordAdAudit(input: {
  actorUserId: string
  action: string
  entityId: string
  beforeData?: Record<string, unknown> | null
  afterData?: Record<string, unknown> | null
}) {
  try {
    // Service role is used only for audit after identity/ownership checks.
    await logAudit(createServiceClient(), { ...input, entityType: 'advertisement' })
  } catch {
    // Do not report a completed mutation as failed only because its audit write failed.
  }
}

async function myBiz() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'لازم تسجل دخول' }

  const { data: biz, error } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) return { ok: false as const, error: 'تعذر التحقق من نشاطك. حاول مرة تانية.' }
  if (!biz) return { ok: false as const, error: 'مفيش نشاط مرتبط بحسابك' }
  return { ok: true as const, supabase, biz, userId: user.id }
}

export async function requestAd(formData: FormData): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = schema.safeParse({
    slotId: String(formData.get('slotId') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    imageUrl: String(formData.get('imageUrl') ?? '').trim(),
    linkUrl: String(formData.get('linkUrl') ?? '').trim(),
    startsAt: String(formData.get('startsAt') ?? '').trim(),
    endsAt: String(formData.get('endsAt') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data
  const { data: slot, error: slotError } = await ctx.supabase
    .from('ad_slots')
    .select('id')
    .eq('id', d.slotId)
    .eq('is_active', true)
    .maybeSingle()

  if (slotError) return { ok: false, error: 'تعذر التحقق من مكان الإعلان. حاول مرة تانية.' }
  if (!slot) return { ok: false, error: 'مكان الإعلان غير متاح حاليًا. اختار مكانًا آخر.' }

  // The live schema requires starts_at; do not send NULL for an empty form field.
  const startsAt = d.startsAt ? new Date(d.startsAt).toISOString() : new Date().toISOString()
  const endsAt = d.endsAt ? new Date(d.endsAt).toISOString() : null

  const { data, error } = await ctx.supabase
    .from('ads')
    .insert({
      slot_id: d.slotId,
      business_id: ctx.biz.id,
      owner_profile_id: ctx.userId,
      title: d.title,
      image_url: d.imageUrl || null,
      link_url: d.linkUrl || null,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, error: 'تعذر حفظ طلب الإعلان. راجع البيانات وحاول مرة تانية.' }
  }

  await recordAdAudit({
    actorUserId: ctx.userId,
    action: 'ad.request',
    entityId: data.id,
    afterData: { business_id: ctx.biz.id, slot_id: d.slotId, status: 'pending' },
  })

  const { createNotification } = await import('@/lib/notifications/server')
  const { data: admins } = await ctx.supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'super_admin')

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      void createNotification({
        userId: admin.user_id,
        type: 'admin',
        title: 'إعلان جديد بانتظار المراجعة',
        body: `من نشاط — "${d.title}"`,
        deepLink: '/admin/ads',
        pushTag: `ad-request-${data.id}`,
      }).catch(() => {})
    }
  }

  revalidatePath('/merchant/ads')
  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id: data.id }
}

export async function cancelMyAd(id: string): Promise<Result> {
  const parsedId = adIdSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإعلان غير صحيح' }

  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { data: ad, error: lookupError } = await ctx.supabase
    .from('ads')
    .select('status')
    .eq('id', parsedId.data)
    .eq('business_id', ctx.biz.id)
    .maybeSingle()

  if (lookupError) return { ok: false, error: 'تعذر التحقق من حالة الإعلان. حاول مرة تانية.' }
  if (!ad) return { ok: false, error: 'الإعلان مش موجود' }
  if (ad.status !== 'pending' && ad.status !== 'rejected') {
    return { ok: false, error: 'مش ممكن تمسح إعلان نشط أو موافق عليه' }
  }

  // Recheck id, activity and cancellable state in the DELETE itself to avoid a race.
  const { data: deleted, error } = await ctx.supabase
    .from('ads')
    .delete()
    .eq('id', parsedId.data)
    .eq('business_id', ctx.biz.id)
    .in('status', ['pending', 'rejected'])
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر إلغاء طلب الإعلان. حاول مرة تانية.' }
  if (!deleted) {
    // Production RLS currently restricts DELETE to the admin; don't report false success.
    return { ok: false, error: 'تعذر إلغاء الإعلان بسبب صلاحيات قاعدة البيانات. تم تسجيل المشكلة للمراجعة.' }
  }

  await recordAdAudit({
    actorUserId: ctx.userId,
    action: 'ad.cancel',
    entityId: deleted.id,
    beforeData: { business_id: ctx.biz.id, status: ad.status },
  })

  revalidatePath('/merchant/ads')
  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true }
}
