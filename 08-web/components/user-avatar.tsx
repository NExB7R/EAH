'use client'
import { IconUser, IconBell } from './neon-icons'
import { getAvatar, getFrame } from '@/lib/profile-presets'
import './user-avatar.css'

type UserAvatarProps = {
  name?: string
  points?: number
  role?: string
  avatarUrl?: string
  unreadNotifications?: number
  banUntil?: string | null
  avatarKey?: string | null
  frameKey?: string | null
  href?: string
  onClick?: () => void
}

export default function UserAvatar({
  name = 'مستخدم',
  points = 0,
  role,
  avatarUrl,
  unreadNotifications = 0,
  banUntil = null,
  avatarKey = null,
  frameKey = null,
  href,
  onClick,
}: UserAvatarProps) {
  const isBanned = !!banUntil && new Date(banUntil).getTime() > Date.now()
  const isSuperAdmin = role === 'super_admin'
  const isMerchant = role === 'merchant'
  const banDays = isBanned
    ? Math.ceil((new Date(banUntil as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const initial = name.trim().charAt(0).toUpperCase()
  const avatar = getAvatar(avatarKey)
  const frame = getFrame(frameKey)
  const frameStyle = frameKey && frameKey !== 'none'
    ? { border: `2px solid ${frame.border}`, boxShadow: `0 0 12px ${frame.glow}` }
    : undefined

  const inner = (
    <>
      {isSuperAdmin && (
        <span className="user-avatar__crown" aria-hidden>
          <svg viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ua-crown-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="45%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="ua-crown-j" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E879F9" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <path d="M1.5 14 L0.5 4.5 L5 8 L12 1 L19 8 L23.5 4.5 L22.5 14 Z"
                  fill="url(#ua-crown-g)" stroke="#FFFBEB" strokeWidth="0.5" strokeLinejoin="round" />
            <rect x="3.5" y="10.5" width="17" height="3" rx="1"
                  fill="url(#ua-crown-g)" stroke="#FFFBEB" strokeWidth="0.35" />
            <circle cx="12" cy="1.5" r="1.4" fill="url(#ua-crown-j)" />
            <circle cx="0.5" cy="4.5" r="1.1" fill="url(#ua-crown-j)" />
            <circle cx="23.5" cy="4.5" r="1.1" fill="url(#ua-crown-j)" />
            <circle cx="12" cy="12" r="0.9" fill="url(#ua-crown-j)" />
          </svg>
        </span>
      )}
      <span
        className="user-avatar__img"
        style={!avatarUrl ? { background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})` } : undefined}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} />
        ) : (
          <span className="user-avatar__initial">{initial || <IconUser />}</span>
        )}
      </span>

      {isSuperAdmin && <span className="user-avatar__super-check" aria-hidden>✓</span>}

      {!isBanned && !isSuperAdmin && points > 0 && (
        <span className="user-avatar__points" aria-label={`${points} نقطة`}>
          {points >= 1000 ? `${(points / 1000).toFixed(1)}k` : points}
        </span>
      )}

      {isBanned && (
        <span className="user-avatar__ban" aria-label={`محظور لمدة ${banDays} يوم`}>
          <span className="user-avatar__ban-icon">🚫</span>
          <span className="user-avatar__ban-days">{banDays}ي</span>
        </span>
      )}
    </>
  )

  const avatarClass = `user-avatar${isSuperAdmin ? ' user-avatar--super' : ''}`

  return (
    <div className="user-avatar-wrap">
      <a
        href="/notifications"
        className="neon-icon-btn user-avatar__bell"
        aria-label="الإشعارات"
      >
        <span className="neon-icon-btn__icon" aria-hidden><IconBell /></span>
        {unreadNotifications > 0 && (
          <span className="user-avatar__badge">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </a>

      {href ? (
        <a href={href} className={avatarClass} aria-label={`حساب ${name}`} style={frameStyle}>
          {inner}
        </a>
      ) : (
        <button
          type="button"
          className={avatarClass}
          aria-label={`حساب ${name}`}
          onClick={onClick}
          style={frameStyle}
        >
          {inner}
        </button>
      )}
      {isMerchant && <span className="user-avatar__store" aria-hidden>🏪</span>}
    </div>
  )
}
