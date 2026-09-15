import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ItemSchema = z.object({
  id: z.string().uuid().optional(),
  business_id: z.string().uuid(),
  category: z.string().trim().min(1).max(80).default('عام'),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number().min(0).max(100000).optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  is_available: z.boolean().default(true),
  sort_order: z.number().int().default(0),
})

async function assertOwner(supabase: any, businessId: string) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('unauthorized')

  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  const isOwner = biz?.owner_profile_id === userData.user.id
  const isAdmin = role?.role === 'super_admin'
  if (!isOwner && !isAdmin) throw new Error('forbidden')

  return userData.user
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const businessId = url.searchParams.get('business')
  if (!businessId) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('business_menu_items')
    .select('*')
    .eq('business_id', businessId)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, items: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json().catch(() => null)
  const parsed = ItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid', issues: parsed.error.issues }, { status: 400 })
  }

  const d = parsed.data

  try {
    await assertOwner(supabase, d.business_id)
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'unknown' }, { status: 403 })
  }

  if (d.id) {
    const { error } = await supabase
      .from('business_menu_items')
      .update({
        category: d.category,
        name: d.name,
        description: d.description ?? null,
        price: d.price ?? null,
        image_url: d.image_url ?? null,
        is_available: d.is_available,
        sort_order: d.sort_order,
      })
      .eq('id', d.id)
      .eq('business_id', d.business_id)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: d.id })
  }

  const { data, error } = await supabase
    .from('business_menu_items')
    .insert({
      business_id: d.business_id,
      category: d.category,
      name: d.name,
      description: d.description ?? null,
      price: d.price ?? null,
      image_url: d.image_url ?? null,
      is_available: d.is_available,
      sort_order: d.sort_order,
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message ?? 'insert_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const businessId = url.searchParams.get('business')
  if (!id || !businessId) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  try {
    await assertOwner(supabase, businessId)
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'unknown' }, { status: 403 })
  }

  const { error } = await supabase
    .from('business_menu_items')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
