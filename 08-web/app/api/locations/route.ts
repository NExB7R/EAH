import { NextResponse } from 'next/server'
import { z } from 'zod'
import { saveLocation } from '@/lib/locations'
import { createClient } from '@/lib/supabase-server'

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  label: z.string().max(50).optional(),
  address_text: z.string().max(200).optional(),
  is_primary: z.boolean().optional(),
})

export async function POST(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, reason: 'unauth' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 })

  const result = await saveLocation(parsed.data)
  return NextResponse.json(result)
}

export async function DELETE(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 })

  const { error } = await sb.from('customer_locations').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: !error })
}
