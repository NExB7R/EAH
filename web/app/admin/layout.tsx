import { redirect } from 'next/navigation'
import SecondaryHero from '@/components/secondary-hero'
import AdminSidebar from '@/components/admin-sidebar'
import { ShieldCheckIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import styles from './admin.module.css'

const getAdminBadges = unstable_cache(
  async () => {
    const supabase = createServiceClient()
    const [
      { count: pendingBusinesses },
      { count: flaggedReviews },
      { count: openReports },
      { count: pendingSubscriptions },
    ] = await Promise.all([
      supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', false),
      supabase
        .from('business_reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('business_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])
    return {
      pendingBusinesses: pendingBusinesses ?? 0,
      flaggedReviews: flaggedReviews ?? 0,
      openReports: openReports ?? 0,
      pendingSubscriptions: pendingSubscriptions ?? 0,
    }
  },
  ['admin-badges'],
  { revalidate: 30, tags: ['admin-badges'] },
)

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
        <AdminSidebar counts={counts} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  )
}
