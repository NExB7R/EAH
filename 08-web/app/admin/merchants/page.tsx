import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import MerchantActions from './MerchantActions'
import './merchants.css'
import { IcCalendar, IcInbox } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'طلبات التجار' }

const STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
}

const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '',
  pharmacy: '',
  supermarket: '',
  delivery_office: '',
}

const CATEGORY_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
}

type Application = {
  id: string
  user_id: string
  business_name: string
  category: string
  description: string | null
  status: string
  admin_note: string | null
  created_at: string
}

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const sp = await searchParams
  const status = sp.status ?? 'all'
  const q = (sp.q ?? '').trim().toLowerCase()

  const supabase = await createClient()
  let query = supabase
    .from('merchant_applications')
    .select('id,user_id,business_name,category,description,status,admin_note,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (status !== 'all') query = query.eq('status', status)

  const { data: apps } = await query
  let rows = (apps ?? []) as Application[]

  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const { data: profiles } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id,display_name,phone,phone_e164')
        .in('id', userIds)
    : { data: [] as any[] }

  const profMap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  if (q) {
    rows = rows.filter((r) => {
      const p = profMap.get(r.user_id)
      const haystack = [r.business_name, r.category, p?.display_name, p?.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  const { data: allRows } = await supabase
    .from('merchant_applications')
    .select('status')
  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 }
  for (const r of (allRows ?? []) as { status: string }[]) {
    counts.all++
    if (r.status in counts) counts[r.status as keyof typeof counts]++
  }

  const tabs = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'pending', label: 'قيد المراجعة', count: counts.pending },
    { key: 'approved', label: 'مقبول', count: counts.approved },
    { key: 'rejected', label: 'مرفوض', count: counts.rejected },
  ]

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">مراجعة التجار</span>
          <h1 className="admin-header__title">🧾 طلبات التجار</h1>
          <p className="admin-header__subtitle">
            {counts.pending > 0
              ? `${counts.pending} طلب قيد المراجعة — وافق أو ارفض`
              : 'مفيش طلبات معلقة — كل الطلبات اتراجعت'}
          </p>
        </div>
      </header>

      <div className="mrch-stats">
        <div className="mrch-stat mrch-stat--all">
          <span className="mrch-stat__num">{counts.all}</span>
          <span className="mrch-stat__label">إجمالي</span>
        </div>
        <div className="mrch-stat mrch-stat--pending">
          <span className="mrch-stat__num">{counts.pending}</span>
          <span className="mrch-stat__label">قيد المراجعة</span>
        </div>
        <div className="mrch-stat mrch-stat--approved">
          <span className="mrch-stat__num">{counts.approved}</span>
          <span className="mrch-stat__label">مقبول</span>
        </div>
        <div className="mrch-stat mrch-stat--rejected">
          <span className="mrch-stat__num">{counts.rejected}</span>
          <span className="mrch-stat__label">مرفوض</span>
        </div>
      </div>

      <div className="mrch-tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/merchants${t.key === 'all' ? '' : `?status=${t.key}`}`}
            className={`mrch-tab ${status === t.key ? 'is-active' : ''}`}
          >
            {t.label}
            <span className="mrch-tab__badge">{t.count}</span>
          </Link>
        ))}
      </div>

      <form className="mrch-search" action="/admin/merchants" method="get">
        {status !== 'all' && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          placeholder=" ابحث باسم النشاط أو رقم المتقدم..."
          defaultValue={sp.q ?? ''}
        />
      </form>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"><IcInbox /></span>
          <h2 className="admin-empty__title">مفيش طلبات هنا</h2>
          <p className="admin-empty__msg">
            {q ? 'مفيش نتائج للبحث ده' : 'لما تجار يسجلوا، هيظهروا هنا للمراجعة'}
          </p>
        </div>
      ) : (
        <div className="mrch-list">
          {rows.map((a) => {
            const p = profMap.get(a.user_id)
            const catEmoji = CATEGORY_EMOJI[a.category] ?? ''
            const catLabel = CATEGORY_LABEL[a.category] ?? a.category
            return (
              <article
                key={a.id}
                className={`mrch-card mrch-card--${STATUS_CLASS[a.status] ?? 'pending'}`}
              >
                <div className="mrch-card__head">
                  <div className="mrch-card__thumb">{catEmoji}</div>
                  <div className="mrch-card__info">
                    <h3 className="mrch-card__name">{a.business_name}</h3>
                    <span className="mrch-card__cat">{catLabel}</span>
                    <span className="mrch-card__submitter">
                      {p?.display_name || 'بدون اسم'} • {p?.phone || p?.phone_e164 || '—'}
                    </span>
                  </div>
                  <span className={`mrch-status mrch-status--${STATUS_CLASS[a.status] ?? 'pending'}`}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                </div>

                {a.description && (
                  <p className="mrch-card__desc">{a.description}</p>
                )}

                <div className="mrch-card__meta">
                  <span className="mrch-chip"><IcCalendar /> {new Date(a.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                {a.admin_note && (
                  <div className="mrch-card__note">{a.admin_note}</div>
                )}

                {a.status === 'pending' && (
                  <div className="mrch-card__foot">
                    <MerchantActions id={a.id} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
