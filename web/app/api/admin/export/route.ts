import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { checkRateLimit, exportLimiter, getClientIp } from '@/lib/rate-limit'
import { buildCsv, csvResponse, type CsvColumn } from '@/lib/utils/csv'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Admin CSV Export
// GET /api/admin/export?type=businesses&status=pending&q=...
// ═══════════════════════════════════════════════════════════

type Row = Record<string, unknown>

const YES_NO = (value: unknown) => (value ? 'نعم' : 'لا')
const BUSINESS_SOURCE_LABEL: Record<string, string> = {
  admin: 'الأدمن',
  merchant: 'التاجر',
}
const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  active: 'ساري',
  trial: 'تجريبي',
  expired: 'منتهي',
  cancelled: 'ملغي',
  rejected: 'مرفوض',
  suspended: 'موقوف',
}
const AD_STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  active: 'نشط',
  paused: 'متوقف مؤقتًا',
  rejected: 'مرفوض',
  expired: 'منتهي',
  draft: 'مسودة',
}
const AUDIT_ACTION_LABEL: Record<string, string> = {
  'featured.enable': 'تفعيل التمييز',
  'featured.disable': 'إلغاء التمييز',
  'featured.pin': 'تثبيت نشاط',
  'featured.unpin': 'إلغاء تثبيت نشاط',
  'featured.reorder': 'إعادة ترتيب الأنشطة',
  'featured.extend': 'تمديد التمييز',
  'notifications.broadcast': 'إرسال إشعار جماعي',
  'review.moderate': 'مراجعة تقييم',
  'user.ban': 'حظر حساب',
  'user.unban': 'إلغاء حظر حساب',
  'user.role.change': 'تغيير دور الحساب',
  'business.approve': 'اعتماد نشاط',
  'business.reject': 'رفض نشاط',
  'business.archive': 'أرشفة نشاط',
  'business.republish': 'إعادة نشر نشاط',
  'business.delete': 'حذف نشاط',
  'subscription.approve': 'اعتماد اشتراك',
  'subscription.reject': 'رفض اشتراك',
  'subscription.extend': 'تمديد اشتراك',
  'subscription.cancel': 'إلغاء اشتراك',
  'ad.approve': 'اعتماد إعلان',
  'ad.reject': 'رفض إعلان',
  'ad.pause': 'إيقاف إعلان',
  'ad.resume': 'استئناف إعلان',
  'ad.delete': 'حذف إعلان',
}
const ENTITY_TYPE_LABEL: Record<string, string> = {
  business: 'نشاط',
  profile: 'حساب',
  advertisement: 'إعلان',
  ad: 'إعلان',
  subscription: 'اشتراك',
}

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx.ok) {
    return new Response('غير مصرح', { status: 403 })
  }

  const rateLimit = await checkRateLimit(
    exportLimiter,
    `admin-export:${ctx.userId}:${await getClientIp()}`,
    { failClosed: true },
  )
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { error: unavailable ? 'التصدير غير متاح مؤقتًا' : 'طلبات تصدير كثيرة، حاول لاحقًا' },
      {
        status: unavailable ? 503 : 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter) },
      },
    )
  }

  const sp = req.nextUrl.searchParams
  const type = sp.get('type') ?? ''
  const q = (sp.get('q') ?? '').trim().toLowerCase()
  const status = sp.get('status') ?? ''
  const validTypes = ['businesses', 'users', 'subscriptions', 'featured', 'ads', 'audit', 'health']
  if (!validTypes.includes(type) || q.length > 200 || status.length > 50) {
    return NextResponse.json({ error: 'فلتر التصدير غير صالح' }, { status: 400 })
  }

  const supabase = ctx.supabase

  const timestamp = new Date().toISOString().slice(0, 10)

  // ─── Businesses ───
  if (type === 'businesses') {
    let qb = supabase
      .from('businesses')
      .select(
        'id, name, slug, business_type, area, city, address_text, is_published, is_featured, trust_score, rating_avg, rating_count, successful_orders, source, created_at, rejected_at',
      )
      .order('created_at', { ascending: false })
      .limit(5000)

    if (status === 'pending') qb = qb.eq('is_published', false).is('rejected_at', null)
    else if (status === 'published') qb = qb.eq('is_published', true)
    else if (status === 'rejected') qb = qb.not('rejected_at', 'is', null)
    else if (status === 'admin_owned') qb = qb.eq('source', 'admin')

    const { data } = await qb
    let rows: Row[] = (data ?? []).map((row) => ({
      ...row,
      is_published: YES_NO(row.is_published),
      is_featured: YES_NO(row.is_featured),
      source: BUSINESS_SOURCE_LABEL[String(row.source)] ?? 'غير محدد',
    }))
    if (q)
      rows = rows.filter((r) =>
        String(r.name ?? '')
          .toLowerCase()
          .includes(q),
      )

    const columns: CsvColumn<Row>[] = [
      { key: 'name', label: 'الاسم' },
      { key: 'slug', label: 'الرابط المختصر' },
      { key: 'business_type', label: 'النوع' },
      { key: 'area', label: 'المنطقة' },
      { key: 'city', label: 'المدينة' },
      { key: 'address_text', label: 'العنوان' },
      { key: 'trust_score', label: 'نقاط المشاركة' },
      { key: 'rating_avg', label: 'التقييم' },
      { key: 'rating_count', label: 'عدد التقييمات' },
      { key: 'successful_orders', label: 'الطلبات' },
      { key: 'is_published', label: 'منشور' },
      { key: 'is_featured', label: 'مميز' },
      { key: 'source', label: 'المصدر' },
      { key: 'created_at', label: 'تاريخ الإنشاء' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-الأنشطة-${timestamp}`)
  }

  // ─── Users ───
  if (type === 'users') {
    const { data: profiles } = await supabase.rpc('admin_get_profiles')
    const ids = (profiles ?? []).map((p: { id: string }) => p.id)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

    const roleMap = new Map<string, string>()
    for (const r of roles ?? []) roleMap.set(r.user_id as string, r.role as string)

    let rows: Row[] = (profiles ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      display_name: p.display_name,
      phone: p.phone,
      role: roleMap.get(p.id as string) ?? 'customer',
      trust_score: p.trust_score,
      is_premium: YES_NO(p.is_premium),
      banned_until: p.banned_until,
      created_at: p.created_at,
    }))

    if (status === 'merchants') rows = rows.filter((r) => r.role === 'merchant')
    else if (status === 'customers') rows = rows.filter((r) => r.role === 'customer')
    else if (status === 'admins')
      rows = rows.filter((r) => r.role === 'super_admin')
    else if (status === 'premium') rows = rows.filter((r) => r.is_premium)
    else if (status === 'banned') {
      const now = Date.now()
      rows = rows.filter((r) => {
        const until = r.banned_until as string | null
        return until && new Date(until).getTime() > now
      })
    }
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r.display_name ?? '')
            .toLowerCase()
            .includes(q) || String(r.phone ?? '').includes(q),
      )
    }

    rows = rows.map((row) => ({
      ...row,
      role:
        row.role === 'super_admin'
          ? 'الأدمن'
          : row.role === 'merchant'
            ? 'التاجر'
            : row.role === 'customer'
              ? 'العميل'
              : 'غير محدد',
    }))

    const columns: CsvColumn<Row>[] = [
      { key: 'display_name', label: 'الاسم' },
      { key: 'phone', label: 'الرقم' },
      { key: 'role', label: 'الدور' },
      { key: 'trust_score', label: 'نقاط المشاركة' },
      { key: 'is_premium', label: 'التميز' },
      { key: 'banned_until', label: 'محظور حتى' },
      { key: 'created_at', label: 'تاريخ التسجيل' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-الحسابات-${timestamp}`)
  }

  // ─── Subscriptions ───
  if (type === 'subscriptions') {
    const { data } = await supabase
      .from('business_subscriptions')
      .select(
        'id, status, is_trial, starts_at, expires_at, created_at, plan:subscription_plans(name_ar, price_egp), business:businesses(name)',
      )
      .order('created_at', { ascending: false })
      .limit(5000)

    let rows: Row[] = (data ?? []).map((r) => {
      const biz = r.business as unknown as { name: string } | null
      const plan = r.plan as unknown as { name_ar: string; price_egp: number } | null
      return {
        business: biz?.name ?? '',
        plan: plan?.name_ar ?? '',
        price: plan?.price_egp ?? 0,
        status: r.status,
        is_trial: YES_NO(r.is_trial),
        starts_at: r.starts_at,
        expires_at: r.expires_at,
        created_at: r.created_at,
      }
    })

    if (status && status !== 'all') rows = rows.filter((r) => r.status === status)
    if (q) rows = rows.filter((r) => String(r.business).toLowerCase().includes(q))
    rows = rows.map((row) => ({
      ...row,
      status: SUBSCRIPTION_STATUS_LABEL[String(row.status)] ?? 'حالة غير محددة',
    }))

    const columns: CsvColumn<Row>[] = [
      { key: 'business', label: 'النشاط' },
      { key: 'plan', label: 'الباقة' },
      { key: 'price', label: 'السعر (ج.م)' },
      { key: 'status', label: 'الحالة' },
      { key: 'is_trial', label: 'تجربة' },
      { key: 'starts_at', label: 'يبدأ' },
      { key: 'expires_at', label: 'ينتهي' },
      { key: 'created_at', label: 'تاريخ الإنشاء' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-الاشتراكات-${timestamp}`)
  }

  // ─── Featured ───
  if (type === 'featured') {
    const { data } = await supabase
      .from('businesses')
      .select(
        'name, slug, business_type, area, featured_order, featured_pin, featured_until, trust_score',
      )
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(1000)

    let rows: Row[] = (data ?? []).map((row) => ({ ...row, featured_pin: YES_NO(row.featured_pin) }))
    if (q)
      rows = rows.filter((r) =>
        String(r.name ?? '')
          .toLowerCase()
          .includes(q),
      )

    const columns: CsvColumn<Row>[] = [
      { key: 'featured_order', label: 'الترتيب' },
      { key: 'name', label: 'الاسم' },
      { key: 'slug', label: 'الرابط المختصر' },
      { key: 'business_type', label: 'النوع' },
      { key: 'area', label: 'المنطقة' },
      { key: 'featured_pin', label: 'مثبّت' },
      { key: 'featured_until', label: 'ينتهي' },
      { key: 'trust_score', label: 'نقاط المشاركة' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-الأنشطة-المميزة-${timestamp}`)
  }

  // ─── Ads ───
  if (type === 'ads') {
    const { data } = await supabase
      .from('ads')
      .select(
        'title, status, impressions, clicks, starts_at, ends_at, created_at, slot:ad_slots(name_ar), business:businesses!ads_business_id_fkey(name)',
      )
      .order('created_at', { ascending: false })
      .limit(5000)

    let rows: Row[] = (data ?? []).map((r) => {
      const slot = r.slot as unknown as { name_ar: string } | null
      const biz = r.business as unknown as { name: string } | null
      return {
        title: r.title,
        slot: slot?.name_ar ?? '',
        business: biz?.name ?? '',
        status: r.status,
        impressions: r.impressions,
        clicks: r.clicks,
        starts_at: r.starts_at,
        ends_at: r.ends_at,
        created_at: r.created_at,
      }
    })

    if (status && status !== 'all') rows = rows.filter((r) => r.status === status)
    if (q)
      rows = rows.filter(
        (r) =>
          String(r.title).toLowerCase().includes(q) || String(r.business).toLowerCase().includes(q),
      )
    rows = rows.map((row) => ({
      ...row,
      status: AD_STATUS_LABEL[String(row.status)] ?? 'حالة غير محددة',
    }))

    const columns: CsvColumn<Row>[] = [
      { key: 'title', label: 'العنوان' },
      { key: 'slot', label: 'المكان' },
      { key: 'business', label: 'النشاط' },
      { key: 'status', label: 'الحالة' },
      { key: 'impressions', label: 'ظهور' },
      { key: 'clicks', label: 'نقرات' },
      { key: 'starts_at', label: 'يبدأ' },
      { key: 'ends_at', label: 'ينتهي' },
      { key: 'created_at', label: 'تاريخ الإنشاء' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-الإعلانات-${timestamp}`)
  }

  // ─── Audit Logs ───
  if (type === 'audit') {
    const { data } = await supabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, created_at, actor_user_id, metadata')
      .order('created_at', { ascending: false })
      .limit(5000)

    const userIds = Array.from(
      new Set((data ?? []).map((l) => l.actor_user_id).filter((x): x is string => !!x)),
    )
    const { data: profiles } = userIds.length
      ? await supabase.from('profiles').select('id, display_name').in('id', userIds)
      : { data: [] }
    const namesMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

    let rows: Row[] = (data ?? []).map((l) => ({
      created_at: l.created_at,
      actor: l.actor_user_id ? (namesMap.get(l.actor_user_id) ?? '—') : 'نظام',
      action: AUDIT_ACTION_LABEL[l.action] ?? 'إجراء إداري',
      entity_type: ENTITY_TYPE_LABEL[String(l.entity_type ?? '')] ?? 'سجل إداري',
      entity_id: l.entity_id ?? '',
      metadata: 'تفاصيل العملية محفوظة داخليًا لأغراض التدقيق',
    }))

    if (q) rows = rows.filter((r) => String(r.action).toLowerCase().includes(q))

    const columns: CsvColumn<Row>[] = [
      { key: 'created_at', label: 'الوقت' },
      { key: 'actor', label: 'بواسطة' },
      { key: 'action', label: 'الإجراء' },
      { key: 'entity_type', label: 'النوع' },
      { key: 'entity_id', label: 'المعرّف' },
      { key: 'metadata', label: 'التفاصيل' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-سجل-التدقيق-${timestamp}`)
  }

  // ─── Health (system_errors) ───
  if (type === 'health') {
    let qb = supabase
      .from('system_errors')
      .select('id, severity, source, path, message, resolved_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)

    if (status && status !== 'all') {
      if (status === 'unresolved') qb = qb.is('resolved_at', null)
      else if (status === 'resolved') qb = qb.not('resolved_at', 'is', null)
      else qb = qb.eq('severity', status)
    }
    const { data } = await qb
    let rows: Row[] = (data ?? []).map((row) => ({
      ...row,
      severity: ({ critical: 'حرج', error: 'خطأ', warning: 'تحذير', info: 'معلومة' } as Record<string, string>)[String(row.severity)] ?? 'غير محدد',
      source: 'مصدر داخلي',
      path: 'مسار داخلي',
      message: 'تفاصيل الخطأ محفوظة داخليًا.',
    }))
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r.message).toLowerCase().includes(q) ||
          String(r.source).toLowerCase().includes(q) ||
          String(r.path ?? '')
            .toLowerCase()
            .includes(q),
      )
    }

    const columns: CsvColumn<Row>[] = [
      { key: 'severity', label: 'الخطورة' },
      { key: 'source', label: 'المصدر' },
      { key: 'path', label: 'المسار' },
      { key: 'message', label: 'الرسالة' },
      { key: 'resolved_at', label: 'محلول في' },
      { key: 'created_at', label: 'التاريخ' },
    ]
    return csvResponse(buildCsv(rows, columns), `تصدير-حالة-النظام-${timestamp}`)
  }

  return new Response('نوع التصدير غير معروف', { status: 400 })
}
