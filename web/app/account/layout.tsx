import { redirect } from 'next/navigation'
import SecondaryHero from '@/components/secondary-hero'
import AccountSidebar from '@/components/account-sidebar'
import { getUserSession } from '@/lib/data/user'
import { getAccountStats } from '@/lib/data/account'
import styles from './account.module.css'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account')

  const stats = await getAccountStats(session.userId)

  return (
    <main className={styles.page}>
      <SecondaryHero showNav={false} />
      <div className={styles.wrap}>
        <AccountSidebar unreadNotifs={stats.unreadNotifs} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  )
}
