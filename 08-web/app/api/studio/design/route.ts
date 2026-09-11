import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const designPath = path.join(process.cwd(), '.eah', 'studio.json')

async function requireSuperAdmin() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return { supabase: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (roleError) {
    return { supabase: null, response: NextResponse.json({ error: 'Unable to verify role' }, { status: 500 }) }
  }

  if (roleRow?.role !== 'super_admin') {
    return { supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, response: null }
}

export async function GET() {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  try {
    const raw = await fs.readFile(designPath, 'utf8')
    return NextResponse.json({ data: JSON.parse(raw) })
  } catch {
    return NextResponse.json({ data: null })
  }
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response

  try {
    const data = await request.json()
    await fs.mkdir(path.dirname(designPath), { recursive: true })
    await fs.writeFile(designPath, JSON.stringify(data, null, 2), 'utf8')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
