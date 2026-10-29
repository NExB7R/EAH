import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/logo'
import SecondaryHero from '@/components/secondary-hero'
import AdminSidebar from '@/components/admin-sidebar'
import CommandPalette from '@/components/ui/command-palette'
import { ShieldCheckIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getAdminBadges } from '@/lib/data/admin'
import AdminTopbar from './admin-topbar'
import styles from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserSession()

  if (!session) redirect('/auth?next=/admin')
  if (session.role !== 'super_admin') redirect('/')

  const counts = await getAdminBadges()

  return (
    <main className={styles.page}>
      <Link href="#admin-content" className={styles.skipLink}>
        تخطي إلى المحتوى الرئيسي
      </Link>
      <SecondaryHero
        activeKey="admin"
        title="لوحة التحكم"
        Icon={ShieldCheckIcon}
        tone="purple"
        showNav={false}
      />
      <div className={styles.shell}>
        <aside className={styles.sidebarRail} aria-label="التنقل الرئيسي">
          <Link href="/admin" className={styles.brand} aria-label="EAH — لوحة الإدارة">
            <Logo size="xs" variant="compact" href={null} />
            <span className={styles.brandText}>
              <strong>EAH</strong>
              <small>إدارة المنصة</small>
            </span>
          </Link>
          <div className={styles.sidebarDivider} />
          <AdminSidebar counts={counts} />
          <div className={styles.sidebarBottom}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>مساحة الإدارة</span>
            <span className={styles.version}>EAH</span>
          </div>
        </aside>

        <div className={styles.workspace}>
          <AdminTopbar counts={counts} />
          <div id="admin-content" className={styles.content} tabIndex={-1}>
            {children}
          </div>
        </div>
        <CommandPalette />
      </div>
    </main>
  )
}
