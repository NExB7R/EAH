import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const code = body?.code
  const businessId = body?.business_id
  if (typeof code !== 'string' || typeof businessId !== 'string') {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 })
  }
  const sb = await createClient()
  const { data, error } = await sb.rpc('validate_coupon', { p_code: code, p_business: businessId })
  if (error) return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 })
  return NextResponse.json(data)
}
