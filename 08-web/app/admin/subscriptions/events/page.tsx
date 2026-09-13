import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'سجل أحداث الاشتراكات' }

const EVENT_LABEL: Record<string, string> = {
  requested: '📩 طلب',
  approved: '✅ موافقة',
  rejected: '❌ رفض',
  trial_started: '🎁 تجربة بدأت',
  trial_expiring: '⏰ تنبيه انتهاء',
  expired: '⏹ انتهى',
  renewed: '🔄 تجديد',
  cancelled: '⏸ إلغاء',
  payment_received: '💰 دفع',
}

export default async function AdminSubsEventsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscription_events')
    .select(`
      id, event_type, metadata, created_at,
      business:businesses(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(300)

  const rows = (data ?? []) as any[]

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">SUBSCRIPTION EVENTS</span>
          <h1 className="admin-header__title">📜 سجل الأحداث</h1>
          <p className="admin-header__subtitle">آخر {rows.length} حدث</p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/subscriptions" className="admin-btn admin-btn--ghost">← الاشتراكات</Link>
        </div>
      </div>

      <div className="admin-table">
        <div className="admin-table__head">
          <span>الحدث</span>
          <span>النشاط</span>
          <span>تفاصيل</span>
          <span>التاريخ</span>
        </div>
        {rows.map((e) => (
          <div key={e.id} className="admin-table__row">
            <span>{EVENT_LABEL[e.event_type] ?? e.event_type}</span>
            <span>{e.business?.name ?? '—'}</span>
            <span className="admin-table__meta">
              {e.metadata?.days_left !== undefined && `باقي ${e.metadata.days_left} يوم`}
              {e.metadata?.reason && ` • ${e.metadata.reason}`}
            </span>
            <span>{new Date(e.created_at).toLocaleString('ar-EG')}</span>
          </div>
        ))}
      </div>
    </>
  )
}
