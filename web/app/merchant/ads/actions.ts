'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Ads Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; id?: string } | { ok: false; error: string }

const schema = z.object({
  slotId: z.string().uuid('اختر مكان الإعلان'),
  title: z.string().min(2, 'العنوان قصير').max(80),
  imageUrl: z.string().max(500).optional().or(z.literal('')),
  linkUrl: z.string().max(500).optional().or(z.literal('')),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
})

async function myBiz() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'لازم تسجل دخول' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

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

  const { data, error } = await ctx.supabase
    .from('ads')
    .insert({
      slot_id: d.slotId,
      business_id: ctx.biz.id,
      owner_profile_id: ctx.userId,
      title: d.title,
      image_url: d.imageUrl || null,
      link_url: d.linkUrl || null,
      starts_at: d.startsAt || null,
      ends_at: d.endsAt || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/merchant/ads')
  return { ok: true, id: data.id }
}

export async function cancelMyAd(id: string): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  // يقدر يمسح بس pending أو rejected
  const { data: ad } = await ctx.supabase
    .from('ads')
    .select('status')
    .eq('id', id)
    .eq('business_id', ctx.biz.id)
    .maybeSingle()

  if (!ad) return { ok: false, error: 'الإعلان مش موجود' }
  if (ad.status !== 'pending' && ad.status !== 'rejected') {
    return { ok: false, error: 'مش ممكن تمسح إعلان نشط أو موافق عليه' }
  }

  const { error } = await ctx.supabase
    .from('ads')
    .delete()
    .eq('id', id)
    .eq('business_id', ctx.biz.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/merchant/ads')
  return { ok: true }
}
