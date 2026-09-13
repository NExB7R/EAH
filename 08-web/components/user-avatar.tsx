'use client'
import { IconUser, IconBell } from './neon-icons'
import './user-avatar.css'

type UserAvatarProps = {
  name?: string
  points?: number
  avatarUrl?: string
  unreadNotifications?: number
  banUntil?: string | null
  href?: string
  onClick?: () => void
}

export default function UserAvatar({
  name = 'مستخدم',
  points = 0,
  avatarUrl,
  unreadNotifications = 0,
  banUntil = null,
  href,
  onClick,
}: UserAvatarProps) {
  const isBanned = banUntil && new Date(banUntil).getTime() > Date.now()
  const banDays = isBanned
    ? Math.ceil((new Date(banUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const initial = name.trim().charAt(0).toUpperCase()

  const inner = (
    <>
      <span className="user-avatar__img">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} />
        ) : (
          <span className="user-avatar__initial">{initial || <IconUser />}</span>
        )}
      </span>

      {!isBanned && points > 0 && (
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

  return (
    <div className="user-avatar-wrap">
      <button
        type="button"
        className="neon-icon-btn user-avatar__bell"
        aria-label="الإشعارات"
      >
        <span className="neon-icon-btn__icon" aria-hidden><IconBell /></span>
        {unreadNotifications > 0 && (
          <span className="user-avatar__badge">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>

      {href ? (
        <a href={href} className="user-avatar" aria-label={`حساب ${name}`}>
          {inner}
        </a>
      ) : (
        <button
          type="button"
          className="user-avatar"
          aria-label={`حساب ${name}`}
          onClick={onClick}
        >
          {inner}
        </button>
      )}
    </div>
  )
}
