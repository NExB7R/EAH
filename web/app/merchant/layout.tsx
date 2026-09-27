import { redirect } from 'next/navigation'
import SecondaryHero from '@/components/secondary-hero'
import MerchantSidebar from '@/components/merchant-sidebar'
import { CrownGoldIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { createClient } from '@/lib/supabase/server'
import styles from './merchant.module.css'

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant')

  const business = await getMyBusiness(session.userId)

  // لو عنده نشاط → نحسب الطلبات الجديدة
  let newOrders = 0
  if (business) {
    const supabase = await createClient()
    const { count } = await supabase
      .from('order_requests')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('status', 'pending')
    newOrders = count ?? 0
  }

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="merchant"
        title="لوحة التحكم"
        Icon={CrownGoldIcon}
        tone="gold"
        countLabel={business ? 'نشاط' : 'بدون نشاط'}
        count={business ? 1 : 0}
        showNav={false}
      />

      <div className={styles.wrap}>
        <MerchantSidebar newOrders={newOrders} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  )
}
