import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

type Range = { from?: string; to?: string }

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
  return '\uFEFF' + lines.join('\n') // BOM for Excel Arabic
}

function parseRange(url: URL): Range {
  const from = url.searchParams.get('from') ?? undefined
  const to = url.searchParams.get('to') ?? undefined
  // validate ISO date
  const iso = /^\d{4}-\d{2}-\d{2}$/
  return {
    from: from && iso.test(from) ? from : undefined,
    to: to && iso.test(to) ? to : undefined,
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') ?? ''
  const range = parseRange(url)

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (role?.role !== 'super_admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let query: any = null
  let filename = 'export.csv'

  const from = range.from ? `${range.from}T00:00:00.000Z` : undefined
  const to = range.to ? `${range.to}T23:59:59.999Z` : undefined

  switch (type) {
    case 'businesses':
      query = supabase
        .from('businesses')
        .select('id,name,slug,business_type,area,city,is_open,is_published,is_featured,created_at')
      filename = `businesses_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    case 'reviews':
      query = supabase
        .from('business_reviews')
        .select('id,business_id,user_id,rating,status,created_at')
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)
      filename = `reviews_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    case 'reveals':
      query = supabase
        .from('contact_reveals')
        .select('id,business_id,method_type,visitor_hash,created_at')
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)
      filename = `reveals_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    case 'users':
      query = supabase
        .from('profiles')
        .select('id,display_name,phone,trust_score,created_at,verified_at')
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)
      filename = `users_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    case 'visits':
      query = supabase.from('daily_visits').select('id,user_id,visit_date,points_earned,streak_at')
      if (from) query = query.gte('visit_date', range.from)
      if (to) query = query.lte('visit_date', range.to)
      filename = `visits_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    case 'referrals':
      query = supabase
        .from('referrals')
        .select('id,referrer_id,referred_id,code,bonus_points,created_at')
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)
      filename = `referrals_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    case 'audit':
      query = supabase
        .from('audit_logs')
        .select('id,action,entity_type,entity_id,actor_email,created_at')
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)
      filename = `audit_${range.from ?? 'all'}_${range.to ?? 'now'}.csv`
      break
    default:
      return NextResponse.json({ error: 'unknown_type' }, { status: 400 })
  }

  const { data, error } = await query.limit(50000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const csv = toCSV(data ?? [])
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
