import { createClient } from '@/lib/supabase/server'
import { BellIcon, BroadcastIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { getAudienceCounts } from '@/lib/data/admin'
import type { AnnouncementRow as Row } from '../announcements/types'
import AnnouncementForm from '../announcements/announcement-form'
import AnnouncementRow from '../announcements/announcement-row'
import Composer from './composer'
import NotificationsTabs from './notifications-tabs'
import HistoryList, { type HistoryItem } from './history-list'
import notifStyles from './notifications.module.css'
import annStyles from '../announcements/announcements.module.css'

export const dynamic = 'force-dynamic'

type SearchParams = { tab?: string }

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

async function getBroadcastHistory(): Promise<HistoryItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, created_at, metadata, actor_user_id')
    .eq('action', 'notifications.broadcast')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !data || data.length === 0) return []

  const actorIds = Array.from(
    new Set(data.map((l) => l.actor_user_id).filter((x): x is string => !!x)),
  )
  const { data: profiles } = actorIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', actorIds)
    : { data: [] as { id: string; display_name: string }[] }
  const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]))

  return data.map((l) => {
    const m = (l.metadata ?? {}) as Record<string, unknown>
    return {
      id: l.id as string,
      created_at: l.created_at as string,
      actor_name: l.actor_user_id ? (names.get(l.actor_user_id as string) ?? '—') : 'نظام',
      audience: String(m.audience ?? '—'),
      title: String(m.title ?? '—'),
      inserted: Number(m.inserted ?? 0),
      pushed: Number(m.pushed ?? 0),
      total: Number(m.total_target ?? 0),
    }
  })
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tab =
    params.tab === 'announcements' ? 'announcements' : params.tab === 'history' ? 'history' : 'send'

  // ─── Tab: Send notification ───
  if (tab === 'send') {
    const audiences = await getAudienceCounts()
    return (
      <div>
        <AccountPageHeader
          title="الإشعارات والرسائل"
          description="ابعت إشعار لمستخدمين أو اعمل إعلان إداري"
        />

        <NotificationsTabs />

        <section className={notifStyles.intro}>
          <span className={notifStyles.introIcon}>
            <BellIcon size={20} />
          </span>
          <p className={notifStyles.introText}>
            الرسالة توصل في صفحة الإشعارات + Push فوري للمتصفح (لو مفعّل عند المستخدم).
          </p>
        </section>

        <Composer audiences={audiences} />
      </div>
    )
  }

  // ─── Tab: History ───
  if (tab === 'history') {
    const items = await getBroadcastHistory()
    return (
      <div>
        <AccountPageHeader title="الإشعارات والرسائل" description={`${items.length} إشعار مرسل`} />
        <NotificationsTabs />
        <HistoryList items={items} />
      </div>
    )
  }

  // ─── Tab: Announcements ───
  const rows = await getAnnouncements()
  const activeCount = rows.filter((r) => r.is_active).length

  return (
    <div>
      <AccountPageHeader
        title="الإشعارات والرسائل"
        description={`${activeCount} إعلان نشط من ${rows.length}`}
      />

      <NotificationsTabs />

      <section className={annStyles.intro}>
        <span className={annStyles.introIcon}>
          <BroadcastIcon size={20} />
        </span>
        <p className={annStyles.introText}>
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
        <div className={annStyles.list}>
          {rows.map((row) => (
            <AnnouncementRow key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}
