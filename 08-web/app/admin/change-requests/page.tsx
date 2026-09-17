import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import ChangeRequestActions from './ChangeRequestActions'
import './change-requests.css'
import { IcCalendar, IcCheck, IcEdit, IcInbox, IcSearch, IcUser } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'مراجعة التعديلات' }

type Row = {
  id: string
  business_id: string
  submitted_by: string
  entity_type: string
  operation: string
  status: string
  admin_note: string | null
  payload: any
  created_at: string
  reviewed_at: string | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  cancelled: 'ملغي',
}
const STATUS_CLASS: Record<string, string> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  cancelled: 'rejected',
}
const ENTITY_LABEL: Record<string, string> = {
  business: 'النشاط',
  offer: 'العرض',
  menu: 'المنيو',
  media: 'الصور',
}
const OPERATION_LABEL: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
}

export default async function AdminChangeRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const sp = await searchParams
  const status = sp.status ?? 'all'
  const q = (sp.q ?? '').trim().toLowerCase()

  const supabase = await createClient()
  let query = supabase
    .from('business_change_requests')
    .select('id,business_id,submitted_by,entity_type,operation,status,admin_note,payload,created_at,reviewed_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status !== 'all') query = query.eq('status', status)

  const { data: requests } = await query
  let rows = (requests ?? []) as Row[]

  const businessIds = [...new Set(rows.map((r) => r.business_id))]
  const userIds = [...new Set(rows.map((r) => r.submitted_by))]

  const [bizRes, profRes] = await Promise.all([
    businessIds.length
      ? supabase.from('businesses').select('id,name,slug').in('id', businessIds)
      : Promise.resolve({ data: [] as any[] }),
    userIds.length
      ? supabase.from('profiles').select('id,display_name,phone').in('id', userIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const bizMap = new Map((bizRes.data ?? []).map((b: any) => [b.id, b]))
  const profMap = new Map((profRes.data ?? []).map((p: any) => [p.id, p]))

  // filter by search
  if (q) {
    rows = rows.filter((r) => {
      const biz = bizMap.get(r.business_id)
      const prof = profMap.get(r.submitted_by)
      const haystack = [
        biz?.name,
        biz?.slug,
        prof?.display_name,
        prof?.phone,
        r.entity_type,
        r.operation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  // counts
  const { data: allRows } = await supabase
    .from('business_change_requests')
    .select('status')
  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 }
  for (const r of (allRows ?? []) as { status: string }[]) {
    counts.all++
    if (r.status in counts) counts[r.status as keyof typeof counts]++
  }

  const tabs = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'pending', label: 'قيد المراجعة', count: counts.pending },
    { key: 'approved', label: 'معتمد', count: counts.approved },
    { key: 'rejected', label: 'مرفوض', count: counts.rejected },
  ]

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">مراجعة المحتوى</span>
          <h1 className="admin-header__title"><IcEdit /> مراجعة التعديلات</h1>
          <p className="admin-header__subtitle">
            {counts.pending > 0
              ? `⏳ ${counts.pending} طلب في انتظار المراجعة`
              : 'مفيش طلبات معلقة دلوقتي — كل التعديلات اتراجعت'}
          </p>
        </div>
      </header>

      <div className="cr-stats">
        <div className="cr-stat cr-stat--all">
          <span className="cr-stat__num">{counts.all}</span>
          <span className="cr-stat__label">إجمالي الطلبات</span>
        </div>
        <div className="cr-stat cr-stat--pending">
          <span className="cr-stat__num">{counts.pending}</span>
          <span className="cr-stat__label">قيد المراجعة</span>
        </div>
        <div className="cr-stat cr-stat--approved">
          <span className="cr-stat__num">{counts.approved}</span>
          <span className="cr-stat__label">معتمد</span>
        </div>
        <div className="cr-stat cr-stat--rejected">
          <span className="cr-stat__num">{counts.rejected}</span>
          <span className="cr-stat__label">مرفوض</span>
        </div>
      </div>

      <div className="cr-tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/change-requests${t.key === 'all' ? '' : `?status=${t.key}`}`}
            className={`cr-tab ${status === t.key ? 'is-active' : ''}`}
          >
            {t.label}
            <span className="cr-tab__badge">{t.count}</span>
          </Link>
        ))}
      </div>

      <form className="cr-search" action="/admin/change-requests" method="get">
        {status !== 'all' && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          placeholder=" ابحث باسم النشاط أو رقم المقدم..."
          defaultValue={sp.q ?? ''}
        />
      </form>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"><IcInbox /></span>
          <h2 className="admin-empty__title">مفيش طلبات هنا</h2>
          <p className="admin-empty__msg">
            {q ? 'مفيش نتائج للبحث ده' : 'لما التجار يبعتوا تعديلات، هتظهر هنا'}
          </p>
        </div>
      ) : (
        <div className="cr-list">
          {rows.map((r) => {
            const biz = bizMap.get(r.business_id)
            const prof = profMap.get(r.submitted_by)
            const payloadPreview = r.payload
              ? JSON.stringify(r.payload, null, 2).slice(0, 320)
              : '{}'

            return (
              <article
                key={r.id}
                className={`cr-card cr-card--${STATUS_CLASS[r.status] ?? 'pending'}`}
              >
                <div className="cr-card__head">
                  <div className="cr-card__biz">
                    <h3 className="cr-card__name">{biz?.name ?? 'نشاط محذوف'}</h3>
                    {biz?.slug && <span className="cr-card__slug">/{biz.slug}</span>}
                    <span className="cr-card__submitter">
                      <IcUser /> {prof?.display_name || prof?.phone || 'غير معروف'}
                    </span>
                  </div>
                  <span className={`cr-status cr-status--${STATUS_CLASS[r.status] ?? 'pending'}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>

                <div className="cr-card__meta">
                  <span className="cr-chip cr-chip--entity">
                    {ENTITY_LABEL[r.entity_type] ?? r.entity_type}
                  </span>
                  <span className="cr-chip cr-chip--op">
                    {OPERATION_LABEL[r.operation] ?? r.operation}
                  </span>
                  <span className="cr-chip cr-chip--muted"><IcCalendar /> {new Date(r.created_at).toLocaleDateString('ar-EG')}
                  </span>
                  {r.reviewed_at && (
                    <span className="cr-chip cr-chip--muted">
                      <IcCheck /> {new Date(r.reviewed_at).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>

                {r.status === 'pending' && r.payload && (
                  <div className="cr-card__preview">
                    <code>{payloadPreview}{payloadPreview.length >= 320 ? '...' : ''}</code>
                  </div>
                )}

                {r.admin_note && (
                  <div className="cr-card__note"><IcEdit /> {r.admin_note}</div>
                )}

                <div className="cr-card__foot">
                  <Link
                    href={`/admin/change-requests/${r.id}`}
                    className="cr-btn cr-btn--view"
                  >
                    <IcSearch /> مراجعة التفاصيل
                  </Link>
                  {r.status === 'pending' && <ChangeRequestActions id={r.id} />}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
