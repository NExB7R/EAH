import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildCsv, csvResponse, type CsvColumn } from '@/lib/utils/csv'
import { apiLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Orders CSV Export
// GET /api/merchant/orders/export?status=X&from=Y
// ═══════════════════════════════════════════════════════════

type Row = Record<string, unknown>

const STATUS_LABEL: Record<string, string> = {
  sent: 'جديد',
  seen: 'شافه',
  accepted: 'اتأكد',
  rejected: 'اترفض',
  preparing: 'بيتحضّر',
  on_way: 'في الطريق',
  delivered: 'اتسلّم',
  cancelled: 'اتلغى',
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkRateLimit(apiLimiter, `merchant-orders-export:${user.id}:${await getClientIp()}`, { failClosed: true })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json({ error: unavailable ? 'الخدمة غير متاحة مؤقتًا' : 'طلبات كثيرة، حاول لاحقًا' }, {
      status: unavailable ? 503 : 429,
      headers: unavailable ? { 'Retry-After': '60' } : {},
    })
  }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) {
    return NextResponse.json({ error: 'No business' }, { status: 404 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? 'all'
  const from = url.searchParams.get('from') ?? 'all'
  const validStatuses = new Set(['all', ...Object.keys(STATUS_LABEL)])
  const validRanges = new Set(['all', 'today', 'week', 'month'])
  if (!validStatuses.has(status) || !validRanges.has(from)) {
    return NextResponse.json({ error: 'فلتر التصدير غير صالح' }, { status: 400 })
  }

  let q = supabase
    .from('order_requests')
    .select(
      'order_code, status, items, notes, customer_name, customer_phone, created_at, updated_at',
    )
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false })
    .limit(2001)

  if (status && status !== 'all') q = q.eq('status', status)

  if (from && from !== 'all') {
    const now = Date.now()
    let cutoff = 0
    if (from === 'today') {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      cutoff = d.getTime()
    } else if (from === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000
    else if (from === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000
    if (cutoff > 0) q = q.gte('created_at', new Date(cutoff).toISOString())
  }

  const { data, error } = await q
  if (error) {
    console.error('[merchant-orders-export] query failed:', error.message)
    return NextResponse.json({ error: 'تعذر تصدير الطلبات مؤقتًا' }, { status: 500 })
  }
  if ((data ?? []).length > 2000) {
    return NextResponse.json(
      { error: 'نتائج التصدير أكبر من الحد الآمن (2000 طلب). حدّد فترة زمنية أضيق ثم أعد المحاولة.' },
      { status: 413 },
    )
  }

  const rows: Row[] = (data ?? []).map((r) => ({
    order_code: r.order_code,
    status: STATUS_LABEL[r.status as string] ?? r.status,
    customer_name: r.customer_name,
    customer_phone: r.customer_phone,
    items: r.items,
    notes: r.notes,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))

  const columns: CsvColumn<Row>[] = [
    { key: 'order_code', label: 'رقم الطلب' },
    { key: 'status', label: 'الحالة' },
    { key: 'customer_name', label: 'العميل' },
    { key: 'customer_phone', label: 'الموبايل' },
    { key: 'items', label: 'الطلبات' },
    { key: 'notes', label: 'ملاحظات' },
    { key: 'created_at', label: 'تاريخ الإنشاء' },
    { key: 'updated_at', label: 'آخر تحديث' },
  ]

  const date = new Date().toISOString().slice(0, 10)
  return csvResponse(buildCsv(rows, columns), `orders-${biz.name ?? 'merchant'}-${date}`)
}
