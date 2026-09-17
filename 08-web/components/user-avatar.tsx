'use client'
import { IconUser, IconBell } from './neon-icons'
import { getAvatar, roleBadge } from '@/lib/profile-presets'
import './user-avatar.css'
import { IcBan } from '@/components/eah-icons'

type UserAvatarProps = {
  name?: string
  points?: number
  role?: string
  avatarUrl?: string
  unreadNotifications?: number
  banUntil?: string | null
  avatarKey?: string | null
  isPremium?: boolean
  verified?: boolean
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
  isPremium = false,
  verified = false,
  href,
  onClick,
}: UserAvatarProps) {
  const isBanned = !!banUntil && new Date(banUntil).getTime() > Date.now()
  const banDays = isBanned
    ? Math.ceil((new Date(banUntil as string).getTime() - Date.now()) / 86400000)
    : 0

  const badge = roleBadge(role, isPremium, verified)
  const initial = name.trim().charAt(0).toUpperCase()
  const avatar = getAvatar(avatarKey)

  const inner = (
    <>
      {badge === 'crown' && (
        <span className="user-avatar__crown" aria-hidden>
          <svg viewBox="0 0 24 16" fill="none">
            <defs>
              <linearGradient id="ua-c-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="55%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
            <path d="M1.5 14 L0.5 4.5 L5 8 L12 1 L19 8 L23.5 4.5 L22.5 14 Z"
                  fill="url(#ua-c-g)" stroke="#FFFBEB" strokeWidth="0.5" strokeLinejoin="round" />
            <rect x="3.5" y="10.5" width="17" height="3" rx="1"
                  fill="url(#ua-c-g)" stroke="#FFFBEB" strokeWidth="0.35" />
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

      {badge === 'premium' && (
        <span className="user-avatar__premium" aria-label="حساب مميز">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
            <path d="M6 3 L12 9 L18 3 L20 20 L4 20 Z"
                  fill="url(#ua-d-g)" stroke="#E9D5FF" strokeWidth="0.8" strokeLinejoin="round" />
            <defs>
              <linearGradient id="ua-d-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      )}

      {badge === 'verified' && (
        <span className="user-avatar__verified" aria-label="حساب موثق">
          <svg viewBox="0 0 24 24" width="11" height="11">
            <circle cx="12" cy="12" r="11" fill="#A855F7" />
            <path d="M7 12 L11 16 L17 9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
      )}

      {!isBanned && role !== 'super_admin' && points > 0 && (
        <span className="user-avatar__points" aria-label={`${points} نقطة`}>
          {points >= 1000 ? `${(points / 1000).toFixed(1)}k` : points}
        </span>
      )}

      {isBanned && (
        <span className="user-avatar__ban" aria-label={`محظور لمدة ${banDays} يوم`}>
          <span className="user-avatar__ban-icon"><IcBan /></span>
          <span className="user-avatar__ban-days">{banDays}ي</span>
        </span>
      )}
    </>
  )

  const avatarClass = `user-avatar${badge === 'crown' ? ' user-avatar--crown' : ''}${badge === 'premium' ? ' user-avatar--premium' : ''}`

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
        <a href={href} className={avatarClass} aria-label={`حساب ${name}`}>
          {inner}
        </a>
      ) : (
        <button type="button" className={avatarClass} aria-label={`حساب ${name}`} onClick={onClick}>
          {inner}
        </button>
      )}
    </div>
  )
}
