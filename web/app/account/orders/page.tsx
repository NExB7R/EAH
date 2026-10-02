import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileTextIcon, MapPinIcon, ClockIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getOrders } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './orders.module.css'

export const dynamic = 'force-dynamic'

type StatusMeta = { label: string; tone: string; step: number }

const STATUS_META: Record<string, StatusMeta> = {
  sent: { label: 'في الانتظار', tone: 'pending', step: 1 },
  seen: { label: 'شافه النشاط', tone: 'pending', step: 2 },
  accepted: { label: 'اتأكد', tone: 'ok', step: 3 },
  preparing: { label: 'بيتحضّر', tone: 'go', step: 4 },
  on_way: { label: 'في الطريق', tone: 'go', step: 5 },
  delivered: { label: 'اتسلّم', tone: 'done', step: 6 },
  rejected: { label: 'اترفض', tone: 'bad', step: 0 },
  cancelled: { label: 'اتلغى', tone: 'bad', step: 0 },
}

const STEPS = [
  { step: 1, label: 'طلب' },
  { step: 2, label: 'شافه' },
  { step: 3, label: 'وافق' },
  { step: 4, label: 'تحضير' },
  { step: 5, label: 'توصيل' },
  { step: 6, label: 'تم' },
]

export default async function OrdersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/orders')

  const orders = await getOrders(session.userId)

  return (
    <div>
      <AccountPageHeader
        title="طلباتي"
        description={`${orders.length} طلب — تابع حالتهم في الوقت الفعلي`}
      />

      {orders.length === 0 ? (
        <EmptyState
          Icon={FileTextIcon}
          title="مفيش طلبات لسه"
          description="لما تطلب من أي نشاط، الطلب هيظهر هنا"
          ctaHref="/explore"
          ctaLabel="اكتشف أنشطة"
        />
      ) : (
        <ul className={styles.list}>
          {orders.map((order) => {
            const meta: StatusMeta = STATUS_META[order.status] ??
              STATUS_META.sent ?? { label: order.status, tone: 'pending', step: 1 }
            const date = new Date(order.created_at).toLocaleString('ar-EG', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
            const isCancelled = order.status === 'rejected' || order.status === 'cancelled'

            return (
              <li key={order.id} className={styles.row}>
                <div className={styles.head}>
                  <span className={styles.code}>#{order.order_code}</span>
                  <span className={`${styles.status} ${styles[meta.tone]}`}>{meta.label}</span>
                </div>

                {order.business && (
                  <Link href={`/businesses/${order.business.slug}`} className={styles.biz}>
                    {order.business.name}
                    {order.business.area && (
                      <>
                        <span className={styles.dot}>·</span>
                        <MapPinIcon size={11} />
                        <span>{order.business.area}</span>
                      </>
                    )}
                  </Link>
                )}

                {!isCancelled && meta.step > 0 && (
                  <div className={styles.timeline}>
                    {STEPS.map((s) => {
                      const done = meta.step >= s.step
                      const active = meta.step === s.step
                      return (
                        <div
                          key={s.step}
                          className={`${styles.tlStep} ${done ? styles.tlDone : ''} ${active ? styles.tlActive : ''}`}
                        >
                          <span className={styles.tlDot} />
                          <span className={styles.tlLabel}>{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {isCancelled && (
                  <div className={styles.cancelledNote}>
                    {order.status === 'rejected'
                      ? 'النشاط معتذر عن الطلب — كلمه على واتساب لو محتاج'
                      : 'الطلب اتلغى'}
                  </div>
                )}

                <div className={styles.foot}>
                  <span className={styles.date}>
                    <ClockIcon size={11} /> {date}
                  </span>
                  {order.business && (
                    <Link href={`/businesses/${order.business.slug}`} className={styles.repeatBtn}>
                      اطلب تاني
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
