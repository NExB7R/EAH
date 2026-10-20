'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createBulkNotifications } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Offers Actions
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

const offerSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(400).optional().or(z.literal('')),
  price: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? Number(v) : null))
    .refine((v) => v === null || (v >= 0 && Number.isFinite(v)), 'سعر غير صحيح'),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
  isPublished: z.boolean().default(true),
})

async function myBusiness() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'لازم تسجل دخول' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug, name, owner_profile_id')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) return { ok: false as const, error: 'مفيش نشاط مرتبط بحسابك' }
  return { ok: true as const, supabase, userId: user.id, biz }
}

// ─── إنشاء ───
export async function createOffer(formData: FormData): Promise<ActionResult> {
  const ctx = await myBusiness()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = offerSchema.safeParse({
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    price: String(formData.get('price') ?? '').trim(),
    startsAt: String(formData.get('startsAt') ?? '').trim(),
    endsAt: String(formData.get('endsAt') ?? '').trim(),
    isPublished: formData.get('isPublished') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  const { data, error } = await ctx.supabase
    .from('offers')
    .insert({
      business_id: ctx.biz.id,
      title: d.title,
      description: d.description || null,
      price: d.price,
      starts_at: d.startsAt || null,
      ends_at: d.endsAt || null,
      is_published: d.isPublished,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  // إشعار المتابعين (لو منشور)
  if (d.isPublished) {
    const { data: followers } = await ctx.supabase
      .from('business_follows')
      .select('user_id')
      .eq('business_id', ctx.biz.id)

    const userIds = (followers ?? []).map((f) => f.user_id)
    if (userIds.length > 0) {
      void createBulkNotifications({
        userIds,
        type: 'offer_new',
        title: `عرض جديد من ${ctx.biz.name}`,
        body: d.title,
        deepLink: `/businesses/${ctx.biz.slug}#offers`,
        pushTag: `offer-${data.id}`,
      }).catch(() => {})
    }
  }

  revalidatePath('/merchant/offers')
  revalidatePath('/offers')
  revalidatePath(`/businesses/${ctx.biz.slug}`)
  revalidatePath('/')

  return { ok: true, id: data.id }
}

// ─── تعديل ───
export async function deleteOffer(offerId: string): Promise<ActionResult> {
  const ctx = await myBusiness()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { error } = await ctx.supabase
    .from('offers')
    .delete()
    .eq('id', offerId)
    .eq('business_id', ctx.biz.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/merchant/offers')
  revalidatePath('/offers')
  revalidatePath(`/businesses/${ctx.biz.slug}`)
  return { ok: true }
}

// ─── تبديل النشر ───
export async function toggleOfferPublish(offerId: string, publish: boolean): Promise<ActionResult> {
  const ctx = await myBusiness()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const { error } = await ctx.supabase
    .from('offers')
    .update({ is_published: !publish })
    .eq('id', offerId)
    .eq('business_id', ctx.biz.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/merchant/offers')
  revalidatePath('/offers')
  return { ok: true }
}
