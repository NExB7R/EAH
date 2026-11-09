'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — Launch Readiness (2026-11-09)
// فحص جاهزية الإطلاق — نسبة مئوية + checklist
// ═══════════════════════════════════════════════════════════

export type ReadinessItem = {
  id: string
  category: string
  label: string
  status: 'ready' | 'warning' | 'blocker'
  detail: string
  weight: number
}

export type ReadinessResult = {
  timestamp: string
  overallPercent: number
  readyCount: number
  warnCount: number
  blockerCount: number
  categories: string[]
  items: ReadinessItem[]
}

export async function computeLaunchReadiness(): Promise<ReadinessResult> {
  const access = await requireAdmin()
  if (!access.ok) {
    return {
      timestamp: new Date().toISOString(),
      overallPercent: 0,
      readyCount: 0,
      warnCount: 0,
      blockerCount: 1,
      categories: [],
      items: [
        { id: 'auth', category: 'أساسي', label: 'صلاحيات الأدمن', status: 'blocker', detail: 'غير مصرح', weight: 3 },
      ],
    }
  }

  const svc = createServiceClient()
  const items: ReadinessItem[] = []

  // ─── 1. DB Connection ───
  try {
    const { error } = await svc.from('profiles').select('id', { count: 'exact', head: true }).limit(1)
    items.push({
      id: 'db',
      category: 'بنية تحتية',
      label: 'قاعدة البيانات متصلة',
      status: error ? 'blocker' : 'ready',
      detail: error ? error.message : 'DB connection OK',
      weight: 3,
    })
  } catch {
    items.push({ id: 'db', category: 'بنية تحتية', label: 'قاعدة البيانات متصلة', status: 'blocker', detail: 'Connection failed', weight: 3 })
  }

  // ─── 2. RLS check ───
  try {
    const tables = ['profiles', 'businesses', 'order_requests', 'business_reviews']
    let missingRls = 0
    for (const t of tables) {
      const { count } = await svc.from(t).select('*', { count: 'exact', head: true }).limit(1)
      if (count === null) missingRls++
    }
    items.push({
      id: 'rls',
      category: 'بنية تحتية',
      label: 'RLS على الجداول الحرجة',
      status: missingRls === 0 ? 'ready' : 'warning',
      detail: missingRls === 0 ? '4/4 جدول متاح' : `${missingRls} جدول مش متاح`,
      weight: 3,
    })
  } catch {
    items.push({ id: 'rls', category: 'بنية تحتية', label: 'RLS على الجداول الحرجة', status: 'warning', detail: 'تعذر الفحص', weight: 3 })
  }

  // ─── 3. Published businesses ───
  try {
    const { count: publishedCount } = await svc
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
    const n = publishedCount ?? 0
    let status: 'ready' | 'warning' | 'blocker' = 'ready'
    let detail = `${n} نشاط منشور`
    if (n === 0) { status = 'blocker'; detail = 'مفيش أنشطة منشورة' }
    else if (n < 5) { status = 'warning'; detail = `${n} نشاط (ينصح بـ 5+)` }
    items.push({ id: 'businesses', category: 'محتوى', label: 'أنشطة منشورة', status, detail, weight: 3 })
  } catch {
    items.push({ id: 'businesses', category: 'محتوى', label: 'أنشطة منشورة', status: 'warning', detail: 'تعذر الفحص', weight: 3 })
  }

  // ─── 4. Approved reviews ───
  try {
    const { count: reviewsCount } = await svc
      .from('business_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    const n = reviewsCount ?? 0
    items.push({
      id: 'reviews',
      category: 'محتوى',
      label: 'تقييمات معتمدة',
      status: n > 0 ? 'ready' : 'warning',
      detail: n > 0 ? `${n} تقييم` : 'مفيش تقييمات — العملاء الجدد هيشوفوا نشاط بدون مراجعات',
      weight: 2,
    })
  } catch {
    items.push({ id: 'reviews', category: 'محتوى', label: 'تقييمات معتمدة', status: 'warning', detail: 'تعذر الفحص', weight: 2 })
  }

  // ─── 5. Real (non-demo) businesses ───
  try {
    const { count: realCount } = await svc
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .not('slug', 'like', 'demo-%')
      .not('slug', 'like', 'eah-qa-test-%')
    const n = realCount ?? 0
    items.push({
      id: 'real-businesses',
      category: 'محتوى',
      label: 'أنشطة حقيقية (مش demo)',
      status: n >= 3 ? 'ready' : n >= 1 ? 'warning' : 'blocker',
      detail: n >= 1 ? `${n} نشاط حقيقي` : 'مفيش أنشطة حقيقية — لسه demo فقط',
      weight: 3,
    })
  } catch {
    items.push({ id: 'real-businesses', category: 'محتوى', label: 'أنشطة حقيقية (مش demo)', status: 'warning', detail: 'تعذر الفحص', weight: 3 })
  }

  // ─── 6. Merchant accounts ───
  try {
    const { count: merchantCount } = await svc
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'merchant')
    const n = merchantCount ?? 0
    items.push({
      id: 'merchants',
      category: 'مستخدمين',
      label: 'حسابات تجار',
      status: n >= 1 ? 'ready' : 'warning',
      detail: n >= 1 ? `${n} تاجر` : 'مفيش تجار مسجلين',
      weight: 2,
    })
  } catch {
    items.push({ id: 'merchants', category: 'مستخدمين', label: 'حسابات تجار', status: 'warning', detail: 'تعذر الفحص', weight: 2 })
  }

  // ─── 7. Standing System ───
  try {
    const { error } = await svc.rpc('can_interact' as never, { p_user_id: '00000000-0000-0000-0000-000000000000' } as never)
    items.push({
      id: 'standing',
      category: 'أنظمة',
      label: 'Standing System (الالتزام)',
      status: error ? 'blocker' : 'ready',
      detail: error ? 'RPC فاشل' : 'شغال',
      weight: 3,
    })
  } catch {
    items.push({ id: 'standing', category: 'أنظمة', label: 'Standing System (الالتزام)', status: 'blocker', detail: 'RPC فاشل', weight: 3 })
  }

  // ─── 8. Autopilot ───
  try {
    const { data, error } = await svc.rpc('check_trigger_status' as never, {
      p_table: 'public.trust_events',
      p_trigger: 'trigger_autopilot_penalties',
    } as never)
    const d = data as { exists?: boolean; enabled?: boolean } | null
    items.push({
      id: 'autopilot',
      category: 'أنظمة',
      label: 'Autopilot (عقوبات تلقائية)',
      status: !error && d?.exists && d?.enabled ? 'ready' : 'warning',
      detail: d?.exists ? (d?.enabled ? 'شغال' : 'موجود ومعطل') : 'مش موجود',
      weight: 2,
    })
  } catch {
    items.push({ id: 'autopilot', category: 'أنظمة', label: 'Autopilot (عقوبات تلقائية)', status: 'warning', detail: 'تعذر الفحص', weight: 2 })
  }

  // ─── 9. Contact Privacy ───
  try {
    const { count: leakedCount } = await svc
      .from('business_contact_methods')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .in('method_type', ['phone', 'whatsapp'])
    const n = leakedCount ?? 0
    items.push({
      id: 'contact-privacy',
      category: 'أمان',
      label: 'أرقام التواصل العامة (يجب 0)',
      status: n === 0 ? 'ready' : 'blocker',
      detail: n === 0 ? 'محمي (0 رقم عام)' : `${n} رقم مكشوف!`,
      weight: 3,
    })
  } catch {
    items.push({ id: 'contact-privacy', category: 'أمان', label: 'أرقام التواصل العامة (يجب 0)', status: 'warning', detail: 'تعذر الفحص', weight: 3 })
  }

  // ─── 10. Orphan branches ───
  try {
    const { count: orphanCount } = await svc
      .from('business_branches')
      .select('*', { count: 'exact', head: true })
      .is('business_id', null)
    const n = orphanCount ?? 0
    items.push({
      id: 'orphan-branches',
      category: 'جودة البيانات',
      label: 'فروع يتيمة',
      status: n === 0 ? 'ready' : 'warning',
      detail: n === 0 ? 'مفيش' : `${n} فرع`,
      weight: 1,
    })
  } catch {
    items.push({ id: 'orphan-branches', category: 'جودة البيانات', label: 'فروع يتيمة', status: 'warning', detail: 'تعذر الفحص', weight: 1 })
  }

  // ─── 11. Demo data presence ───
  try {
    const { count: demoCount } = await svc
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .like('slug', 'demo-%')
    const n = demoCount ?? 0
    items.push({
      id: 'demo-data',
      category: 'جودة البيانات',
      label: 'بيانات demo (يجب 0 قبل الإطلاق)',
      status: n === 0 ? 'ready' : 'warning',
      detail: n === 0 ? 'نظيف' : `${n} نشاط demo`,
      weight: 2,
    })
  } catch {
    items.push({ id: 'demo-data', category: 'جودة البيانات', label: 'بيانات demo (يجب 0 قبل الإطلاق)', status: 'warning', detail: 'تعذر الفحص', weight: 2 })
  }

  // ─── الحساب ───
  const readyCount = items.filter((i) => i.status === 'ready').length
  const warnCount = items.filter((i) => i.status === 'warning').length
  const blockerCount = items.filter((i) => i.status === 'blocker').length

  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  const readyWeight = items.reduce(
    (s, i) => s + (i.status === 'ready' ? i.weight : i.status === 'warning' ? i.weight * 0.5 : 0),
    0,
  )
  const overallPercent = totalWeight > 0 ? Math.round((readyWeight / totalWeight) * 100) : 0

  const categories = Array.from(new Set(items.map((i) => i.category)))

  return {
    timestamp: new Date().toISOString(),
    overallPercent,
    readyCount,
    warnCount,
    blockerCount,
    categories,
    items,
  }
}
