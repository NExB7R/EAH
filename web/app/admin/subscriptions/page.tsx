import { createClient } from '@/lib/supabase/server'
import { CrownGoldIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import SubscriptionRow from './subscription-row'
import styles from './subscriptions.module.css'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  status: string
  is_trial: boolean
  starts_at: string | null
  expires_at: string | null
  plan: { name_ar: string; price_egp: number } | null
  business: { name: string; slug: string } | null
}

async function getSubscriptions(): Promise<Row[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_subscriptions')
    .select(
      `
      id, status, is_trial, starts_at, expires_at,
      plan:subscription_plans(name_ar, price_egp),
      business:businesses(name, slug)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(100)

  return (data ?? []) as unknown as Row[]
}

export default async function AdminSubscriptionsPage() {
  const subs = await getSubscriptions()

  return (
    <div>
      <AccountPageHeader title="الاشتراكات" description={`${subs.length} اشتراك`} />

      {subs.length === 0 ? (
        <EmptyState Icon={CrownGoldIcon} title="مفيش اشتراكات" />
      ) : (
        <div className={styles.list}>
          {subs.map((s) => (
            <SubscriptionRow key={s.id} sub={s} />
          ))}
        </div>
      )}
    </div>
  )
}
