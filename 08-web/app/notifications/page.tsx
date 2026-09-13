import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
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

const TYPE_META: Record<string, { emoji: string; label: string }> = {
  review:      { emoji: '✍️', label: 'تقييم' },
  reply:       { emoji: '💬', label: 'رد' },
  offer:       { emoji: '🔥', label: 'عرض' },
  system:      { emoji: '⚙️', label: 'نظام' },
  ban:         { emoji: '🚫', label: 'حظر' },
  points:      { emoji: '⭐', label: 'نقاط' },
  welcome:     { emoji: '🎉', label: 'ترحيب' },
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
            {unreadCount > 0
              ? `عندك ${unreadCount} إشعار جديد`
              : 'مفيش إشعارات جديدة'}
          </p>
        </header>

        {list.length === 0 ? (
          <div className="nt-empty">
            <span className="nt-empty__emoji">📭</span>
            <h2 className="nt-empty__title">مفيش إشعارات لسه</h2>
            <p className="nt-empty__text">لما يحصلك حاجة على EAH هتلاقيها هنا.</p>
            <Link href="/explore" className="nt-empty__cta">اكتشف الأماكن ←</Link>
          </div>
        ) : (
          <section className="nt-list">
            {list.map(n => {
              const meta = TYPE_META[n.type] ?? { emoji: '📬', label: n.type }
              const unread = !n.read_at
              const Wrapper = (n.link ? Link : 'div') as any
              const wrapperProps = n.link ? { href: n.link } : {}
              return (
                <Wrapper
                  key={n.id}
                  {...wrapperProps}
                  className={`nt-item ${unread ? 'nt-item--unread' : ''}`}
                >
                  <span className="nt-item__emoji">{meta.emoji}</span>
                  <div className="nt-item__body">
                    <div className="nt-item__head">
                      <span className="nt-item__type">{meta.label}</span>
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
                </Wrapper>
              )
            })}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
