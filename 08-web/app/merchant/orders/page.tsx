import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import OrderStatusButtons from './_components/OrderStatusButtons'
import './orders.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الطلبات' }

const STATUS_LABEL: Record<string, string> = {
  sent: 'جديد',
  seen: 'شافه',
  accepted: 'قبل الطلب',
  rejected: 'رفض',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const STATUS_COLOR: Record<string, string> = {
  sent: 'new',
  seen: 'seen',
  accepted: 'accepted',
  rejected: 'rejected',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export default async function MerchantOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const status = sp.status ?? 'all'

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/merchant/orders')

  // Get user's businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id,name,slug')
    .eq('owner_profile_id', userData.user.id)

  if (!businesses || businesses.length === 0) {
    return (
      <>
        <FloatingCapsuleHeader />
        <main className="mo">
          <div className="mo__empty">
            <span>🏪</span>
            <h1>مفيش نشاطات عندك</h1>
            <p>سجّل نشاطك الأول عشان تستقبل الطلبات.</p>
            <Link href="/merchant/apply" className="mo__empty-btn">
              سجّل نشاطك
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  const businessIds = businesses.map((b) => b.id)

  let query = supabase
    .from('order_requests')
    .select('id,business_id,customer_name,customer_phone,customer_area,customer_address,items_summary,notes,status,whatsapp_url,created_at')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false })
    .limit(200)

  if (status !== 'all') query = query.eq('status', status)

  const { data: orders } = await query

  // Counts
  const { data: allOrders } = await supabase
    .from('order_requests')
    .select('status')
    .in('business_id', businessIds)

  const counts = { all: 0, sent: 0, seen: 0, accepted: 0, rejected: 0, delivered: 0, cancelled: 0 }
  for (const o of (allOrders ?? []) as { status: string }[]) {
    counts.all++
    if (o.status in counts) counts[o.status as keyof typeof counts]++
  }

  const businessMap = new Map(businesses.map((b) => [b.id, b]))
  const tabs = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'sent', label: 'جديد', count: counts.sent },
    { key: 'accepted', label: 'مقبول', count: counts.accepted },
    { key: 'delivered', label: 'تم التسليم', count: counts.delivered },
    { key: 'rejected', label: 'مرفوض', count: counts.rejected },
  ]

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mo">
        <header className="mo__head">
          <Link href="/merchant" className="mo__back">← لوحة النشاط</Link>
          <div>
            <span className="mo__kicker">ORDER MANAGEMENT</span>
            <h1 className="mo__title">🛒 الطلبات</h1>
            <p className="mo__sub">
              {counts.sent > 0
                ? `⏳ عندك ${counts.sent} طلب جديد`
                : 'مفيش طلبات جديدة دلوقتي'}
            </p>
          </div>
        </header>

        <div className="mo__tabs">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/merchant/orders${t.key === 'all' ? '' : `?status=${t.key}`}`}
              className={`mo__tab ${status === t.key ? 'is-active' : ''}`}
            >
              {t.label}
              <span className="mo__tab-badge">{t.count}</span>
            </Link>
          ))}
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="mo__empty-state">
            <span className="mo__empty-emoji">📭</span>
            <h2 className="mo__empty-title">مفيش طلبات هنا</h2>
            <p className="mo__empty-text">
              لما العملاء يطلبوا، هتظهر طلباتهم هنا مع رقمهم والأوردر.
            </p>
          </div>
        ) : (
          <div className="mo__list">
            {orders.map((o: any) => {
              const biz = businessMap.get(o.business_id)
              return (
                <article key={o.id} className={`mo__order mo__order--${STATUS_COLOR[o.status]}`}>
                  <header className="mo__order-head">
                    <div>
                      <strong className="mo__customer">{o.customer_name}</strong>
                      <a
                        href={`tel:${o.customer_phone}`}
                        className="mo__phone"
                        dir="ltr"
                      >
                        📱 {o.customer_phone}
                      </a>
                    </div>
                    <span className={`mo__status mo__status--${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </header>

                  <div className="mo__meta">
                    <span className="mo__meta-item">🏪 {biz?.name ?? 'نشاط'}</span>
                    {o.customer_area && (
                      <span className="mo__meta-item">📍 {o.customer_area}</span>
                    )}
                    <span className="mo__meta-item">
                      📅 {new Date(o.created_at).toLocaleString('ar-EG', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {o.customer_address && (
                    <div className="mo__address">🏠 {o.customer_address}</div>
                  )}

                  <div className="mo__items">
                    <strong>📝 الأوردر:</strong>
                    <p>{o.items_summary}</p>
                  </div>

                  {o.notes && (
                    <div className="mo__notes">💬 {o.notes}</div>
                  )}

                  <OrderStatusButtons orderId={o.id} currentStatus={o.status as any} />

                  <div className="mo__actions">
                    <a
                      href={o.whatsapp_url ?? `https://wa.me/${o.customer_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mo__btn mo__btn--wa"
                    >
                      💬 رد على واتساب
                    </a>
                    <a
                      href={`tel:${o.customer_phone}`}
                      className="mo__btn mo__btn--ghost"
                    >
                      📞 اتصل
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
