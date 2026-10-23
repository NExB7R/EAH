import Link from 'next/link'
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Link
          href="/merchant/orders/settings"
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--purple-light)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(168,85,247,0.08)',
          }}
        >
          ⚙ إعدادات الاستلام
        </Link>
      </div>
      <AccountPageHeader
        title="الطلبات"
        description={`${orders.length} طلب — أكّد خلال 10 دقايق`}
      />
      <OrderList orders={orders} />
    </div>
  )
}
