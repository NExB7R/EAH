'use client'
import { getAvatar, roleBadge } from '@/lib/profile-presets'
import './royal-avatar.css'

export default function RoyalAvatar({
  name = 'مستخدم',
  avatarKey,
  avatarUrl,
  role,
  isPremium = false,
  verified = false,
  size = 'md',
}: {
  name?: string
  avatarKey?: string | null
  avatarUrl?: string | null
  role?: string
  isPremium?: boolean
  verified?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const avatar = getAvatar(avatarKey)
  const initial = name.trim().charAt(0).toUpperCase()
  const badge = roleBadge(role, isPremium, verified)

  return (
    <div className={`ra ra--${size} ${badge ? `ra--${badge}` : ''}`}>
      {badge === 'crown' && (
        <span className="ra__crown" aria-hidden>
          <svg viewBox="0 0 48 36" fill="none">
            <defs>
              <linearGradient id="ra-c-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="55%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <filter id="ra-c-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g filter="url(#ra-c-glow)">
              <path d="M4 30 L1 10 L11 17 L24 3 L37 17 L47 10 L44 30 Z"
                    fill="url(#ra-c-g)" stroke="#FFFBEB" strokeWidth="0.9" strokeLinejoin="round"/>
              <rect x="9" y="22" width="30" height="7" rx="2.5"
                    fill="url(#ra-c-g)" stroke="#FFFBEB" strokeWidth="0.7"/>
              <circle cx="24" cy="3" r="3" fill="#E879F9" stroke="#FFFBEB" strokeWidth="0.6"/>
              <circle cx="1" cy="10" r="2.4" fill="#E879F9" stroke="#FFFBEB" strokeWidth="0.5"/>
              <circle cx="47" cy="10" r="2.4" fill="#E879F9" stroke="#FFFBEB" strokeWidth="0.5"/>
            </g>
          </svg>
        </span>
      )}

      <div
        className="ra__circle"
        style={{
          background: avatarUrl
            ? undefined
            : `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} />
        ) : (
          <span className="ra__initial">{initial}</span>
        )}
      </div>

      {badge === 'premium' && (
        <span className="ra__premium" aria-label="حساب مميز">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M6 3 L12 9 L18 3 L20 20 L4 20 Z"
                  fill="url(#ra-d-g)" stroke="#E9D5FF" strokeWidth="0.8" strokeLinejoin="round" />
            <defs>
              <linearGradient id="ra-d-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      )}

      {badge === 'verified' && (
        <span className="ra__verified" aria-label="حساب موثق">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="11" fill="#A855F7" />
            <path d="M7 12 L11 16 L17 9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
      )}
    </div>
  )
}
