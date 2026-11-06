import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserSession } from '@/lib/data/user'
import { getRoleContext, getRedirectForRole } from '@/lib/auth/roles'
import styles from './account.module.css'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account')

  const pathname = (await headers()).get('x-pathname') ?? '/account'
  const { role } = await getRoleContext()
  const redirectTo = getRedirectForRole(role, pathname)
  if (redirectTo) redirect(redirectTo)

  return (
    <main
      className={styles.page}
      style={{ paddingTop: 'calc(90px + env(safe-area-inset-top))' }}
    >
      <div className={styles.content}>{children}</div>
    </main>
  )
}
