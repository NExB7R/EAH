import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AuditItem from './AuditItem'
import './audit.css'
import { IcInbox, IcScroll } from '@/components/eah-icons'

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
  created_at: string
}

const FILTER_GROUPS = [
  { key: 'all', label: 'الكل' },
  { key: 'business', label: 'الأنشطة' },
  { key: 'subscription', label: 'الاشتراكات' },
  { key: 'user', label: 'المستخدمين' },
  { key: 'review', label: 'التقييمات' },
  { key: 'offer', label: 'العروض' },
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
  if (roleRow?.role !== 'super_admin' && roleRow?.role !== 'admin') redirect('/')

  const sp = await searchParams
  const filter = sp.filter ?? 'all'
  const q = (sp.q ?? '').trim().toLowerCase()

  let query = supabase
    .from('audit_logs')
    .select('id,actor_user_id,action,entity_type,entity_id,before_data,after_data,metadata,created_at')
    .order('created_at', { ascending: false })
    .limit(300)

  if (filter !== 'all') query = query.ilike('action', `${filter}.%`)

  const { data: logs } = await query
  let rows = (logs ?? []) as Log[]

  // جلب actors
  const actorIds = [...new Set(rows.map((r) => r.actor_user_id).filter(Boolean))] as string[]
  const { data: profiles } = actorIds.length
    ? await supabase.from('profiles').select('id,display_name,phone').in('id', actorIds)
    : { data: [] as any[] }
  const profMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  // filter by search
  if (q) {
    rows = rows.filter((r) => {
      const actor = r.actor_user_id ? profMap.get(r.actor_user_id) : null
      const haystack = [
        r.action,
        r.entity_type,
        r.entity_id,
        actor?.display_name,
        actor?.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  // counts
  const { data: allLogs } = await supabase.from('audit_logs').select('action')
  const counts = { all: 0, business: 0, subscription: 0, user: 0, review: 0, offer: 0 }
  for (const r of (allLogs ?? []) as { action: string }[]) {
    counts.all++
    const prefix = r.action.split('.')[0] as keyof typeof counts
    if (prefix in counts) counts[prefix]++
  }

  const tabs = FILTER_GROUPS.map((g) => ({
    ...g,
    count: counts[g.key as keyof typeof counts] ?? 0,
  }))

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">سجل العمليات</span>
          <h1 className="admin-header__title"><IcScroll /> سجل العمليات</h1>
          <p className="admin-header__subtitle">
            {counts.all} عملية مسجلة — كل الحركات المهمة على المنصة
          </p>
        </div>
      </div>

      <div className="aud-stats">
        <div className="aud-stat">
          <span className="aud-stat__num">{counts.all}</span>
          <span className="aud-stat__label">إجمالي العمليات</span>
        </div>
        <div className="aud-stat">
          <span className="aud-stat__num">{counts.business}</span>
          <span className="aud-stat__label">عمليات الأنشطة</span>
        </div>
        <div className="aud-stat">
          <span className="aud-stat__num">{counts.subscription}</span>
          <span className="aud-stat__label">عمليات الاشتراكات</span>
        </div>
        <div className="aud-stat">
          <span className="aud-stat__num">{counts.user}</span>
          <span className="aud-stat__label">عمليات المستخدمين</span>
        </div>
      </div>

      <div className="aud-tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/audit${t.key === 'all' ? '' : `?filter=${t.key}`}`}
            className={`aud-tab ${filter === t.key ? 'is-active' : ''}`}
          >
            {t.label}
            {t.key !== 'all' && <span className="aud-tab__badge">{t.count}</span>}
          </Link>
        ))}
      </div>

      <form className="aud-search" action="/admin/audit" method="get">
        {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
        <input
          type="text"
          name="q"
          placeholder=" ابحث بالفاعل أو العملية أو المعرّف..."
          defaultValue={sp.q ?? ''}
        />
      </form>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"><IcInbox /></span>
          <h2 className="admin-empty__title">مفيش عمليات هنا</h2>
          <p className="admin-empty__msg">
            {q ? 'مفيش نتائج للبحث ده' : 'كل العمليات هتظهر هنا لحظة بلحظة'}
          </p>
        </div>
      ) : (
        <div className="aud-timeline">
          {rows.map((log) => (
            <AuditItem
              key={log.id}
              log={log}
              actorName={
                log.actor_user_id
                  ? profMap.get(log.actor_user_id)?.display_name ??
                    profMap.get(log.actor_user_id)?.phone ??
                    undefined
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
