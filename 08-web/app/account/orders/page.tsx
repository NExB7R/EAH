import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import PageLogo from '@/components/page-logo'
import SiteFooter from '@/components/site-footer'
import './orders.css'
import { IcBan } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'طلباتي' }

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

const BUSINESS_EMOJI: Record<string, string> = {
  restaurant: '',
  pharmacy: '',
  supermarket: '',
  delivery_office: '',
}

export default async function AccountOrdersPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/orders')

  const { data: orders } = await supabase
    .from('order_requests')
    .select('id,business_id,customer_name,customer_phone,customer_area,customer_address,items,notes,status,created_at,updated_at')
    .eq('customer_user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch business names
  const businessIds = [...new Set((orders ?? []).map((o) => o.business_id))]
  const { data: businesses } = businessIds.length > 0
    ? await supabase
        .from('businesses')
        .select('id,name,slug,business_type')
        .in('id', businessIds)
    : { data: [] as any[] }

  const bizMap = new Map((businesses ?? []).map((b: any) => [b.id, b]))

  return (
    <>
      <FloatingCapsuleHeader />
      <PageLogo />
      <main className="ao">
        <header className="ao__head">
          <Link href="/account" className="ao__back">← حسابي</Link>
          <span className="ao__kicker">أوردراتي</span>
          <h1 className="ao__title e-gradient">طلباتي</h1>
          <p className="ao__sub">
            كل الطلبات اللي عملتها — بدون تسجيل، مباشر من واتساب
          </p>
        </header>

        {(!orders || orders.length === 0) ? (
          <div className="ao__empty">
            <span className="ao__empty-emoji"></span>
            <h2 className="ao__empty-title">مفيش طلبات لسه</h2>
            <p className="ao__empty-text">
              اطلب من أي مطعم أو صيدلية في المنصة — كل طلباتك هتظهر هنا
            </p>
            <Link href="/explore" className="ao__empty-btn">
              اكتشف الأماكن
            </Link>
          </div>
        ) : (
          <div className="ao__list">
            {orders.map((o: any) => {
              const biz = bizMap.get(o.business_id)
              const emoji = BUSINESS_EMOJI[biz?.business_type] ?? ''
              const colorClass = STATUS_COLOR[o.status] ?? 'pending'
              return (
                <Link key={o.id} href={`/account/orders/${o.id}`} className={`ao__order ao__order--${colorClass}`}>
                  <header className="ao__order-head">
                    <div className="ao__biz">
                      <span className="ao__biz-emoji">{emoji}</span>
                      <div>
                        <strong className="ao__biz-name">
                          {biz?.name ?? 'نشاط'}
                        </strong>
                        <span className="ao__date">
                          {new Date(o.created_at).toLocaleString('ar-EG', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`ao__status ao__status--${colorClass}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </header>

                  <div className="ao__items">
                    <p>{o.items}</p>
                  </div>

                  {o.customer_address && (
                    <div className="ao__meta">
                      {o.customer_area ? o.customer_area + ' - ' : ''}{o.customer_address}
                    </div>
                  )}

                  {o.notes && (
                    <div className="ao__notes">{o.notes}</div>
                  )}

                  <footer className="ao__foot">
                    <span className="ao__foot-text">
                      {o.status === 'delivered' && 'تم التسليم'}
                      {o.status === 'accepted' && 'المطعم قبل طلبك'}
                      {o.status === 'rejected' && 'المطعم رفض — جرّب مكان تاني'}
                      {o.status === 'cancelled' && <><IcBan /> ملغي</>}
                      {o.status === 'seen' && 'المطعم شاف طلبك'}
                      {o.status === 'sent' && 'في انتظار رد المطعم'}
                    </span>
                  </footer>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
