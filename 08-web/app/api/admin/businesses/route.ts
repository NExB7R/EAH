import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase-server'

const contactSchema = z.object({
  method_type: z.enum(['phone', 'whatsapp', 'facebook', 'instagram', 'website', 'email']),
  value: z.string().trim().min(1).max(200),
  is_primary: z.boolean().optional(),
})

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(60).regex(/^[\u0600-\u06FFa-z0-9-]+$/),
  business_type: z.enum(['restaurant', 'pharmacy', 'supermarket', 'delivery_office']),
  area: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60).default('شبين القناطر'),
  description: z.string().trim().max(500).nullable().optional(),
  address_text: z.string().trim().max(200).nullable().optional(),
  hook: z.string().trim().max(80).nullable().optional(),
  map_url: z.string().url().nullable().optional(),
  cover_image_url: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  working_hours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })).optional(),
  contacts: z.array(contactSchema).max(8).optional(),
  food_categories: z.array(z.string()).max(5).optional(),
  is_published: z.boolean().default(true),
  is_open: z.boolean().default(true),
  is_featured: z.boolean().default(false),
})

async function requireAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data: role } = await sb
    .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'super_admin').maybeSingle()
  return role ? user : null
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request', issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data
  const svc = createServiceClient()

  // 1) تأكد إن الـ slug مش مستخدم
  const { data: existing } = await svc
    .from('businesses').select('id').eq('slug', data.slug).maybeSingle()
  if (existing) {
    return NextResponse.json({ ok: false, error: 'duplicate' }, { status: 409 })
  }

  // 2) أنشئ النشاط
  const { data: biz, error: bizErr } = await svc
    .from('businesses')
    .insert({
      name: data.name,
      slug: data.slug,
      business_type: data.business_type,
      area: data.area,
      city: data.city,
      description: data.description ?? null,
      address_text: data.address_text ?? null,
      hook: data.hook ?? null,
      map_url: data.map_url ?? null,
      cover_image_url: data.cover_image_url ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      working_hours: data.working_hours ?? {},
      is_published: data.is_published,
      is_open: data.is_open,
      is_featured: data.is_featured,
    })
    .select('id,slug')
    .single()

  if (bizErr || !biz) {
    return NextResponse.json({ ok: false, error: bizErr?.message ?? 'insert_failed' }, { status: 500 })
  }

  // 3) contacts
  if (data.contacts && data.contacts.length > 0) {
    const { error: cErr } = await svc.from('business_contact_methods').insert(
      data.contacts.map((c) => ({
        business_id: biz.id,
        method_type: c.method_type,
        value: c.value,
        is_primary: c.is_primary ?? false,
        is_public: true,
      }))
    )
    if (cErr) console.error('[contacts]', cErr.message)
  }

  // 4) food categories
  if (data.food_categories && data.food_categories.length > 0) {
    const { error: fErr } = await svc.from('business_food_categories').insert(
      data.food_categories.map((k) => ({ business_id: biz.id, category_key: k }))
    )
    if (fErr) console.error('[food_cats]', fErr.message)
  }

  return NextResponse.json({ ok: true, id: biz.id, slug: biz.slug })
}
