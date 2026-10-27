import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import SecondaryHero from '@/components/secondary-hero'
import MerchantSidebar from '@/components/merchant-sidebar'
import { CrownGoldIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { createClient } from '@/lib/supabase/server'
import { getRoleContext, getRedirectForRole } from '@/lib/auth/roles'
import styles from './merchant.module.css'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '/merchant'

  // The application wizard owns its public shell and deliberately supports
  // signed-out visitors. Do not wrap it in the merchant dashboard or redirect
  // it to merchant sign-in before the form can render.
  if (pathname.startsWith('/merchant/apply')) return children

  const session = await getUserSession()
  if (!session) redirect(`/auth?next=${encodeURIComponent(pathname)}`)

  const { role } = await getRoleContext()
  const redirectTo = getRedirectForRole(role, pathname)
  if (redirectTo) redirect(redirectTo)

  const business = await getMyBusiness(session.userId)

  // لو عنده نشاط → نحسب الطلبات الجديدة
  let newOrders = 0
  if (business) {
    const supabase = await createClient()
    const { count } = await supabase
      .from('order_requests')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .in('status', ['sent', 'seen'])
    newOrders = count ?? 0
  }

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="merchant"
        title="لوحة البايع"
        Icon={CrownGoldIcon}
        tone="gold"
        countLabel={business ? 'نشاط' : 'بدون نشاط'}
        count={business ? 1 : 0}
        showNav={false}
      />

      <div className={styles.wrap}>
        <MerchantSidebar newOrders={newOrders} hasBusiness={!!business} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  )
}
