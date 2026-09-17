import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { getAllPlans, statusLabel, statusColor } from '@/lib/subscription'
import SubscriptionActions from './SubscriptionActions'
import './subscriptions.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الاشتراكات' }

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '',
  pharmacy: '',
  supermarket: '',
  delivery_office: '',
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()
  const plans = await getAllPlans()

  let q = supabase
    .from('business_subscriptions')
    .select(`
      id, business_id, plan_id, status, is_trial, starts_at, expires_at,
      rejected_reason, notes, created_at,
      business:businesses(name, slug, business_type)
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && status !== 'all') q = q.eq('status', status)

  const { data: subs } = await q
  const rows = (subs ?? []) as any[]

  const counts = {
    all: 0, pending: 0, trial: 0, active: 0, expired: 0, rejected: 0, cancelled: 0,
  }
  const { data: allRows } = await supabase
    .from('business_subscriptions')
    .select('status')
  for (const r of (allRows ?? []) as any[]) {
    counts.all++
    if (counts[r.status as keyof typeof counts] !== undefined) {
      counts[r.status as keyof typeof counts]++
    }
  }

  const tabs = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'pending', label: 'قيد المراجعة', count: counts.pending },
    { key: 'trial', label: 'تجريبي', count: counts.trial },
    { key: 'active', label: 'نشط', count: counts.active },
    { key: 'expired', label: 'منتهي', count: counts.expired },
    { key: 'rejected', label: 'مرفوض', count: counts.rejected },
    { key: 'cancelled', label: 'ملغي', count: counts.cancelled },
  ]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">الاشتراكات</span>
          <h1 className="admin-header__title">الاشتراكات</h1>
          <p className="admin-header__subtitle">
            {counts.pending > 0
              ? `${counts.pending} طلب قيد المراجعة`
              : `${counts.all} اشتراك — كل شيء تحت السيطرة`}
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/subscriptions/plans" className="admin-btn admin-btn--ghost">
            ⚙️ إدارة الباقات
          </Link>
          <Link href="/admin/subscriptions/events" className="admin-btn admin-btn--ghost">
            📜 الأحداث
          </Link>
        </div>
      </div>

      <div className="sub-tabs">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/subscriptions${t.key === 'all' ? '' : `?status=${t.key}`}`}
            className={`sub-tab ${(status ?? 'all') === t.key ? 'is-active' : ''}`}
          >
            {t.label}
            <span className="sub-tab__badge">{t.count}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty__emoji"></span>
          <h2 className="admin-empty__title">مفيش اشتراكات هنا</h2>
          <p className="admin-empty__msg">لما التجار يطلبوا ترقية، هيظهروا هنا</p>
        </div>
      ) : (
        <div className="sub-list">
          {rows.map((s) => (
            <article key={s.id} className="sub-row">
              <div className="sub-row__head">
                <div className="sub-row__thumb">
                  {TYPE_EMOJI[s.business?.business_type ?? ''] ?? ''}
                </div>
                <div className="sub-row__info">
                  <h3 className="sub-row__name">
                    {s.business?.name ?? 'نشاط محذوف'}
                  </h3>
                  <span className="sub-row__slug">/{s.business?.slug}</span>
                  {s.notes && <span className="sub-row__notes">{s.notes}</span>}
                </div>
                <span
                  className="sub-row__status"
                  style={{
                    background: `${statusColor(s.status)}20`,
                    color: statusColor(s.status),
                    borderColor: `${statusColor(s.status)}40`,
                  }}
                >
                  {statusLabel(s.status)}
                </span>
              </div>

              <div className="sub-row__meta">
                {s.is_trial && <span className="sub-row__chip sub-row__chip--trial">تجريبي</span>}
                {s.starts_at && (
                  <span className="sub-row__chip">
                    ▶ {new Date(s.starts_at).toLocaleDateString('ar-EG')}
                  </span>
                )}
                {s.expires_at && (
                  <span className="sub-row__chip">
                    ⏹ {new Date(s.expires_at).toLocaleDateString('ar-EG')}
                  </span>
                )}
                <span className="sub-row__chip sub-row__chip--muted">
                  📅 {new Date(s.created_at).toLocaleDateString('ar-EG')}
                </span>
              </div>

              {s.rejected_reason && (
                <div className="sub-row__reason">{s.rejected_reason}</div>
              )}

              <SubscriptionActions id={s.id} status={s.status} plans={plans} />
            </article>
          ))}
        </div>
      )}
    </>
  )
}
