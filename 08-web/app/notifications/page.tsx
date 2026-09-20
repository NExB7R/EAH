import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import { MarkAllReadButton, DeleteNotifButton, NotifLink } from './notif-actions'
import './notifications.css'
import EahLogo from '@/components/eah-logo'
import { IcBan, IcBell, IcStar, IcChat, IcTag, IcGift, IcCheckCircle, IcSparkles } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الإشعارات' }

type Notif = {
  id: string
  notification_type: string
  title: string | null
  body: string | null
  deep_link: string | null
  read_at: string | null
  created_at: string
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  review:       { icon: <IcStar />,         label: 'تقييم',    color: '#FBBF24' },
  reply:        { icon: <IcChat />,         label: 'رد',       color: '#A855F7' },
  offer:        { icon: <IcTag />,          label: 'عرض',      color: '#F97316' },
  system:       { icon: <IcBell />,         label: 'نظام',    color: '#6B6880' },
  ban:          { icon: <IcBan />,          label: 'حظر',      color: '#EF4444' },
  points:       { icon: <IcGift />,         label: 'نقاط',    color: '#FBBF24' },
  welcome:      { icon: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3 3 6-6 6 6 3-3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z"/>
      <path d="M3 19h18"/>
      <circle cx="12" cy="3" r="0.8" fill="currentColor"/>
    </svg>
  ), label: 'ترحيب',   color: '#E8C79A' },
  reveal:       { icon: <IcCheckCircle />,  label: 'كشف رقم', color: '#A855F7' },
  verification: { icon: <IcCheckCircle />,  label: 'توثيق',    color: '#A855F7' },
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/notifications')

  const { data } = await supabase
    .from('notifications')
    .select('id,notification_type,title,body,deep_link,read_at,created_at')
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
          <div className="nt-hero__logo">
            <EahLogo size="lg" variant="full" />
          </div>
          <h1 className="nt-hero__title e-gradient">الإشعارات</h1>
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
            <h2 className="nt-empty__title">مفيش إشعارات لسه</h2>
            <p className="nt-empty__text">لما يحصلك حاجة على EAH هتلاقيها هنا.</p>
            <Link href="/explore" className="nt-empty__cta">اكتشف الأماكن ←</Link>
          </div>
        ) : (
          <section className="nt-list">
            {list.map(n => {
              const meta = TYPE_META[n.notification_type] ?? { icon: <IcBell />, label: n.notification_type, color: '#A855F7' }
              const unread = !n.read_at
              const content = (
                <>
                  <span className="nt-item__emoji" style={{ borderColor: `${meta.color}44`, background: `${meta.color}15` }}>
                    {meta.icon}
                  </span>
                  <div className="nt-item__body">
                    <div className="nt-item__head">
                      <span className="nt-item__type" style={{ color: meta.color }}>{meta.label}</span>
                      {unread && <span className="nt-item__unread" />}
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
              if (n.deep_link) {
                return (
                  <NotifLink key={n.id} href={n.deep_link} id={n.id} unread={unread}>
                    {content}
                  </NotifLink>
                )
              }
              return (
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
