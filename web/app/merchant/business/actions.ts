'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  name: z.string().min(2, 'الاسم قصير').max(80),
  area: z.string().max(50).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  hook: z.string().max(120).optional().or(z.literal('')),
  address_text: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  is_open: z.boolean(),
  accepts_whatsapp_orders: z.boolean(),
  business_type: z.enum(['restaurant', 'pharmacy', 'delivery_office', 'misc']).optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
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
    .maybeSingle()

  if (!biz) return { ok: false as const, error: 'مفيش نشاط مرتبط بحسابك' }
  return { ok: true as const, supabase, biz }
}

export async function updateMyBusiness(formData: FormData): Promise<Result> {
  const ctx = await myBiz()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parseCoord = (raw: string): number | null => {
    const v = raw.trim()
    if (!v) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
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
    business_type: String(formData.get('business_type') ?? '').trim() || undefined,
    latitude: parseCoord(String(formData.get('latitude') ?? '')),
    longitude: parseCoord(String(formData.get('longitude') ?? '')),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const d = parsed.data

  const patch: Record<string, unknown> = {
    name: d.name,
    area: d.area || null,
    description: d.description || null,
    hook: d.hook || null,
    address_text: d.address_text || null,
    is_open: d.is_open,
    accepts_whatsapp_orders: d.accepts_whatsapp_orders,
  }
  if (d.business_type) patch.business_type = d.business_type
  if (d.latitude !== undefined) patch.latitude = d.latitude
  if (d.longitude !== undefined) patch.longitude = d.longitude

  const { error } = await ctx.supabase.from('businesses').update(patch).eq('id', ctx.biz.id)

  if (error) return { ok: false, error: error.message }

  // احفظ contact methods (phone + whatsapp)
  const contactUpserts: {
    business_id: string
    method_type: string
    value: string
    is_public: boolean
    is_primary: boolean
  }[] = []

  if (d.phone) {
    contactUpserts.push({
      business_id: ctx.biz.id,
      method_type: 'phone',
      value: d.phone,
      is_public: true,
      is_primary: true,
    })
  }
  if (d.whatsapp) {
    contactUpserts.push({
      business_id: ctx.biz.id,
      method_type: 'whatsapp',
      value: d.whatsapp,
      is_public: true,
      is_primary: true,
    })
  }

  for (const c of contactUpserts) {
    const { data: existing } = await ctx.supabase
      .from('business_contact_methods')
      .select('id')
      .eq('business_id', c.business_id)
      .eq('method_type', c.method_type)
      .maybeSingle()

    if (existing) {
      await ctx.supabase
        .from('business_contact_methods')
        .update({ value: c.value, is_public: true })
        .eq('id', existing.id)
    } else {
      await ctx.supabase.from('business_contact_methods').insert(c)
    }
  }

  revalidatePath('/merchant/business')
  revalidatePath(`/businesses/${ctx.biz.slug}`)
  return { ok: true }
}
