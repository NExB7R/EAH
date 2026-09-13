'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import ShareButton from './share-button'
import UserAvatar from './user-avatar'
import OverlayBlur from './overlay-blur'
import { createClient } from '@/lib/supabase-browser'
import {
  IconKey, IconFacebook, IconWhatsapp,
  IconMenu, IconInstall, IconBolt, IconSearch,
} from './neon-icons'
import './floating-capsule.css'

type CapsuleUser = {
  name: string
  points: number
  notifications: number
  role: string
  banUntil: string | null
  avatarKey: string | null
  frameKey: string | null
  avatarUrl: string | null
}

export default function FloatingCapsuleHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<CapsuleUser | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

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
          supabase.from('profiles')
            .select('display_name,trust_score,banned_until,avatar_key,frame_key,avatar_url')
            .eq('id', authUser.id).maybeSingle(),
          supabase.from('user_roles')
            .select('role').eq('user_id', authUser.id).maybeSingle(),
          supabase.from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id).is('read_at', null),
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
          avatarUrl: p.data?.avatar_url ?? null,
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

          {/* RIGHT (RTL start) — Menu + Search */}
          <div className="floating-capsule__side floating-capsule__side--start">
            <NeonIconButton
              icon={<IconMenu />}
              label="القائمة"
              ariaLabel="القائمة"
              onClick={() => setMenuOpen(true)}
            />
            <NeonIconButton
              icon={<IconSearch />}
              label="اكتشف"
              ariaLabel="اكتشف"
              href="/explore"
            />
          </div>

          {/* CENTER — Logo */}
          <div className="floating-capsule__center">
            <EahLogo size="sm" variant="mark" href="/" />
          </div>

          {/* LEFT (RTL end) — Login OR Avatar */}
          <div className="floating-capsule__side floating-capsule__side--end">
            {loggedIn === false && (
              <NeonIconButton
                icon={<IconBolt />}
                label="سجّل بسرعة"
                ariaLabel="سجّل بسرعة"
                variant="accent"
                href="/auth"
              />
            )}
            {loggedIn === true && (
              <UserAvatar
                name={user?.name ?? 'مستخدم'}
                points={user?.points ?? 0}
                unreadNotifications={user?.notifications ?? 0}
                banUntil={user?.banUntil ?? null}
                avatarKey={user?.avatarKey ?? null}
                frameKey={user?.frameKey ?? null}
                avatarUrl={user?.avatarUrl ?? null}
                href="/account"
              />
            )}
          </div>

        </div>
      </header>

      <OverlayBlur open={menuOpen} />

      <div
        className={`nav-drawer ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer__panel" onClick={(e) => e.stopPropagation()}>
          <div className="nav-drawer__head">
            <EahLogo size="sm" variant="mark" href="/" />
            <button
              type="button"
              className="nav-drawer__close"
              onClick={() => setMenuOpen(false)}
              aria-label="إغلاق"
            >×</button>
          </div>

          {/* User section */}
          {loggedIn === true && user && (
            <a href="/account" className="nav-drawer__user">
              <span className="nav-drawer__user-avatar">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </span>
              <div className="nav-drawer__user-info">
                <span className="nav-drawer__user-name">{user.name}</span>
                <span className="nav-drawer__user-points">⭐ {user.points}</span>
              </div>
            </a>
          )}

          {/* Role links */}
          {loggedIn === true && (isStaff || isMerchant) && (
            <div className="nav-drawer__roles">
              {isStaff && (
                <a href="/admin" className="nav-drawer__role nav-drawer__role--admin">
                  👑 لوحة التحكم
                </a>
              )}
              {isMerchant && (
                <a href="/merchant" className="nav-drawer__role nav-drawer__role--merchant">
                  🏪 متجري
                </a>
              )}
            </div>
          )}

          {/* Main nav */}
          <nav className="nav-drawer__nav">
            <a href="/explore" className="nav-drawer__link">🔍 اكتشف</a>
            <a href="/offers" className="nav-drawer__link">🔥 العروض</a>
            <a href="/recommend" className="nav-drawer__link">✨ نفسك في ايه؟</a>
            <a href="/trends" className="nav-drawer__link">📈 الترندات</a>
            <a href="/merchant/apply" className="nav-drawer__link">🏪 سجّل متجرك</a>
            <a href="/advertise" className="nav-drawer__link">📢 أعلن معنا</a>
          </nav>

          <div className="nav-drawer__divider" />

          <nav className="nav-drawer__nav nav-drawer__nav--secondary">
            <a href="/about" className="nav-drawer__link">ℹ️ نبذة عننا</a>
            <a href="/contact" className="nav-drawer__link">💬 تواصل معنا</a>
            <a href="/terms" className="nav-drawer__link">📜 الشروط والأحكام</a>
            <a href="/privacy" className="nav-drawer__link">🔒 سياسة الخصوصية</a>
          </nav>

          {/* Social + utilities */}
          <div className="nav-drawer__social">
            <a href="https://facebook.com/eah.eg" target="_blank" rel="noreferrer" className="nav-drawer__social-btn">
              <IconFacebook /> فيسبوك
            </a>
            <a href="https://wa.me/201012892806" target="_blank" rel="noreferrer" className="nav-drawer__social-btn">
              <IconWhatsapp /> واتساب
            </a>
          </div>

          {loggedIn === false && (
            <div className="nav-drawer__auth">
              <a href="/auth" className="nav-drawer__auth-btn">⚡ دخول / تسجيل</a>
            </div>
          )}

          {loggedIn === true && (
            <form action="/auth/logout" method="post" className="nav-drawer__logout">
              <button type="submit">🚪 تسجيل خروج</button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
