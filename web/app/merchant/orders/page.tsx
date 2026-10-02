import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMerchantOrders } from '@/lib/data/merchant'
import AccountPageHeader from '@/components/account-page-header'
import OrderList from './order-list'

export const dynamic = 'force-dynamic'

export default async function MerchantOrdersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/orders')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const orders = await getMerchantOrders(business.id)

  return (
    <div>
      <AccountPageHeader
        title="الطلبات"
        description={`${orders.length} طلب — أكّد خلال 10 دقايق`}
      />
      <OrderList orders={orders} />
    </div>
  )
}
