import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import './security.css'
import { IcBan, IcCheck, IcKey, IcList, IcUsers } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الأمان' }

export default async function AdminSecurityPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const now = new Date()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: bannedUsers },
    { count: totalUsers },
    { count: verifiedUsers },
    { count: audit24h },
    { count: audits7d },
    { count: totalBiz },
    { count: pendingChangeReqs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('banned_until', now.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('verified_at', 'is', null),
    supabase.from('audit_log').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
    supabase.from('audit_log').select('*', { count: 'exact', head: true }).gte('created_at', since7d),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('business_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const { data: recentAudit } = await supabase
    .from('audit_log')
    .select('id,action,entity_type,created_at,actor_email')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: bannedList } = await supabase
    .from('profiles')
    .select('id,display_name,phone,banned_until,ban_reason')
    .gt('banned_until', now.toISOString())
    .order('banned_until', { ascending: false })
    .limit(5)

  const envChecks = {
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    VAPID_KEYS: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    CRON_SECRET: !!process.env.CRON_SECRET,
    EAH_VISITOR_SALT: !!process.env.EAH_VISITOR_SALT,
  }
  const envOk = Object.values(envChecks).filter(Boolean).length
  const envTotal = Object.keys(envChecks).length
  const allEnvOk = envOk === envTotal

  return (
    <section className="sec">
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">مركز الأمان</span>
          <h1 className="admin-header__title">مركز الأمان</h1>
          <p className="admin-header__subtitle">نظرة حقيقية على أمان المنصة</p>
        </div>
      </header>

      <div className="sec__kpis">
        <div className="sec__kpi">
          <span className="sec__kpi-emoji"><IcUsers /></span>
          <span className="sec__kpi-val">{totalUsers ?? 0}</span>
          <span className="sec__kpi-label">مستخدم</span>
        </div>
        <div className="sec__kpi">
          <span className="sec__kpi-emoji"><IcCheck /></span>
          <span className="sec__kpi-val">{verifiedUsers ?? 0}</span>
          <span className="sec__kpi-label">موثّق</span>
        </div>
        <div className={`sec__kpi ${(bannedUsers ?? 0) > 0 ? 'sec__kpi--warn' : ''}`}>
          <span className="sec__kpi-emoji"><IcBan /></span>
          <span className="sec__kpi-val">{bannedUsers ?? 0}</span>
          <span className="sec__kpi-label">محظور</span>
        </div>
        <div className="sec__kpi">
          <span className="sec__kpi-emoji"></span>
          <span className="sec__kpi-val">{totalBiz ?? 0}</span>
          <span className="sec__kpi-label">نشاط</span>
        </div>
        <div className={`sec__kpi ${(pendingChangeReqs ?? 0) > 5 ? 'sec__kpi--warn' : ''}`}>
          <span className="sec__kpi-emoji"></span>
          <span className="sec__kpi-val">{pendingChangeReqs ?? 0}</span>
          <span className="sec__kpi-label">طلبات تعديل</span>
        </div>
        <div className="sec__kpi">
          <span className="sec__kpi-emoji"><IcList /></span>
          <span className="sec__kpi-val">{audit24h ?? 0}</span>
          <span className="sec__kpi-label">أحداث 24h</span>
        </div>
      </div>

      <div className="sec__section">
        <header className="sec__section-head">
          <h2 className="sec__section-title">
            <IcKey /> متغيرات البيئة
            <span className={`sec__badge ${allEnvOk ? 'sec__badge--ok' : 'sec__badge--warn'}`}>
              {envOk}/{envTotal}
            </span>
          </h2>
          <p className="sec__section-sub">فحص وجود المفاتيح (بدون عرض القيم)</p>
        </header>
        <div className="sec__env-grid">
          {Object.entries(envChecks).map(([key, ok]) => (
            <div key={key} className={`sec__env-item ${ok ? 'is-ok' : 'is-miss'}`}>
              <span className="sec__env-icon">{ok ? '' : ''}</span>
              <span className="sec__env-label">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {(bannedList ?? []).length > 0 && (
        <div className="sec__section">
          <header className="sec__section-head">
            <h2 className="sec__section-title">محظورين حالياً</h2>
          </header>
          <div className="sec__list">
            {(bannedList ?? []).map((b: any) => (
              <div key={b.id} className="sec__list-item sec__list-item--warn">
                <div className="sec__list-info">
                  <strong>{b.display_name ?? 'مستخدم'}</strong>
                  <span className="sec__list-phone">{b.phone ?? '—'}</span>
                </div>
                <div className="sec__list-meta">
                  <span>ينتهي: {new Date(b.banned_until).toLocaleDateString('ar-EG')}</span>
                  {b.ban_reason && <span className="sec__list-reason">السبب: {b.ban_reason}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sec__section">
        <header className="sec__section-head">
          <h2 className="sec__section-title">آخر 10 عمليات</h2>
          <p className="sec__section-sub">
            {audits7d ?? 0} عملية آخر 7 أيام —{' '}
            <Link href="/admin/audit" className="sec__link">عرض الكل ←</Link>
          </p>
        </header>
        <div className="sec__list">
          {(recentAudit ?? []).map((a: any) => (
            <div key={a.id} className="sec__list-item">
              <div className="sec__list-info">
                <strong>{a.action}</strong>
                <span className="sec__list-entity">{a.entity_type}</span>
              </div>
              <div className="sec__list-meta">
                <span>{a.actor_email ?? '—'}</span>
                <span>
                  {new Date(a.created_at).toLocaleString('ar-EG', {
                    day: 'numeric',
                    month: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          {(recentAudit ?? []).length === 0 && (
            <div className="sec__empty">مفيش أحداث حديثة</div>
          )}
        </div>
      </div>

      <div className="sec__section">
        <header className="sec__section-head">
          <h2 className="sec__section-title">ملاحظات</h2>
        </header>
        <div className="sec__notes">
          <div className="sec__note">
            <strong>RLS + SECURITY DEFINER</strong>
            <p>كل الجداول تحت RLS. الدوال المميزة محدودة الصلاحيات.</p>
          </div>
          <div className="sec__note">
            <strong>Rate Limiting</strong>
            <p>في الذاكرة حالياً — يتحول لتوزيعي (Redis) قبل الإنتاج.</p>
          </div>
          <div className="sec__note">
            <strong>MFA للسوبر أدمن</strong>
            <p>قيد التخطيط — راجع docs/SECURITY-HARDENING.md</p>
          </div>
        </div>
      </div>
    </section>
  )
}
