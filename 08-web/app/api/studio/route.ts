import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) return { supabase: null, user: null, error: 'unauthorized' as const }
  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (role?.role !== 'super_admin') return { supabase: null, user: null, error: 'forbidden' as const }
  return { supabase, user: userData.user, error: null }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key') ?? 'home'
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_designs')
    .select('data,draft_data,updated_at,published_at')
    .eq('key', key)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    data: data?.data ?? null,
    draft_data: data?.draft_data ?? null,
    updated_at: data?.updated_at ?? null,
    published_at: data?.published_at ?? null,
  })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.supabase || !auth.user) return NextResponse.json({ error: auth.error ?? 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const { action = 'draft', key = 'home', data } = body as { action?: 'draft' | 'publish'; key?: string; data?: unknown }

  if (action === 'publish') {
    const { data: row, error: readErr } = await auth.supabase
      .from('site_designs').select('draft_data,data').eq('key', key).maybeSingle()
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
    const nextData = row?.draft_data ?? data
    if (!nextData || typeof nextData !== 'object') return NextResponse.json({ error: 'no_draft' }, { status: 400 })
    const sections = (nextData as any).sections
    if (!Array.isArray(sections) || sections.length === 0) return NextResponse.json({ error: 'empty_sections' }, { status: 400 })
    const { error } = await auth.supabase.from('site_designs').update({
      data: nextData,
      published_at: new Date().toISOString(),
      published_by: auth.user.id,
      updated_at: new Date().toISOString(),
    }).eq('key', key)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    revalidatePath('/')
    revalidatePath('/api/site-design')
    return NextResponse.json({ ok: true, published_at: new Date().toISOString() })
  }

  if (!data || typeof data !== 'object') return NextResponse.json({ error: 'invalid_data' }, { status: 400 })
  const sections = (data as any).sections
  if (!Array.isArray(sections) || sections.length === 0) return NextResponse.json({ error: 'empty_sections' }, { status: 400 })

  const { error } = await auth.supabase.from('site_designs').upsert({
    key, draft_data: data,
    updated_at: new Date().toISOString(),
    updated_by: auth.user.id,
  }, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, action: 'draft', savedAt: new Date().toISOString() })
}
