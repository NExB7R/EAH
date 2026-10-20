import { redirect } from 'next/navigation'
import SecondaryHero from '@/components/secondary-hero'
import AdminSidebar from '@/components/admin-sidebar'
import CommandPalette from '@/components/ui/command-palette'
import AdminMobileNav from './admin-mobile-nav'
import { ShieldCheckIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getAdminBadges } from '@/lib/data/admin'
import styles from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()

  if (!session) redirect('/auth?next=/admin')
  if (session.role !== 'admin' && session.role !== 'super_admin') redirect('/')

  const counts = await getAdminBadges()

  return (
    <main className={styles.page}>
      <SecondaryHero
        activeKey="admin"
        title="لوحة التحكم"
        Icon={ShieldCheckIcon}
        tone="purple"
        showNav={false}
      />
      <div className={styles.wrap}>
        <AdminMobileNav counts={counts} />
        <div className={styles.desktopSidebar}>
          <AdminSidebar counts={counts} />
        </div>
        <div className={styles.content}>{children}</div>
        <CommandPalette />
      </div>
    </main>
  )
}
