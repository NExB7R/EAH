'use client'
import { useState, useEffect } from 'react'
import EahLogo from './eah-logo'
import NeonIconButton from './neon-icon-button'
import ShareButton from './share-button'
import UserAvatar from './user-avatar'
import OverlayBlur from './overlay-blur'
import { createClient } from '@/lib/supabase-browser'
import { getDashboardPath } from '@/lib/routing'
import {
  IconKey, IconFacebook, IconWhatsapp,
  IconMenu, IconInstall, IconBolt, IconSearch,
} from './neon-icons'
import './floating-capsule.css'

const MENU_LINKS = [
  { href: '/explore', label: 'اكتشف' },
  { href: '/offers', label: 'العروض' },
  { href: '/recommend', label: 'نفسك في ايه؟' },
  { href: '/trends', label: 'الترندات' },
  { href: '/merchant/apply', label: 'سجّل متجرك' },
  { href: '/about', label: 'نبذة عننا' },
  { href: '/contact', label: 'تواصل معنا' },
  { href: '/advertise', label: 'أعلن معنا' },
  { href: '/terms', label: 'الشروط والأحكام' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
]

type CapsuleUser = {
  name: string
  points: number
  notifications: number
  role: string
  banUntil: string | null
  avatarKey: string | null
  titleKey: string | null
  frameKey: string | null
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
        if (!authUser) {
          setLoggedIn(false)
          return
        }
        setLoggedIn(true)

        const [p, r, n] = await Promise.all([
          supabase
            .from('profiles')
            .select('display_name,trust_score,banned_until,avatar_key,title_key,frame_key')
            .eq('id', authUser.id)
            .maybeSingle(),
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', authUser.id)
            .maybeSingle(),
          supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .is('read_at', null),
        ])
        if (!active) return

        setUser({
          name: p.data?.display_name ?? 'مستخدم',
          points: p.data?.trust_score ?? 0,
          banUntil: p.data?.banned_until ?? null,
          role: r.data?.role ?? 'customer',
          notifications: n.count ?? 0,
          avatarKey: p.data?.avatar_key ?? null,
          titleKey: p.data?.title_key ?? null,
          frameKey: p.data?.frame_key ?? null,
        })
      } catch {
        if (active) setLoggedIn(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const dashboardPath = user ? getDashboardPath(user.role) : '/account'

  return (
    <>
      <header className={`floating-capsule ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="floating-capsule__inner">

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
            <NeonIconButton icon={<IconInstall />} label="ثبّت" ariaLabel="تثبيت" />
            {loggedIn === false && (
              <>
                <NeonIconButton
                  icon={<IconKey />}
                  label="دخول"
                  ariaLabel="دخول"
                  href="/auth"
                />
                <NeonIconButton
                  icon={<IconBolt />}
                  label="سجل بسرعة"
                  ariaLabel="سجل بسرعة"
                  variant="accent"
                  href="/auth?tab=register"
                />
              </>
            )}
          </div>

          <div className="floating-capsule__center">
            <EahLogo size="sm" variant="mark" href="/" />
          </div>

          <div className="floating-capsule__side floating-capsule__side--end">
            <ShareButton />
            <NeonIconButton icon={<IconFacebook />} label="فيسبوك" href="#" ariaLabel="فيسبوك" />
            <NeonIconButton icon={<IconWhatsapp />} label="واتساب" href="#" ariaLabel="واتساب" />
            {loggedIn === true && (
              <UserAvatar
                name={user?.name ?? 'مستخدم'}
                points={user?.points ?? 0}
                unreadNotifications={user?.notifications ?? 0}
                banUntil={user?.banUntil ?? null}
                avatarKey={user?.avatarKey ?? null}
                frameKey={user?.frameKey ?? null}
                href={dashboardPath}
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
            >
              ×
            </button>
          </div>
          <nav className="nav-drawer__nav">
            {MENU_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-drawer__link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
