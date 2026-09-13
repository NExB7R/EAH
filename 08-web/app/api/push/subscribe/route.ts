import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false }, { status: 400 })

  const { endpoint, keys } = body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userData.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: request.headers.get('user-agent') ?? null,
      last_used_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ ok: false }, { status: 401 })

  const { endpoint } = await request.json().catch(() => ({ endpoint: null }))
  if (!endpoint) return NextResponse.json({ ok: false }, { status: 400 })

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', userData.user.id)
  return NextResponse.json({ ok: true })
}
