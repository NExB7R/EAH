import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserSession } from '@/lib/data/user'
import { getRoleContext, getRedirectForRole } from '@/lib/auth/roles'
import styles from './merchant.module.css'

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '/merchant'
  if (pathname.startsWith('/merchant/apply')) return children

  const session = await getUserSession()
  if (!session) redirect(`/auth?next=${encodeURIComponent(pathname)}`)

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
