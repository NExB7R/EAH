import { redirect } from 'next/navigation'
import { FileTextIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getOrders } from '@/lib/data/account'
import { autoDeliverDueOrders, sendFeedbackReminders } from '@/lib/data/orders-auto'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import OrdersList from './orders-list'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/orders')

  await Promise.all([autoDeliverDueOrders(), sendFeedbackReminders()])
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
          description="لما تطلب من أي نشاط، هتلاقي تفاصيل الطلب هنا — تقدر تتابع حالته في الوقت الفعلي"
          ctaHref="/explore"
          ctaLabel="اكتشف أنشطة"
          variant="info"
        />
      ) : (
        <OrdersList orders={orders} />
      )}
    </div>
  )
}
