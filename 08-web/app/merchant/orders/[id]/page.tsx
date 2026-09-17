import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import OrderTimeline from '@/components/order/order-timeline'
import OrderStatusButtons from '../_components/OrderStatusButtons'
import './detail.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تفاصيل الطلب' }

const STATUS_LABEL: Record<string, string> = {
  sent: 'جديد',
  seen: 'شافه',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const BIZ_EMOJI: Record<string, string> = {
  restaurant: '',
  pharmacy: '',
  supermarket: '',
  delivery_office: '',
}

export default async function MerchantOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/merchant/orders')

  const { data: order } = await supabase
    .from('order_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!order) notFound()

  const { data: biz } = await supabase
    .from('businesses')
    .select('id,name,slug,business_type,owner_profile_id')
    .eq('id', order.business_id)
    .maybeSingle()

  if (biz?.owner_profile_id !== userData.user.id) {
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (role?.role !== 'super_admin') notFound()
  }

  const { data: history } = await supabase
    .from('order_status_history')
    .select('id,old_status,new_status,note,created_at')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  const emoji = BIZ_EMOJI[biz?.business_type ?? ''] ?? ''
  const waUrl = order.whatsapp_url ?? `https://wa.me/${order.customer_phone.replace(/\D/g, '')}`

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mod">
        <Link href="/merchant/orders" className="mod__back">← الطلبات</Link>

        <header className="mod__head">
          <span className="mod__kicker">تفاصيل الأوردر</span>
          <div className="mod__biz">
            <span className="mod__biz-emoji">{emoji}</span>
            <div>
              <h1 className="mod__biz-name">{biz?.name ?? 'نشاط'}</h1>
              <span className="mod__biz-date">
                {new Date(order.created_at).toLocaleString('ar-EG', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
          <span className="mod__status">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </header>

        <section className="mod__card mod__card--customer">
          <h2 className="mod__section-title">بيانات العميل</h2>
          <div className="mod__customer">
            <div className="mod__customer-name">
              <strong>{order.customer_name}</strong>
            </div>
            <div className="mod__customer-actions">
              <a href={`tel:${order.customer_phone}`} className="mod__btn mod__btn--call">
                اتصل
              </a>
              <a href={waUrl} target="_blank" rel="noreferrer" className="mod__btn mod__btn--wa">
                واتساب
              </a>
            </div>
          </div>
          <div className="mod__info">
            <div className="mod__info-row">
              <span>الموبايل</span>
              <strong dir="ltr">{order.customer_phone}</strong>
            </div>
            {order.customer_area && (
              <div className="mod__info-row">
                <span>المنطقة</span>
                <strong>{order.customer_area}</strong>
              </div>
            )}
            {order.customer_address && (
              <div className="mod__info-row">
                <span>العنوان</span>
                <strong>{order.customer_address}</strong>
              </div>
            )}
          </div>
        </section>

        <section className="mod__card">
          <h2 className="mod__section-title">الأوردر</h2>
          <p className="mod__items">{order.items_summary}</p>
          {order.notes && <div className="mod__notes">{order.notes}</div>}
        </section>

        <section className="mod__card">
          <h2 className="mod__section-title">إجراءات</h2>
          <OrderStatusButtons orderId={order.id} currentStatus={order.status as any} />
        </section>

        <section className="mod__card">
          <h2 className="mod__section-title">سجل الحالة</h2>
          <OrderTimeline items={(history ?? []) as any[]} />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
