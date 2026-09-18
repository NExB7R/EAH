import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'

export async function POST(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const ip = getClientIp(req)
  const rl = checkRate(`follow:${user.id}:${ip}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'rate_limit' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const businessId = body?.business_id
  const action = body?.action
  if (typeof businessId !== 'string' || (action !== 'follow' && action !== 'unfollow')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  if (action === 'follow') {
    const { error } = await sb
      .from('business_follows')
      .insert({ user_id: user.id, business_id: businessId })
    if (error && !error.message.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await sb
      .from('business_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('business_id', businessId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = await sb.rpc('get_business_follower_count', { p_business: businessId })
  return NextResponse.json({ ok: true, follower_count: (data as number) ?? 0 })
}
