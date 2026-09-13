'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import UserAvatar from './user-avatar'
import InstallPWAButton from './install-pwa-button'
import ShareButton from './share-button'
import InstallAppButton from './install-app-button'
import { MI } from './neon-icons-menu'
import './drawer-icons.css'
import './admin-icon-link.css'
import OverlayBlur from './overlay-blur'
import { createClient } from '@/lib/supabase-browser'
import { useUnreadCount } from '@/lib/hooks/use-unread-count'
import { IconFacebook, IconWhatsapp, IconMenu, IconBolt, IconSearch } from './neon-icons'
import './floating-capsule.css'

type CapsuleUser = {
  name: string
  points: number
  notifications: number
  role: string
  banUntil: string | null
  avatarKey: string | null
  frameKey: string | null
  avatarUrl: string | null | undefined
}

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

export default function FloatingCapsuleHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<CapsuleUser | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const { count: liveUnread } = useUnreadCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let active = true
    void (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!active) return
        if (!authUser) { setLoggedIn(false); return }
        setLoggedIn(true)
        const [p, r, n] = await Promise.all([
          supabase.from('profiles').select('display_name,trust_score,banned_until,avatar_key,frame_key,avatar_url').eq('id', authUser.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', authUser.id).maybeSingle(),
          supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id).is('read_at', null),
        ])
        if (!active) return
        setUser({
          name: p.data?.display_name ?? 'مستخدم',
          points: p.data?.trust_score ?? 0,
          banUntil: p.data?.banned_until ?? null,
          role: r.data?.role ?? 'customer',
          notifications: n.count ?? 0,
          avatarKey: p.data?.avatar_key ?? null,
          frameKey: p.data?.frame_key ?? null,
          avatarUrl: p.data?.avatar_url ?? undefined,
        })
      } catch {
        if (active) setLoggedIn(false)
      }
    })()
    return () => { active = false }
  }, [])

  const isStaff = user && (user.role === 'admin' || user.role === 'super_admin')
  const isMerchant = user?.role === 'merchant'

  return (
    <>
      <header className={`floating-capsule ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="floating-capsule__inner">
          <div className="floating-capsule__side floating-capsule__side--start">
            <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" onClick={() => setMenuOpen(true)} />
            <NeonIconButton icon={<IconSearch />} label="اكتشف" ariaLabel="اكتشف" href="/explore" />
          </div>
          <div className="floating-capsule__center">
            <EahLogo size="sm" variant="mark" href="/" />
          </div>
          <div className="floating-capsule__side floating-capsule__side--end">
            <span className="fc-desktop-only">
              <NeonIconButton icon={<IconChat />} label="تواصل" ariaLabel="تواصل" href="/contact" />
              <NeonIconButton icon={<IconInfo />} label="نبذة" ariaLabel="نبذة" href="/about" />
              <NeonIconButton icon={<IconFacebook />} label="فيسبوك" ariaLabel="فيسبوك" href="https://facebook.com/eah.eg" />
              <NeonIconButton icon={<IconWhatsapp />} label="واتساب" ariaLabel="واتساب" href="https://wa.me/201012892806" />
            </span>
            {loggedIn === false && (
              <NeonIconButton icon={<IconBolt />} label="سجّل" ariaLabel="سجّل" variant="accent" href="/auth" />
            )}
            <InstallPWAButton variant="compact" />
            <ShareButton />
            {loggedIn === true && (
              <UserAvatar
                name={user?.name ?? 'مستخدم'}
                points={user?.points ?? 0}
                unreadNotifications={liveUnread || (user?.notifications ?? 0)}
                banUntil={user?.banUntil ?? null}
                avatarKey={user?.avatarKey ?? null}
                frameKey={user?.frameKey ?? null}
                avatarUrl={user?.avatarUrl ?? undefined}
                href="/account"
              />
            )}
          </div>
        </div>
      </header>

      <OverlayBlur open={menuOpen} />

      <div className={`nav-drawer ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen}>
        <div className="nav-drawer__panel" onClick={(e) => e.stopPropagation()}>
          <div className="nav-drawer__head">
            <EahLogo size="sm" variant="mark" href="/" />
            <button type="button" className="nav-drawer__close" onClick={() => setMenuOpen(false)} aria-label="إغلاق">×</button>
          </div>

          {loggedIn === true && user && (
            <a href="/account" className="nav-drawer__user">
              <span className="nav-drawer__user-avatar">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} />
                ) : user.name.charAt(0).toUpperCase()}
              </span>
              <div className="nav-drawer__user-info">
                <span className="nav-drawer__user-name">{user.name}</span>
                <span className="nav-drawer__user-points">⭐ {user.points}</span>
              </div>
            </a>
          )}

          {loggedIn === true && (isStaff || isMerchant) && (
            <div className="nav-drawer__roles">
              {isStaff && <a href="/admin" className="nav-drawer__role nav-drawer__role--admin"><span className="nav-drawer__link-icon">{MI.shield}</span>غرفة التحكم</a>}
              {isMerchant && <a href="/merchant" className="nav-drawer__role nav-drawer__role--merchant"><span className="nav-drawer__link-icon">{MI.store}</span>متجري</a>}
            </div>
          )}

          <nav className="nav-drawer__group">
            <a href="/explore" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.compass}</span>اكتشف الأماكن</a>
            <a href="/offers" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.fire}</span>العروض</a>
            <a href="/recommend" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.sparkles}</span>نفسك في ايه؟</a>
            <a href="/trends" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.trending}</span>الترندات</a>
          </nav>
          <div className="nav-drawer__spacer" />
          <nav className="nav-drawer__group">
            <a href="/merchant/apply" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.store}</span>سجّل نشاطك</a>
            <a href="/advertise" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.megaphone}</span>أعلن معنا</a>
          </nav>
          <div className="nav-drawer__spacer" />
          <nav className="nav-drawer__group">
            <a href="/about" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.info}</span>نبذة عننا</a>
            <a href="/contact" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.chat}</span>تواصل معنا</a>
            <a href="https://facebook.com/eah.eg" target="_blank" rel="noreferrer" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.facebook}</span>فيسبوك</a>
            <a href="https://wa.me/201012892806" target="_blank" rel="noreferrer" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.whatsapp}</span>واتساب</a>
          </nav>
          <div className="nav-drawer__spacer" />
          <nav className="nav-drawer__group">
            <a href="/terms" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.shield}</span>الشروط والأحكام</a>
            <a href="/privacy" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.lock}</span>سياسة الخصوصية</a>
          </nav>
          <div className="nav-drawer__spacer" />
          {loggedIn === false && (
            <div className="nav-drawer__auth">
              <a href="/auth" className="nav-drawer__auth-btn"><span className="nav-drawer__link-icon">{MI.login}</span>دخول / تسجيل</a>
            </div>
          )}
          {loggedIn === true && (
            <form action="/auth/logout" method="post" className="nav-drawer__logout">
              <button type="submit"><span className="nav-drawer__link-icon">{MI.logout}</span>تسجيل خروج</button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
