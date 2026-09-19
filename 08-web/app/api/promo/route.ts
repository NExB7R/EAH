import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const schema = z.object({
  business_id: z.string().uuid(),
  post_url: z.string().url(),
  note: z.string().max(300).optional(),
})

export async function POST(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, reason: 'unauth' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 })
  const { data, error } = await sb.rpc('request_promo_post', {
    p_business: parsed.data.business_id,
    p_url: parsed.data.post_url,
    p_note: parsed.data.note ?? null,
  })
  if (error) return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body?.id || typeof body?.approve !== 'boolean') {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 })
  }
  const { data, error } = await sb.rpc('review_promo_post', {
    p_id: body.id,
    p_approve: body.approve,
    p_note: typeof body.note === 'string' ? body.note : null,
  })
  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json(data)
}
