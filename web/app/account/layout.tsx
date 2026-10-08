import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import SecondaryHero from '@/components/secondary-hero'
import AccountSidebar from '@/components/account-sidebar'
import { getUserSession } from '@/lib/data/user'
import { getAccountStats } from '@/lib/data/account'
import { getRoleContext, getRedirectForRole } from '@/lib/auth/roles'
import styles from './account.module.css'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account')

  const pathname = (await headers()).get('x-pathname') ?? '/account'
  const { role } = await getRoleContext()
  const redirectTo = getRedirectForRole(role, pathname)
  if (redirectTo) redirect(redirectTo)

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
