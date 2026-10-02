import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BellIcon, CrownGoldIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getNotifications } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import PushToggle from '@/components/push-toggle'
import { isFeatureEnabled } from '@/lib/features'
import styles from './notifications.module.css'

export default async function NotificationsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/notifications')

  const [notifications, pushOn] = await Promise.all([
    getNotifications(session.userId),
    isFeatureEnabled('push_enabled'),
  ])

  return (
    <div>
      <AccountPageHeader title="الإشعارات" description={`${notifications.length} إشعار`} />

      {pushOn && (
        <div style={{ marginBottom: 20 }}>
          <PushToggle />
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          Icon={BellIcon}
          title="مفيش إشعارات لسه"
          description="هتلاقي هنا كل الإشعارات الجديدة"
        />
      ) : (
        <ul className={styles.list}>
          {notifications.map((n) => {
            const date = new Date(n.created_at).toLocaleDateString('ar-EG')
            const unread = !n.read_at
            const isAnnouncement = n.notification_type === 'announcement'
            const cls = `${styles.card} ${unread ? styles.unread : ''} ${isAnnouncement ? styles.announcement : ''}`

            const inner = isAnnouncement ? (
              <>
                {unread && <span className={styles.announcementDot} aria-hidden />}
                <span className={styles.announcementIcon}>
                  <CrownGoldIcon size={22} />
                </span>
                <div className={styles.body}>
                  <span className={styles.announcementBadge}>
                    <CrownGoldIcon size={10} />
                    من إدارة EAH
                  </span>
                  <h3 className={styles.announcementTitle}>{n.title}</h3>
                  {n.body && <p className={styles.announcementDesc}>{n.body}</p>}
                  <div className={styles.announcementFooter}>
                    <span className={styles.announcementAuthor}>NourEldin B7R</span>
                    <span className={styles.announcementSep}>·</span>
                    <span className={styles.date}>{date}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {unread && <span className={styles.dot} aria-hidden />}
                <div className={styles.body}>
                  <h3 className={styles.title}>{n.title}</h3>
                  {n.body && <p className={styles.desc}>{n.body}</p>}
                  <span className={styles.date}>{date}</span>
                </div>
              </>
            )

            return (
              <li key={n.id} className={styles.item}>
                {n.deep_link ? (
                  <Link href={n.deep_link} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
