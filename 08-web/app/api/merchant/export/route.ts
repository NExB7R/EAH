import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

function toCSV(rows: any[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    if (v == null) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(','))
  return '\uFEFF' + lines.join('\n')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const businessId = url.searchParams.get('business')
  const rangeDays = Math.min(90, Math.max(7, parseInt(url.searchParams.get('range') ?? '30', 10) || 30))

  if (!businessId) return NextResponse.json({ error: 'missing business' }, { status: 400 })

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // تأكد إن المستخدم مالك أو أدمن
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id,name')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  const isOwner = biz.owner_profile_id === userData.user.id
  const isAdmin = role?.role === 'super_admin'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const since = new Date(Date.now() - rangeDays * 86400000).toISOString()

  const { data: events } = await supabase
    .from('page_view_events')
    .select('id,path,visitor_id,device_type,referrer,created_at')
    .eq('business_id', businessId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(10000)

  const csv = toCSV(events ?? [])
  const safeName = biz.name.replace(/[^\w\u0600-\u06FF-]/g, '_').slice(0, 40)
  const filename = `${safeName}_${rangeDays}d.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
