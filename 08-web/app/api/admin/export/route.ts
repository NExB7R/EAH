import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    if (v === null || v === undefined) return ''
    const s = String(v).replace(/"/g, '""')
    return /[,"\n]/.test(s) ? `"${s}"` : s
  }
  return '\uFEFF' + [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type') ?? 'businesses'
  const month = url.searchParams.get('month')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (role?.role !== 'super_admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  let rows: Record<string, any>[] = []

  if (type === 'businesses') {
    const { data } = await supabase.from('businesses')
      .select('id,name,slug,business_type,area,is_published,is_featured,trust_score,is_new_project,created_at')
      .order('created_at', { ascending: false })
    rows = data ?? []
  } else if (type === 'users') {
    const { data } = await supabase.from('profiles')
      .select('id,display_name,phone,trust_score,trust_tier,verified_at,created_at')
      .order('created_at', { ascending: false })
    rows = data ?? []
  } else if (type === 'orders') {
    const { data } = await supabase.from('order_requests')
      .select('id,order_code_v2,customer_name,customer_phone,business_id,status,created_at,confirmed_at')
      .order('created_at', { ascending: false })
    rows = data ?? []
  } else if (type === 'reports' && month) {
    const { data } = await supabase.from('business_monthly_reports')
      .select('business_id,month_key,data,generated_at')
      .eq('month_key', month)
    rows = (data ?? []).map((r: any) => ({
      business_id: r.business_id,
      month: r.month_key,
      views: r.data?.views ?? 0,
      unique_visitors: r.data?.unique_visitors ?? 0,
      orders: r.data?.orders ?? 0,
      confirmed_orders: r.data?.confirmed_orders ?? 0,
      reviews: r.data?.reviews_count ?? 0,
      avg_rating: r.data?.avg_rating ?? 0,
      conversion_rate: r.data?.conversion_rate ?? 0,
      generated_at: r.generated_at,
    }))
  }

  const csv = toCsv(rows)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="eah-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
