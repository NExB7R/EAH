import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) return { supabase: null, error: 'unauthorized' as const }
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (role?.role !== 'super_admin') return { supabase: null, error: 'forbidden' as const }
  return { supabase, error: null }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key') ?? 'home'
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_designs')
    .select('data,updated_at')
    .eq('key', key)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? { data: null, updated_at: null })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.supabase) return NextResponse.json({ error: auth.error }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }
  const { key = 'home', data } = body as { key?: string; data?: unknown }
  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: 'invalid_data' }, { status: 400 })
  }

  // منع حفظ تصميم فاضي (يحمي من مشكلة الـ empty sections)
  const sections = (data as any).sections
  if (!Array.isArray(sections) || sections.length === 0) {
    return NextResponse.json({ error: 'empty_sections_blocked' }, { status: 400 })
  }

  const { data: userData } = await auth.supabase.auth.getUser()

  const { error } = await auth.supabase
    .from('site_designs')
    .upsert(
      {
        key,
        data,
        updated_at: new Date().toISOString(),
        updated_by: userData?.user?.id ?? null,
      },
      { onConflict: 'key' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Live sync: الصفحات الرئيسية هتعيد البناء فورًا
  revalidatePath('/')
  revalidatePath('/api/site-design')

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() })
}
