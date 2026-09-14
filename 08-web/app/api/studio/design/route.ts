import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function requireSuperAdmin() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return { supabase: null, user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (roleError) {
    return { supabase: null, user: null, response: NextResponse.json({ error: 'Unable to verify role' }, { status: 500 }) }
  }

  if (roleRow?.role !== 'super_admin') {
    return { supabase: null, user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user: userData.user, response: null }
}

export async function GET() {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  const { data, error } = await auth.supabase!
    .from('site_designs')
    .select('data, updated_at')
    .eq('key', 'home')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Unable to load design' }, { status: 500 })
  }

  return NextResponse.json({ data: data?.data ?? null, updated_at: data?.updated_at ?? null })
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  try {
    const data = await request.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ ok: false, error: 'Invalid design payload' }, { status: 400 })
    }

    const { error } = await auth.supabase!
      .from('site_designs')
      .upsert(
        {
          key: 'home',
          data,
          updated_by: auth.user!.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )

    if (error) {
      return NextResponse.json({ ok: false, error: 'Unable to save design' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}
