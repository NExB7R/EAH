import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileTextIcon, MapPinIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getOrders } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './orders.module.css'

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  pending: { label: 'في الانتظار', tone: 'pending' },
  confirmed: { label: 'اتأكد', tone: 'confirmed' },
  preparing: { label: 'جاري التحضير', tone: 'preparing' },
  on_way: { label: 'في الطريق', tone: 'onway' },
  delivered: { label: 'اتسلّم', tone: 'delivered' },
  cancelled: { label: 'اتلغى', tone: 'cancelled' },
}

export default async function OrdersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/orders')

  const orders = await getOrders(session.userId)

  return (
    <div>
      <AccountPageHeader
        title="الطلبات"
        description={`${orders.length} طلب`}
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
            const meta = STATUS_LABEL[order.status] ?? {
              label: order.status,
              tone: 'pending',
            }
            const date = new Date(order.created_at).toLocaleDateString('ar-EG')
            return (
              <li key={order.id} className={styles.row}>
                <div className={styles.head}>
                  <span className={styles.code}>#{order.order_code}</span>
                  <span className={`${styles.status} ${styles[meta.tone]}`}>
                    {meta.label}
                  </span>
                </div>
                {order.business && (
                  <Link
                    href={`/businesses/${order.business.slug}`}
                    className={styles.biz}
                  >
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
                <div className={styles.foot}>
                  <span className={styles.date}>{date}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
