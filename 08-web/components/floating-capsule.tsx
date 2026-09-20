'use client'

import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import UserAvatar from './user-avatar'
import InstallPWAButton from './install-pwa-button'
import ShareButton from './share-button'
import { MI } from './neon-icons-menu'
import './drawer-icons.css'
import OverlayBlur from './overlay-blur'
import { createClient } from '@/lib/supabase-browser'
import { useUnreadCount } from '@/lib/hooks/use-unread-count'
import { IconMenu, IconBolt, IconSearch } from './neon-icons'
import { APP_VERSION_LABEL } from '@/lib/version'
import './floating-capsule.css'
import './floating-capsule-v2.css'
import './floating-capsule-drawer.css'

type CapsuleUser = {
  name: string
  points: number
  notifications: number
  role: string
  banUntil: string | null
  avatarKey: string | null
  avatarUrl: string | null | undefined
  isPremium: boolean
  verified: boolean
}

export default function FloatingCapsuleHeader() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<CapsuleUser | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const { count: liveUnread } = useUnreadCount()

  useEffect(() => {
    let frame = 0
    const update = () => {
      const revealDistance = 550  // hero section height — full header by end of hero
      const progress = Math.min(1, Math.max(0, window.scrollY / revealDistance))
      setScrollProgress(progress)
      frame = 0
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
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
        const [p, r, n, sub] = await Promise.all([
          supabase.from('profiles').select('display_name,trust_score,banned_until,avatar_key,avatar_url,verified_at').eq('id', authUser.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', authUser.id).maybeSingle(),
          supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id).is('read_at', null),
          supabase.from('business_subscriptions').select('status,expires_at').eq('owner_id', authUser.id).eq('status','active').gt('expires_at', new Date().toISOString()).limit(1).maybeSingle(),
        ])
        if (!active) return
        setUser({
          name: p.data?.display_name ?? 'مستخدم',
          points: p.data?.trust_score ?? 0,
          banUntil: p.data?.banned_until ?? null,
          role: r.data?.role ?? 'customer',
          notifications: n.count ?? 0,
          avatarKey: p.data?.avatar_key ?? null,
          avatarUrl: p.data?.avatar_url ?? undefined,
          isPremium: !!sub.data,
          verified: !!p.data?.verified_at,
        })
      } catch {
        if (active) setLoggedIn(false)
      }
    })()
    return () => { active = false }
  }, [])

  const isStaff = user && user.role === 'super_admin'
  const isMerchant = user?.role === 'merchant'
  const unread = liveUnread || (user?.notifications ?? 0)

  return (
    <>
      <header
        className={`floating-capsule ${scrollProgress > 0 ? 'is-scrolled' : ''}`}
        style={{ '--fc-scroll-progress': scrollProgress } as React.CSSProperties}
      >
        <div className="floating-capsule__inner">
          <div className="floating-capsule__side floating-capsule__side--start">
            <NeonIconButton icon={<IconMenu />} label="القائمة" ariaLabel="القائمة" onClick={() => setMenuOpen(true)} />
            <NeonIconButton icon={<IconSearch />} label="اكتشف" ariaLabel="اكتشف" href="/explore" />
          </div>

          <div className="floating-capsule__center">
            <span className="fc-logo"><EahLogo size="sm" variant="full" href="/" /></span>
          </div>

          <div className="floating-capsule__side floating-capsule__side--end">
            {loggedIn === false && (
              <NeonIconButton icon={<IconBolt />} label="سجّل" ariaLabel="سجّل" variant="accent" href="/auth" />
            )}

            <InstallPWAButton variant="compact" />
            <ShareButton />

            {loggedIn === true && user && (
              <span className="fc-user-cluster">
                <UserAvatar
                  name={user.name}
                  points={user.points}
                  role={user.role}
                  unreadNotifications={unread}
                  banUntil={user.banUntil}
                  avatarKey={user.avatarKey}
                  avatarUrl={user.avatarUrl ?? undefined}
                  isPremium={user.isPremium}
                  verified={user.verified}
                  href="/account"
                />
              </span>
            )}
          </div>
        </div>
      </header>

      <OverlayBlur open={menuOpen} />
      <div className={`nav-drawer ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen}>
        <div className="nav-drawer__panel" onClick={(e) => e.stopPropagation()}>
          <div className="nav-drawer__head">
            <EahLogo size="sm" variant="compact" href="/" />
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
                {user.role !== 'super_admin' && <span className="nav-drawer__user-points">{user.points}</span>}
              </div>
            </a>
          )}

          {loggedIn === true && (isStaff || isMerchant) && (
            <div className="nav-drawer__roles">
              {isStaff && <a href="/admin" className="nav-drawer__role nav-drawer__role--admin"><span className="nav-drawer__link-icon">{MI.shield}</span>غرفة التحكم</a>}
              {isMerchant && <a href="/merchant" className="nav-drawer__role nav-drawer__role--merchant"><span className="nav-drawer__link-icon">{MI.store}</span>متجري</a>}
              {isMerchant && <a href="/merchant/subscription" className="nav-drawer__role nav-drawer__role--merchant"><span className="nav-drawer__link-icon">{MI.subscription}</span>اشتراكي</a>}
            </div>
          )}

          <nav className="nav-drawer__group">
            <a href="/explore" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.compass}</span>اكتشف الأماكن</a>
            <a href="/offers" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.fire}</span>العروض</a>
            <a href="/recommend" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.sparkles}</span>نفسك في ايه؟</a>
            <a href="/trends" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.trending}</span>الترند</a>
          </nav>
          <div className="nav-drawer__spacer" />
          <nav className="nav-drawer__group">
            <a href="/merchant/apply" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.store}</span>سجّل نشاطك</a>
            <a href="/advertise" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.megaphone}</span>أعلن معنا</a>
            <a href="/pricing" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.tag}</span>الباقات</a>
          </nav>
          <div className="nav-drawer__spacer" />
          <nav className="nav-drawer__group">
            <a href="/about" className="nav-drawer__link"><span className="nav-drawer__link-icon">{MI.info}</span>احنا مين</a>
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
            <form
              action="/auth/logout"
              method="post"
              className="nav-drawer__logout"
              style={{ margin: 0 }}
            >
              <button type="submit">
                <span className="nav-drawer__link-icon">{MI.logout}</span>
                تسجيل خروج
              </button>
            </form>
          )}


          <div className="nav-drawer__qr">
            <span className="nav-drawer__qr-title">كيو آر EAH</span>
            <span className="nav-drawer__qr-sub">امسح الكود — شارك المنصة مع صحابك</span>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent('https://eah-sq.vercel.app')}&size=140x140&bgcolor=0A0714&color=E8C79A&margin=8`}
              alt="QR EAH"
              className="nav-drawer__qr-img"
              loading="lazy"
            />
          </div>
          <div className="nav-drawer__version" aria-hidden>
            EAH {APP_VERSION_LABEL}
          </div>
        </div>
      </div>
    </>
  )
}
