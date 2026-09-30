import { redirect } from 'next/navigation'
import { FileTextIcon, PhoneIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMerchantOrders } from '@/lib/data/merchant'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import styles from './orders.module.css'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: 'جديد', tone: 'pending' },
  confirmed: { label: 'اتأكد', tone: 'confirmed' },
  preparing: { label: 'بيتحضّر', tone: 'preparing' },
  on_way: { label: 'في الطريق', tone: 'onway' },
  delivered: { label: 'اتسلّم', tone: 'delivered' },
  cancelled: { label: 'اتلغى', tone: 'cancelled' },
}

export default async function MerchantOrdersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/orders')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const orders = await getMerchantOrders(business.id)

  return (
    <div>
      <AccountPageHeader title="الطلبات" description={`${orders.length} طلب`} />
      {orders.length === 0 ? (
        <EmptyState
          Icon={FileTextIcon}
          title="مفيش طلبات لسه"
          description="لما حد يطلب منك، الطلب هيظهر هنا فوراً"
        />
      ) : (
        <ul className={styles.list}>
          {orders.map((order) => {
            const meta = STATUS[order.status] ?? { label: order.status, tone: 'pending' }
            const date = new Date(order.created_at).toLocaleString('ar-EG', {
              dateStyle: 'short',
              timeStyle: 'short',
            })

            return (
              <li key={order.id} className={styles.row}>
                <div className={styles.head}>
                  <span className={styles.code}>#{order.order_code}</span>
                  <span className={`${styles.status} ${styles[meta.tone]}`}>{meta.label}</span>
                </div>

                {order.customer_name && (
                  <div className={styles.info}>
                    <span className={styles.customer}>{order.customer_name}</span>
                    {order.customer_phone && (
                      <a href={`tel:${order.customer_phone}`} className={styles.phone}>
                        <PhoneIcon size={12} />
                        {order.customer_phone}
                      </a>
                    )}
                  </div>
                )}

                {order.message && <p className={styles.message}>{order.message.slice(0, 200)}</p>}

                <div className={styles.foot}>
                  <span className={styles.date}>{date}</span>
                  {order.customer_phone && (
                    <a
                      href={`https://wa.me/2${order.customer_phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.replyBtn}
                    >
                      رد على واتساب
                    </a>
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
