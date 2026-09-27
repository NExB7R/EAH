import { redirect } from 'next/navigation'
import SecondaryHero from '@/components/secondary-hero'
import { ShieldCheckIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import styles from './admin.module.css'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getUserSession()

  if (!session) redirect('/auth?next=/admin')
  if (session.role !== 'admin' && session.role !== 'super_admin') {
    redirect('/')
  }

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="admin"
        title="لوحة الأدمن"
        Icon={ShieldCheckIcon}
        tone="purple"
        showNav={false}
      />
      <div className={styles.wrap}>{children}</div>
    </main>
  )
}
