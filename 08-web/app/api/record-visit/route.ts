import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { ok } = checkRate(`visit:${ip}`, 10, 60_000)
  if (!ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const { data, error } = await supabase.rpc('record_daily_visit')
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
