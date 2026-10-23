import { FileTextIcon, CheckCircleIcon, ClockIcon, AlertIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import StatCard from '@/components/dashboard/stat-card'
import { getAdminOrders, computeAdminOrdersStats } from '@/lib/data/admin-orders'
import AdminOrdersList from './orders-list'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(300)
  const stats = computeAdminOrdersStats(orders)

  return (
    <div>
      <AccountPageHeader
        title="الطلبات"
        description={`${stats.total.toLocaleString('en-US')} طلب — ${stats.today.toLocaleString('en-US')} اليوم`}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard icon={ClockIcon} label="معلقة" value={stats.pending} tone="orange" />
        <StatCard icon={AlertIcon} label="نشطة" value={stats.in_progress} tone="purple" />
        <StatCard icon={CheckCircleIcon} label="اتسلّمت" value={stats.delivered} tone="teal" />
        <StatCard icon={FileTextIcon} label="النهاردة" value={stats.today} tone="gold" />
      </div>

      <AdminOrdersList orders={orders} />
    </div>
  )
}
