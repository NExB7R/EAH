import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { MarkAllReadButton, DeleteNotifButton } from './notif-actions'
import './notifications.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الإشعارات | EAH' }

type Notif = {
  id: string
  type: string
  title: string | null
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

const TYPE_META: Record<string, { emoji: string; label: string; color: string }> = {
  review:       { emoji: '⭐', label: 'تقييم',   color: '#FBBF24' },
  reply:        { emoji: '💬', label: 'رد',      color: '#A855F7' },
  offer:        { emoji: '🔥', label: 'عرض',     color: '#F97316' },
  system:       { emoji: '⚙️', label: 'نظام',   color: '#6B6880' },
  ban:          { emoji: '🚫', label: 'حظر',     color: '#EF4444' },
  points:       { emoji: '⭐', label: 'نقاط',   color: '#FBBF24' },
  welcome:      { emoji: '🎉', label: 'ترحيب',  color: '#4ADE80' },
  reveal:       { emoji: '📞', label: 'كشف رقم', color: '#22C55E' },
  verification: { emoji: '✓',  label: 'توثيق',  color: '#10B981' },
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/notifications')

  const { data } = await supabase
    .from('notifications')
    .select('id,type,title,body,link,read_at,created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const list = (data ?? []) as Notif[]
  const unreadCount = list.filter(n => !n.read_at).length

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="nt">
        <header className="nt-hero">
          <div className="nt-hero__glow" aria-hidden />
          <span className="nt-hero__kicker">EAH NOTIFICATIONS</span>
          <h1 className="nt-hero__title">🔔 الإشعارات</h1>
          <p className="nt-hero__lead">
            {unreadCount > 0 ? `عندك ${unreadCount} إشعار جديد` : 'مفيش إشعارات جديدة'}
          </p>
          {unreadCount > 0 && (
            <div className="nt-hero__actions">
              <MarkAllReadButton />
            </div>
          )}
        </header>

        {list.length === 0 ? (
          <div className="nt-empty">
            <div className="nt-empty__logo">
              <EahLogo size="md" variant="mark" href="/" />
            </div>
            <h2 className="nt-empty__title">مفيش إشعارات لسه 🔔</h2>
            <p className="nt-empty__text">لما يحصلك حاجة على EAH هتلاقيها هنا.</p>
            <Link href="/explore" className="nt-empty__cta">اكتشف الأماكن ←</Link>
          </div>
        ) : (
          <section className="nt-list">
            {list.map(n => {
              const meta = TYPE_META[n.type] ?? { emoji: '📬', label: n.type, color: '#A855F7' }
              const unread = !n.read_at
              const content = (
                <>
                  <span className="nt-item__emoji" style={{ borderColor: `${meta.color}44`, background: `${meta.color}15` }}>
                    {meta.emoji}
                  </span>
                  <div className="nt-item__body">
                    <div className="nt-item__head">
                      <span className="nt-item__type" style={{ color: meta.color }}>{meta.label}</span>
                      {unread && <span className="nt-item__dot" />}
                    </div>
                    {n.title && <span className="nt-item__title">{n.title}</span>}
                    {n.body && <p className="nt-item__text">{n.body}</p>}
                    <span className="nt-item__time">
                      {new Date(n.created_at).toLocaleString('ar-EG', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <DeleteNotifButton id={n.id} />
                </>
              )
              return n.link ? (
                <Link key={n.id} href={n.link} className={`nt-item ${unread ? 'nt-item--unread' : ''}`}>
                  {content}
                </Link>
              ) : (
                <div key={n.id} className={`nt-item ${unread ? 'nt-item--unread' : ''}`}>
                  {content}
                </div>
              )
            })}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
