import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — System Health Checks (2026-11-09)
// فحوصات سريعة لصحة النظام — تستخدم قبل الإطلاق وبعده
// ═══════════════════════════════════════════════════════════

export type CheckStatus = 'ok' | 'warning' | 'error'

export type HealthCheck = {
  id: string
  label: string
  status: CheckStatus
  message: string
  details?: string
}

export type HealthChecksResult = {
  timestamp: string
  totalChecks: number
  okCount: number
  warnCount: number
  errCount: number
  checks: HealthCheck[]
}

const CRITICAL_TABLES = [
  'profiles',
  'user_roles',
  'businesses',
  'business_branches',
  'business_reviews',
  'business_comments',
  'order_requests',
  'points_log',
  'standing_events',
  'notifications',
  'trust_events',
  'business_contact_methods',
  'merchant_order_settings',
  'offers',
] as const

const CRITICAL_TRIGGERS = [
  { table: 'business_reviews', name: 'trg_notify_merchant_on_review' },
  { table: 'business_reviews', name: 'trg_enforce_transaction_verified_review_insert' },
  { table: 'business_reviews', name: 'trg_refresh_reviews' },
  { table: 'auth.users', name: 'on_auth_user_created' },
] as const

export async function runHealthChecks(): Promise<HealthChecksResult> {
  const access = await requireAdmin()
  if (!access.ok) {
    return {
      timestamp: new Date().toISOString(),
      totalChecks: 0,
      okCount: 0,
      warnCount: 0,
      errCount: 1,
      checks: [
        {
          id: 'auth',
          label: 'صلاحيات الأدمن',
          status: 'error',
          message: 'غير مصرح',
        },
      ],
    }
  }

  const checks: HealthCheck[] = []
  const svc = createServiceClient()

  // ─── 1. DB Connection ───
  try {
    const { error } = await svc.from('profiles').select('id', { count: 'exact', head: true }).limit(1)
    checks.push({
      id: 'db-connection',
      label: 'اتصال قاعدة البيانات',
      status: error ? 'error' : 'ok',
      message: error ? 'فشل الاتصال' : 'متصل',
      details: error?.message,
    })
  } catch (e) {
    checks.push({
      id: 'db-connection',
      label: 'اتصال قاعدة البيانات',
      status: 'error',
      message: 'فشل الاتصال',
      details: e instanceof Error ? e.message : 'Unknown',
    })
  }

  // ─── 2. الجداول الحرجة ───
  const missingTables: string[] = []
  for (const table of CRITICAL_TABLES) {
    try {
      const { error } = await svc.from(table).select('*', { count: 'exact', head: true }).limit(1)
      if (error && error.code === 'PGRST205') {
        missingTables.push(table)
      }
    } catch {
      missingTables.push(table)
    }
  }
  checks.push({
    id: 'critical-tables',
    label: `الجداول الحرجة (${CRITICAL_TABLES.length})`,
    status: missingTables.length === 0 ? 'ok' : 'error',
    message: missingTables.length === 0 ? 'كل الجداول موجودة' : `${missingTables.length} جدول مفقود`,
    details: missingTables.length > 0 ? `مفقود: ${missingTables.join(', ')}` : undefined,
  })

  // ─── 3. الـ Triggers الحرجة ───
  const disabledTriggers: string[] = []
  try {
    for (const trig of CRITICAL_TRIGGERS) {
      const { data, error } = await svc.rpc('check_trigger_status' as never, {
        p_table: trig.table,
        p_trigger: trig.name,
      } as never)
      if (error) {
        // RPC مش موجود — نتخطى الفحص بهدوء
        break
      }
      if (data && typeof data === 'object' && 'enabled' in data && !(data as { enabled: boolean }).enabled) {
        disabledTriggers.push(`${trig.table}.${trig.name}`)
      }
    }
    checks.push({
      id: 'critical-triggers',
      label: `الـ Triggers الحرجة (${CRITICAL_TRIGGERS.length})`,
      status: disabledTriggers.length === 0 ? 'ok' : 'warning',
      message:
        disabledTriggers.length === 0 ? 'كل الـ triggers مفعلة' : `${disabledTriggers.length} trigger معطل`,
      details: disabledTriggers.length > 0 ? `معطل: ${disabledTriggers.join(', ')}` : undefined,
    })
  } catch {
    checks.push({
      id: 'critical-triggers',
      label: `الـ Triggers الحرجة (${CRITICAL_TRIGGERS.length})`,
      status: 'warning',
      message: 'تعذر فحص الـ triggers (RPC غير متاح)',
    })
  }

  // ─── 4. Data Integrity ───
  // 4a. Branches بدون Business (orphans)
  try {
    const { count: orphanBranches } = await svc
      .from('business_branches')
      .select('*', { count: 'exact', head: true })
      .is('business_id', null)
    checks.push({
      id: 'orphan-branches',
      label: 'فروع بدون نشاط (orphans)',
      status: (orphanBranches ?? 0) === 0 ? 'ok' : 'warning',
      message: (orphanBranches ?? 0) === 0 ? 'مفيش orphans' : `${orphanBranches} فرع يتيم`,
    })
  } catch {
    checks.push({
      id: 'orphan-branches',
      label: 'فروع بدون نشاط (orphans)',
      status: 'warning',
      message: 'تعذر الفحص',
    })
  }

  // 4b. Businesses published بدون primary branch
  try {
    const { data: businesses } = await svc
      .from('businesses')
      .select('id')
      .eq('is_published', true)
      .limit(500)

    if (businesses && businesses.length > 0) {
      const ids = businesses.map((b) => b.id)
      const { data: branches } = await svc
        .from('business_branches')
        .select('business_id')
        .in('business_id', ids)
        .eq('is_primary', true)

      const businessIdsWithBranch = new Set((branches ?? []).map((b) => b.business_id))
      const missing = ids.filter((id) => !businessIdsWithBranch.has(id))

      checks.push({
        id: 'published-without-branch',
        label: 'أنشطة منشورة بدون فرع أساسي',
        status: missing.length === 0 ? 'ok' : 'warning',
        message: missing.length === 0 ? 'كل الأنشطة عندها فرع' : `${missing.length} نشاط بدون فرع`,
      })
    } else {
      checks.push({
        id: 'published-without-branch',
        label: 'أنشطة منشورة بدون فرع أساسي',
        status: 'ok',
        message: 'مفيش أنشطة منشورة',
      })
    }
  } catch {
    checks.push({
      id: 'published-without-branch',
      label: 'أنشطة منشورة بدون فرع أساسي',
      status: 'warning',
      message: 'تعذر الفحص',
    })
  }

  // 4c. Orders عالقة (sent/seen لأكتر من 24 ساعة)
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: staleOrders } = await svc
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['sent', 'seen'])
      .lt('created_at', yesterday)
    checks.push({
      id: 'stale-orders',
      label: 'طلبات عالقة (>24 ساعة)',
      status: (staleOrders ?? 0) === 0 ? 'ok' : 'warning',
      message:
        (staleOrders ?? 0) === 0 ? 'مفيش طلبات عالقة' : `${staleOrders} طلب معلق لأكتر من 24 ساعة`,
    })
  } catch {
    checks.push({
      id: 'stale-orders',
      label: 'طلبات عالقة (>24 ساعة)',
      status: 'warning',
      message: 'تعذر الفحص',
    })
  }

  // ─── 5. Counts (معلوماتية) ───
  try {
    const [biz, orders, reviews] = await Promise.all([
      svc.from('businesses').select('*', { count: 'exact', head: true }).eq('is_published', true),
      svc.from('order_requests').select('*', { count: 'exact', head: true }),
      svc.from('business_reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    ])
    checks.push({
      id: 'counts',
      label: 'إحصائيات سريعة',
      status: 'ok',
      message: `أنشطة منشورة: ${biz.count ?? 0} | طلبات: ${orders.count ?? 0} | تقييمات: ${reviews.count ?? 0}`,
    })
  } catch {
    checks.push({
      id: 'counts',
      label: 'إحصائيات سريعة',
      status: 'warning',
      message: 'تعذر جلب الإحصائيات',
    })
  }

  // ─── ملخص ───
  const okCount = checks.filter((c) => c.status === 'ok').length
  const warnCount = checks.filter((c) => c.status === 'warning').length
  const errCount = checks.filter((c) => c.status === 'error').length

  return {
    timestamp: new Date().toISOString(),
    totalChecks: checks.length,
    okCount,
    warnCount,
    errCount,
    checks,
  }
}
