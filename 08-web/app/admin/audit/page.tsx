import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AuditItem from './AuditItem'
import './audit.css'
import { IcInbox, IcScroll, IcCheck, IcBan, IcSparkle } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'سجل العمليات' }

type Log = {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  before_data: any
  after_data: any
  metadata: any
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
}

const FILTER_GROUPS = [
  { key: 'all', label: 'الكل' },
  { key: 'business', label: 'الأنشطة' },
  { key: 'subscription', label: 'الاشتراكات' },
  { key: 'user', label: 'المستخدمين' },
  { key: 'review', label: 'التقييمات' },
  { key: 'offer', label: 'العروض' },
  { key: 'points', label: 'النقاط' },
]

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const sp = await searchParams
  const filter = sp.filter ?? 'all'
  const q = (sp.q ?? '').trim().toLowerCase()

  // pending count
  const { count: pendingCount } = await supabase
    .from('pending_changes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  let query = supabase
    .from('audit_logs')
    .select('id,actor_user_id,action,entity_type,entity_id,before_data,after_data,metadata,reviewed_by,reviewed_at,review_note,created_at')
    .order('created_at', { ascending: false })
    .limit(300)

  if (filter !== 'all') query = query.ilike('action', `${filter}.%`)

  const { data: logs } = await query
  let rows = (logs ?? []) as Log[]

  // جلب actors
  const actorIds = [...new Set([
    ...rows.map((r) => r.actor_user_id).filter(Boolean),
    ...rows.map((r) => r.reviewed_by).filter(Boolean),
  ])] as string[]

  const { data: profiles } = actorIds.length
    ? await supabase.from('profiles').select('id,display_name,phone').in('id', actorIds)
    : { data: [] as any[] }
  const profMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  // search
  if (q) {
    rows = rows.filter((r) => {
      const actor = r.actor_user_id ? profMap.get(r.actor_user_id) : null
      const haystack = [r.action, r.entity_type, r.entity_id, actor?.display_name, actor?.phone]
      return haystack.some((x) => x && String(x).toLowerCase().includes(q))
    })
  }

  // stats
  const { data: allLogs } = await supabase
    .from('audit_logs')
    .select('action')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .limit(2000)

  const stats = { total: allLogs?.length ?? 0 }

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">السجل</span>
          <h1 className="admin-header__title">سجل العمليات</h1>
          <p className="admin-header__subtitle">
            {stats.total} عملية في آخر 7 أيام
            {pendingCount && pendingCount > 0 && ` • ${pendingCount} طلب معلق`}
          </p>
        </div>
        {pendingCount && pendingCount > 0 ? (
          <Link href="/admin/pending" className="admin-btn admin-btn--primary">
            <IcInbox /> الطلبات المعلقة ({pendingCount})
          </Link>
        ) : null}
      </header>

      <div className="aud-filters">
        <div className="aud-filters__pills">
          {FILTER_GROUPS.map((g) => (
            <Link
              key={g.key}
              href={`/admin/audit?filter=${g.key}${q ? `&q=${q}` : ''}`}
              className={`aud-pill ${filter === g.key ? 'is-active' : ''}`}
            >
              {g.label}
            </Link>
          ))}
        </div>
        <form className="aud-filters__search" action="/admin/audit" method="get">
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="ابحث (اسم/رقم/إجراء)..."
          />
          <button type="submit">ابحث</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="aud-empty">
          <IcScroll />
          <h3>مفيش عمليات</h3>
          <p>لسه مفيش عمليات مسجلة في الفترة دي.</p>
        </div>
      ) : (
        <div className="aud-list">
          {rows.map((log) => {
            const actor = log.actor_user_id ? profMap.get(log.actor_user_id) : null
            const reviewer = log.reviewed_by ? profMap.get(log.reviewed_by) : null
            return (
              <AuditItem
                key={log.id}
                log={log}
                actorName={actor?.display_name ?? undefined}
                reviewerName={reviewer?.display_name ?? undefined}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
