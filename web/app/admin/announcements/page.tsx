import { createClient } from '@/lib/supabase/server'
import { BroadcastIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import type { AnnouncementRow as Row } from './types'
import AnnouncementForm from './announcement-form'
import AnnouncementRow from './announcement-row'
import styles from './announcements.module.css'

export const dynamic = 'force-dynamic'

async function getAnnouncements(): Promise<Row[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select(
      'id, title, body, theme, is_active, dismissible, link_url, link_label, starts_at, ends_at, created_at',
    )
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Row[]
}

export default async function AdminAnnouncementsPage() {
  const rows = await getAnnouncements()
  const activeCount = rows.filter((r) => r.is_active).length

  return (
    <div>
      <AccountPageHeader
        title="الإعلانات الإدارية"
        description={`${activeCount} إعلان نشط من ${rows.length}`}
      />

      <section className={styles.intro}>
        <span className={styles.introIcon}>
          <BroadcastIcon size={20} />
        </span>
        <p className={styles.introText}>
          الإعلانات بتظهر في بانر أعلى الموقع لكل الزوار. الزائر يقدر يغلقها (إلا لو خليتها
          إجبارية).
        </p>
      </section>

      <AnnouncementForm />

      {rows.length === 0 ? (
        <EmptyState
          Icon={BroadcastIcon}
          title="مفيش إعلانات"
          description="اعمل أول إعلان وهيوصل لكل المستخدمين"
        />
      ) : (
        <div className={styles.list}>
          {rows.map((row) => (
            <AnnouncementRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}
