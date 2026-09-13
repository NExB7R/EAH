'use client'
import { getAvatar, getFrame } from '@/lib/profile-presets'
import VerifiedBadge from './verified-badge'
import './royal-avatar.css'

export default function RoyalAvatar({
  name = 'مستخدم',
  avatarKey,
  frameKey,
  avatarUrl,
  role,
  verified = false,
  size = 'md',
}: {
  name?: string
  avatarKey?: string | null
  frameKey?: string | null
  avatarUrl?: string | null
  role?: string
  verified?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const avatar = getAvatar(avatarKey)
  const frame = getFrame(frameKey)
  const initial = name.trim().charAt(0).toUpperCase()
  const isSuperAdmin = role === 'super_admin'
  const isAdmin = role === 'admin'
  const isMerchant = role === 'merchant'

  const frameStyle = frameKey && frameKey !== 'none' && !isSuperAdmin && !isAdmin && !isMerchant
    ? { border: `3px solid ${frame.border}`, boxShadow: `0 0 24px ${frame.glow}` }
    : undefined

  return (
    <div className={`ra ra--${size} ${isSuperAdmin ? 'ra--super' : ''} ${isAdmin ? 'ra--admin' : ''} ${isMerchant ? 'ra--merchant' : ''}`}>
      {/* Royal crown for SUPER admin only */}
      {isSuperAdmin && (
        <span className="ra__crown" aria-hidden>
          <svg viewBox="0 0 40 32" fill="none">
            <defs>
              <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="30%" stopColor="#FBBF24" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <path
              d="M4 26 L2 10 L11 16 L20 4 L29 16 L38 10 L36 26 Z"
              fill="url(#crownGrad)"
              stroke="#F5F3FF"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <circle cx="2" cy="10" r="2" fill="#FBBF24" />
            <circle cx="20" cy="4" r="2.5" fill="#FBBF24" />
            <circle cx="38" cy="10" r="2" fill="#FBBF24" />
          </svg>
        </span>
      )}

      {/* Decorative stars for super admin */}
      {isSuperAdmin && (
        <>
          <span className="ra__star ra__star--1">✦</span>
          <span className="ra__star ra__star--2">✦</span>
        </>
      )}

      <div
        className="ra__circle"
        style={{
          background: avatarUrl
            ? undefined
            : isAdmin
            ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
            : isMerchant
            ? 'linear-gradient(135deg, #10B981, #F59E0B)'
            : `linear-gradient(135deg, ${avatar.from}, ${avatar.to})`,
          ...(frameStyle ?? {}),
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} />
        ) : (
          <span className="ra__initial">{initial}</span>
        )}
      </div>

      {/* Store badge for merchant */}
      {isMerchant && !isAdmin && <span className="ra__store" aria-hidden>🏪</span>}

      {/* Verified badge */}
      {verified && (
        <span className="ra__verified">
          <VerifiedBadge size="sm" />
        </span>
      )}
    </div>
  )
}
