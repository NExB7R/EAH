import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import OrderTimeline from '@/components/order/order-timeline'
import './detail.css'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'تفاصيل الطلب' }

const STATUS_LABEL: Record<string, string> = {
  sent: 'مُرسل',
  seen: 'شافه',
  accepted: 'تم القبول',
  rejected: 'مرفوض',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const STATUS_COLOR: Record<string, string> = {
  sent: 'pending',
  seen: 'seen',
  accepted: 'accepted',
  rejected: 'rejected',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

const BIZ_EMOJI: Record<string, string> = {
  restaurant: '',
  pharmacy: '',
  supermarket: '',
  delivery_office: '',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/orders')

  const { data: order } = await supabase
    .from('order_requests')
    .select('*')
    .eq('id', id)
    .eq('customer_user_id', userData.user.id)
    .maybeSingle()

  if (!order) notFound()

  const [bizRes, histRes] = await Promise.all([
    supabase
      .from('businesses')
      .select('id,name,slug,business_type')
      .eq('id', order.business_id)
      .maybeSingle(),
    supabase
      .from('order_status_history')
      .select('id,old_status,new_status,note,created_at')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
  ])

  const biz = bizRes.data
  const history = (histRes.data ?? []) as any[]
  const emoji = BIZ_EMOJI[biz?.business_type ?? ''] ?? ''
  const colorClass = STATUS_COLOR[order.status] ?? 'pending'

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="od">
        <Link href="/account/orders" className="od__back">← طلباتي</Link>

        <header className="od__head">
          <span className="od__kicker">تفاصيل الأوردر</span>
          <div className="od__biz">
            <span className="od__biz-emoji">{emoji}</span>
            <div>
              <h1 className="od__biz-name">{biz?.name ?? 'نشاط'}</h1>
              <span className="od__biz-date">
                {new Date(order.created_at).toLocaleString('ar-EG', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          <span className={`od__status od__status--${colorClass}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </header>

        <section className="od__card">
          <h2 className="od__section-title">تفاصيل الأوردر</h2>
          <p className="od__items">{order.items_summary}</p>
          {order.notes && (
            <div className="od__notes">{order.notes}</div>
          )}
        </section>

        <section className="od__card">
          <h2 className="od__section-title">معلومات التوصيل</h2>
          <div className="od__info">
            <div className="od__info-row">
              <span>الاسم</span>
              <strong>{order.customer_name}</strong>
            </div>
            <div className="od__info-row">
              <span>الموبايل</span>
              <strong dir="ltr">{order.customer_phone}</strong>
            </div>
            {order.customer_area && (
              <div className="od__info-row">
                <span>المنطقة</span>
                <strong>{order.customer_area}</strong>
              </div>
            )}
            {order.customer_address && (
              <div className="od__info-row">
                <span>العنوان</span>
                <strong>{order.customer_address}</strong>
              </div>
            )}
          </div>
        </section>

        <section className="od__card">
          <h2 className="od__section-title">سجل الحالة</h2>
          <OrderTimeline items={history} />
        </section>

        {order.whatsapp_url && (
          <a
            href={order.whatsapp_url}
            target="_blank"
            rel="noreferrer"
            className="od__wa"
          >
            تواصل مع المطعم على واتساب
          </a>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
