import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const monthParam = url.searchParams.get('month') // YYYY-MM

  const supabase = await createServiceClient()
  const { data, error } = await supabase.rpc('generate_all_monthly_reports', {
    p_month_key: monthParam ?? null,
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET(request: Request) {
  return POST(request)
}
