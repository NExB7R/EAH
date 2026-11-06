import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import styles from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/admin')
  if (session.role !== 'super_admin') redirect('/')

  return (
    <main
      className={styles.page}
      style={{ paddingTop: 'calc(90px + env(safe-area-inset-top))' }}
    >
      <div id="admin-content" className={styles.content} tabIndex={-1}>
        {children}
      </div>
    </main>
  )
}
